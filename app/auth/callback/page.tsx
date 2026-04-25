'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { bootstrapAdminSession } from '../../../lib/supabase/bootstrap';

type StoredBootstrapData = {
  accountName?: string;
  tenantName?: string;
};

export default function AuthCallbackPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const resolveOAuth = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const code = currentUrl.searchParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          throw new Error('No se pudo recuperar la sesión después de autenticación.');
        }

        const stored = localStorage.getItem('nextpark_trial_bootstrap');
        let bootstrapData: StoredBootstrapData | undefined;

        if (stored) {
          bootstrapData = JSON.parse(stored) as StoredBootstrapData;
          localStorage.removeItem('nextpark_trial_bootstrap');
        }

        const profileName =
          (session.user.user_metadata?.full_name as string | undefined) ||
          (session.user.user_metadata?.name as string | undefined) ||
          'Mi empresa';

        const finalAccountName = bootstrapData?.accountName?.trim() || `${profileName} Parking`;
        const finalTenantName = bootstrapData?.tenantName?.trim() || 'Sede principal';

        await bootstrapAdminSession(session.access_token, {
          accountName: finalAccountName,
          tenantName: finalTenantName,
        });

        window.location.href = '/panel';
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Error al completar la autenticación.');
      }
    };

    void resolveOAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-400">Autenticación</p>
        <h1 className="mt-4 text-3xl font-black uppercase">Validando tu acceso</h1>
        <p className="mt-4 text-gray-300">Espera un momento mientras preparamos tu panel principal.</p>
        {errorMessage && <p className="mt-6 text-sm text-red-400">{errorMessage}</p>}
      </div>
    </section>
  );
}
