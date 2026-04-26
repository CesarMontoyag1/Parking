'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Orbitron } from 'next/font/google';
import { supabase } from '../../lib/supabase/client';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

type RoleState = 'admin' | 'vigilante' | 'none';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<RoleState>('none');
  const [displayName, setDisplayName] = useState('Usuario');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!session) {
        window.location.href = '/';
        return;
      }

      setDisplayName(
        (session.user.user_metadata?.full_name as string) ||
          (session.user.user_metadata?.name as string) ||
          session.user.email ||
          'Usuario'
      );
      setEmail(session.user.email || '');

      const { data } = await supabase
        .from('tenant_users')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('active', true);

      if (!isMounted) {
        return;
      }

      if (data?.some((entry) => entry.role === 'admin')) {
        setRole('admin');
      } else if (data?.some((entry) => entry.role === 'vigilante')) {
        setRole('vigilante');
      } else {
        setRole('none');
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) {
        return;
      }

      if (!session) {
        window.location.href = '/';
        return;
      }

      setDisplayName(
        (session.user.user_metadata?.full_name as string) ||
          (session.user.user_metadata?.name as string) ||
          session.user.email ||
          'Usuario'
      );
      setEmail(session.user.email || '');
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const initial = useMemo(() => displayName.charAt(0).toUpperCase(), [displayName]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-gray-100 to-gray-200 text-black">
      <header className={`${orbitron.className} sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur-md`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/panel" className="text-xl font-black tracking-widest text-black">
              NextPark
            </Link>
            <span className="hidden rounded-full border border-black/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600 md:inline-flex">
              Aplicación
            </span>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <Link
              href="/panel"
              className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] transition ${
                pathname === '/panel' ? 'border-black bg-black text-white' : 'border-black/15 bg-white text-black hover:border-black/40'
              }`}
            >
              Inicio
            </Link>
            {role === 'admin' && (
              <Link
                href="/panel/admin"
                className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] transition ${
                  pathname.startsWith('/panel/admin') ? 'border-black bg-black text-white' : 'border-black/15 bg-white text-black hover:border-black/40'
                }`}
              >
                Administración
              </Link>
            )}
            {role === 'vigilante' && (
              <Link
                href="/panel/vigilante"
                className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] transition ${
                  pathname.startsWith('/panel/vigilante') ? 'border-black bg-black text-white' : 'border-black/15 bg-white text-black hover:border-black/40'
                }`}
              >
                Operación
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 bg-black text-sm font-black text-white">
                {initial || 'U'}
              </div>
              <div className="leading-tight">
                <p className="max-w-[180px] truncate text-xs font-bold uppercase tracking-[0.15em] text-black">{displayName}</p>
                <p className="max-w-[180px] truncate text-[11px] text-gray-600">{email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-black/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:border-black"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
    </section>
  );
}

