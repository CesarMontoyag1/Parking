'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase/client';

type RoleState = 'loading' | 'admin' | 'vigilante' | 'none';

export default function PanelHomePage() {
  const router = useRouter();
  const [roleState, setRoleState] = useState<RoleState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRole = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError || !session) {
        setRoleState('none');
        return;
      }

      const { data, error } = await supabase
        .from('tenant_users')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('active', true);

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
        setRoleState('none');
        return;
      }

      const hasAdmin = data?.some((entry) => entry.role === 'admin');
      const hasVigilante = data?.some((entry) => entry.role === 'vigilante');

      if (hasAdmin) {
        setRoleState('admin');
        router.replace('/panel/admin');
        return;
      }

      if (hasVigilante) {
        setRoleState('vigilante');
        router.replace('/panel/vigilante');
        return;
      }

      setRoleState('none');
    };

    void loadRole();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <section className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-3xl border border-white/10 bg-white/5 p-10">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-400">Panel</p>
        <h1 className="text-4xl font-black uppercase">Cargando tu espacio de trabajo...</h1>

        {roleState === 'loading' && (
          <p className="text-gray-300">Estamos validando tu sesion y permisos para abrir tu vista principal.</p>
        )}

        {roleState === 'none' && (
          <div className="space-y-4 text-gray-300">
            <p>No encontramos un rol operativo en ninguna sede para este usuario.</p>
            <p>Inicia sesion con un admin o pide acceso a una sede.</p>
            <Link
              href="/"
              className="inline-flex border border-white px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] transition hover:bg-white hover:text-black"
            >
              Volver al inicio
            </Link>
          </div>
        )}

        {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
      </div>
    </section>
  );
}
