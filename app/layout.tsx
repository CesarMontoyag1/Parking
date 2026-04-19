// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css' // Asegúrate de tener Tailwind configurado aquí
import Navbar from './components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NextPark | Tu solución de parqueo',
  description: 'Plataforma avanzada para la gestión de parqueaderos urbanos.',
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
      <html lang="es" className="scroll-smooth">
      {/* Aplicamos el fondo negro y texto blanco por defecto */}
      <body className={`${inter.className} bg-black text-white antialiased`}>

      <Navbar />

      {/* Contenido dinámico de las páginas */}
      <main className="min-h-screen">
        {children}
      </main>

      </body>
      </html>
  )
}