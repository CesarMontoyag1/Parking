'use client';

import { useEffect } from 'react';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
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
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400">Acceso</p>
            <h3 className="mt-3 text-2xl font-black uppercase">Iniciar sesion</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-gray-300 transition hover:border-white/70 hover:text-white"
          >
            Cerrar
          </button>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            Usuario
            <input
              className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-white/60 focus:outline-none"
              type="text"
              name="username"
              placeholder="Tu usuario"
              autoComplete="username"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            Contrasena
            <input
              className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-white/60 focus:outline-none"
              type="password"
              name="password"
              placeholder="Tu contrasena"
              autoComplete="current-password"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl border border-white/60 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.3em] text-black transition hover:bg-transparent hover:text-white"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-gray-500">
          Acceso protegido para clientes empresariales.
        </p>
      </div>
    </div>
  );
}
