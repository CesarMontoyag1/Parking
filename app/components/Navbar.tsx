'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Orbitron } from 'next/font/google';
import LoginModal from './LoginModal';
import { supabase } from '../../lib/supabase/client';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

type RoleState = 'admin' | 'vigilante' | 'none';

export default function Navbar() {
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<RoleState>('none');
  const isAppArea = pathname.startsWith('/panel');

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
        setIsAuthenticated(false);
        setRole('none');
        return;
      }

      setIsAuthenticated(true);

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
        setIsAuthenticated(false);
        setRole('none');
        return;
      }

      setIsAuthenticated(true);

      const { data } = await supabase
        .from('tenant_users')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('active', true);

      if (data?.some((entry) => entry.role === 'admin')) {
        setRole('admin');
      } else if (data?.some((entry) => entry.role === 'vigilante')) {
        setRole('vigilante');
      } else {
        setRole('none');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setRole('none');
    window.location.href = '/';
  };

  return (
    <>
      <nav className={`${orbitron.className} sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md`}>
        {/* Layout fijo para reutilizar la navegación en todo el sitio */}
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/#inicio" className="text-lg font-bold tracking-widest text-gray-300">
            NextPark
          </Link>

          {!isAppArea ? (
            <>
              <div className="hidden space-x-8 md:flex">
                <Link href="/#inicio" className="text-sm font-medium transition-colors hover:text-gray-400">
                  Inicio
                </Link>
                <Link href="/#nosotros" className="text-sm font-medium transition-colors hover:text-gray-400">
                  Quiénes Somos
                </Link>
                <Link href="/#descripcion" className="text-sm font-medium transition-colors hover:text-gray-400">
                  Descripción
                </Link>
                <Link href="/#unetenos" className="text-sm font-medium transition-colors hover:text-gray-400">
                  Únetenos
                </Link>
              </div>

              <div className="flex space-x-4">
                {!isAuthenticated ? (
                  <button
                    className="rounded-md border border-white px-5 py-2 text-sm font-medium transition-colors hover:bg-white hover:text-black"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Ingresar
                  </button>
                ) : (
                  <>
                    <Link
                      href="/panel"
                      className="rounded-md border border-white px-5 py-2 text-sm font-medium transition-colors hover:bg-white hover:text-black"
                    >
                      Abrir app
                    </Link>
                    <button
                      className="rounded-md border border-white/40 px-5 py-2 text-sm font-medium transition-colors hover:border-white"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="hidden space-x-8 md:flex">
                <Link href="/panel" className="text-sm font-medium transition-colors hover:text-gray-400">
                  Inicio App
                </Link>
                {role === 'admin' && (
                  <Link href="/panel/admin" className="text-sm font-medium transition-colors hover:text-gray-400">
                    Administración
                  </Link>
                )}
                {role === 'vigilante' && (
                  <Link href="/panel/vigilante" className="text-sm font-medium transition-colors hover:text-gray-400">
                    Operación
                  </Link>
                )}
                <Link href="/planes" className="text-sm font-medium transition-colors hover:text-gray-400">
                  Planes
                </Link>
              </div>

              <div className="flex space-x-4">
                <button
                  className="rounded-md border border-white px-5 py-2 text-sm font-medium transition-colors hover:bg-white hover:text-black"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthSuccess={() => {
          window.location.href = '/panel';
        }}
      />
    </>
  );
}
