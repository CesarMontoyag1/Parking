'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Orbitron } from 'next/font/google';
import LoginModal from './LoginModal';
import { supabase } from '../../lib/supabase/client';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function Navbar() {
  const pathname = usePathname();
  const shouldHideNavbar = pathname.startsWith('/panel');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        return;
      }

      setIsAuthenticated(true);
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
        return;
      }

      setIsAuthenticated(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  // La experiencia de panel tiene navegación propia; ocultamos el navbar informativo.
  if (shouldHideNavbar) {
    return null;
  }

  return (
    <>
      <nav className={`${orbitron.className} sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md`}>
        {/* Layout fijo para reutilizar la navegación en todo el sitio */}
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/#inicio" className="text-lg font-bold tracking-widest text-gray-300">
            NextPark
          </Link>

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
              <button
                className="rounded-md border border-white/40 px-5 py-2 text-sm font-medium transition-colors hover:border-white"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            )}
          </div>
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
