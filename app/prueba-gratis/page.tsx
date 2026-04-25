'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { bootstrapAdminSession } from '../../lib/supabase/bootstrap';

export default function PruebaGratisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [tenantName, setTenantName] = useState('');

  const handleEmailSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('fullName') || '').trim();
    const submittedAccountName = String(formData.get('accountName') || '').trim();
    const submittedTenantName = String(formData.get('tenantName') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');

    if (password.length < 8) {
      setIsLoading(false);
      setErrorMessage('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setIsLoading(false);
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(now.getDate() + 3);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || null,
          trial_plan: 'trial_3_days',
          trial_start: now.toISOString(),
          trial_end: trialEnd.toISOString(),
        },
      },
    });

    if (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
      return;
    }

    if (!data.session?.access_token) {
      setIsLoading(false);
      setSuccessMessage('Cuenta creada. Revisa tu correo para confirmar el acceso e iniciar tu prueba gratis.');
      return;
    }

    try {
      await bootstrapAdminSession(data.session.access_token, {
        accountName: submittedAccountName || 'Mi empresa',
        tenantName: submittedTenantName || 'Sede principal',
      });
    } catch (bootstrapError) {
      setIsLoading(false);
      setErrorMessage(bootstrapError instanceof Error ? bootstrapError.message : 'Error inicializando la cuenta.');
      return;
    }

    setIsLoading(false);
    window.location.href = '/panel';
  };

  const handleGoogleSignup = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const sanitizedAccountName = accountName.trim();
    const sanitizedTenantName = tenantName.trim();

    localStorage.setItem(
      'nextpark_trial_bootstrap',
      JSON.stringify({
        accountName: sanitizedAccountName || null,
        tenantName: sanitizedTenantName || null,
      })
    );

    const redirectTo = `${window.location.origin}/auth/callback?trial=1`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-gray-100 to-gray-200 px-6 py-16 text-black">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_1fr]">
        <article className="rounded-3xl border border-gray-200 bg-white p-10 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-500">Prueba gratis</p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-tight text-black md:text-5xl">
            Empieza hoy y activa tu cuenta en minutos
          </h1>
          <p className="mt-6 text-lg text-gray-700">
            NextPark te da 3 días para probar toda la experiencia: panel administrativo, control operativo y
            creación de usuarios vigilantes.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">Configuración rápida</p>
              <p className="mt-3 text-sm text-gray-700">Tu empresa y sede inicial se crean automáticamente.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">Datos editables</p>
              <p className="mt-3 text-sm text-gray-700">Puedes ajustar nombre de empresa y sede desde el panel.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">Sin tarjeta</p>
              <p className="mt-3 text-sm text-gray-700">Comienzas la prueba sin pedir método de pago.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">Acceso inmediato</p>
              <p className="mt-3 text-sm text-gray-700">Entra por correo o con Google en un solo paso.</p>
            </div>
          </div>

          <Link
            href="/"
            className="mt-10 inline-flex border border-black px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-black transition hover:bg-black hover:text-white"
          >
            Volver al inicio
          </Link>
        </article>

        <div className="rounded-3xl border border-white/10 bg-black p-8 text-white shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-400">Crear cuenta</p>
          <h2 className="mt-4 text-3xl font-black uppercase leading-tight">Activa tu prueba de 3 días</h2>
          <p className="mt-4 text-sm text-gray-300">Formulario simple, claro y profesional.</p>

          <form className="mt-8 space-y-4" onSubmit={handleEmailSignup}>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Opcional (editable después)</p>
            <input
              name="fullName"
              type="text"
              placeholder="Nombre completo"
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm focus:border-white/60 focus:outline-none"
            />
            <input
              name="accountName"
              type="text"
              placeholder="Nombre de la empresa (opcional)"
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm focus:border-white/60 focus:outline-none"
            />
            <input
              name="tenantName"
              type="text"
              placeholder="Nombre de la sede principal (opcional)"
              value={tenantName}
              onChange={(event) => setTenantName(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm focus:border-white/60 focus:outline-none"
            />
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Obligatorio para crear cuenta</p>
            <input
              name="email"
              type="email"
              placeholder="Correo empresarial"
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm focus:border-white/60 focus:outline-none"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="password"
                type="password"
                placeholder="Contraseña"
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm focus:border-white/60 focus:outline-none"
                required
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirmar contraseña"
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm focus:border-white/60 focus:outline-none"
                required
              />
            </div>

            {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
            {successMessage && <p className="text-sm text-green-400">{successMessage}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl border border-white bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-black transition hover:bg-transparent hover:text-white disabled:opacity-60"
            >
              {isLoading ? 'Procesando...' : 'Crear cuenta con correo'}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignup}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/25 bg-black px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:border-white disabled:opacity-60"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M21.35 12.27c0-.79-.07-1.54-.21-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.13c1.83-1.68 2.93-4.16 2.93-7.4z" fill="#4285F4" />
                <path d="M12 21.75c2.62 0 4.82-.87 6.43-2.35l-3.13-2.44c-.87.58-1.98.93-3.3.93-2.53 0-4.67-1.71-5.43-4H3.33v2.51A9.74 9.74 0 0 0 12 21.75z" fill="#34A853" />
                <path d="M6.57 13.89A5.85 5.85 0 0 1 6.26 12c0-.66.11-1.31.31-1.89V7.6H3.33A9.74 9.74 0 0 0 2.25 12c0 1.56.37 3.04 1.08 4.4l3.24-2.51z" fill="#FBBC05" />
                <path d="M12 6.11c1.43 0 2.7.49 3.71 1.45l2.78-2.78A9.3 9.3 0 0 0 12 2.25 9.74 9.74 0 0 0 3.33 7.6l3.24 2.51c.76-2.29 2.9-4 5.43-4z" fill="#EA4335" />
              </svg>
              {isLoading ? 'Redirigiendo...' : 'Continuar con Google'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
