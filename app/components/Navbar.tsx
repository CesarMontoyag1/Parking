'use client';

import { useState } from 'react';
import { Orbitron } from 'next/font/google';
import LoginModal from './LoginModal';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
        {/* Layout fijo para reutilizar la navegación en todo el sitio */}
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className={`${orbitron.className} text-lg font-light tracking-widest text-gray-300`}>
            NextPark
          </div>

          <div className="hidden space-x-8 md:flex">
            <a href="#inicio" className="text-sm font-medium transition-colors hover:text-gray-400">
              Inicio
            </a>
            <a href="#nosotros" className="text-sm font-medium transition-colors hover:text-gray-400">
              Quiénes Somos
            </a>
            <a href="#descripcion" className="text-sm font-medium transition-colors hover:text-gray-400">
              Descripción
            </a>
          </div>

          <div className="flex space-x-4">
            <button
              className="rounded-md border border-white px-5 py-2 text-sm font-medium transition-colors hover:bg-white hover:text-black"
              onClick={() => setIsLoginOpen(true)}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
