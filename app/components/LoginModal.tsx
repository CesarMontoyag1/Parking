'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase/client';
import { bootstrapAdminSession } from '../../lib/supabase/bootstrap';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
};

export default function LoginModal({ isOpen, onClose, onAuthSuccess }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
      return;
    }

    try {
      if (data.session?.access_token) {
        await bootstrapAdminSession(data.session.access_token);
      }
    } catch (bootstrapError) {
      setIsLoading(false);
      setErrorMessage(bootstrapError instanceof Error ? bootstrapError.message : 'Error inicializando cuenta.');
      return;
    }

    setIsLoading(false);
    onAuthSuccess?.();
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback`;
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
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Inicio de sesion"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/90 p-8 text-white shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400">NextPark</p>
            <h3 className="mt-3 text-2xl font-black uppercase">Iniciar sesión</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-gray-300 transition hover:border-white/70 hover:text-white"
          >
            Cerrar
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            Correo
            <input
              className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-white/60 focus:outline-none"
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            Contrasena
            <input
              className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-white/60 focus:outline-none"
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl border border-white/60 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.3em] text-black transition hover:bg-transparent hover:text-white"
          >
            {isLoading ? 'Procesando...' : 'Entrar'}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full rounded-xl border border-white/20 bg-black px-5 py-3 text-sm font-bold uppercase tracking-[0.25em] text-white transition hover:border-white"
          >
            Continuar con Google
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              window.location.href = '/prueba-gratis';
            }}
            className="w-full text-center text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 transition hover:text-white"
          >
            Crear cuenta de prueba
          </button>
        </form>
      </div>
    </div>
  );
}
