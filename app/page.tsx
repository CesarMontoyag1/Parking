import { Orbitron } from 'next/font/google';
import VideoCarousel from './components/VideoCarousel';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function Home() {
  // Lista de videos para el carrusel automático (sin interacción manual)
  const videos = [
    { id: 1, title: "DRONE VIEW", url: "/videos/ferrari_parking.mp4", label: "Vista Aérea" },
    { id: 2, title: "ROBOT ACTION", url: "/videos/ferrari_salida.mp4", label: "Automatización" },
  ];

  return (
      <div className={`bg-black text-white ${orbitron.className}`}>

        {/* SECCIÓN HERO - Estilo Ferrari */}
        <section id="inicio" className="relative h-screen w-full overflow-hidden">
          <VideoCarousel videos={videos} />

          {/* Overlay Gradiente para mejorar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          {/* Contenido Hero */}
          <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-10">
            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tighter md:text-6xl">
              SISTEMA DE GESTION DE PARQUEADEROS <br />
            </h1>
            <p className="mt-8 max-w-xl text-lg font-light tracking-widest text-gray-300">
              NextPark: TU ESPACIO URBANO, OPTIMIZADO PARA EL MAÑANA.
            </p>

            <div className="mt-12">
              <button className="group relative overflow-hidden border border-white px-10 py-4 transition-all hover:bg-white">
              <span className="relative z-10 text-sm font-bold tracking-widest group-hover:text-black">
                EXPLORAR SOLUCIONES
              </span>
              </button>
            </div>
          </div>


          {/* Indicador de Scroll */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* SECCIÓN QUIÉNES SOMOS - Contraste Blanco */}
        <section id="nosotros" className="bg-white py-32 text-black">
          <div className="container mx-auto grid grid-cols-1 gap-16 px-8 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-bold tracking-[0.4em] text-gray-500 uppercase">Innovación</h2>
              <h3 className="mt-4 text-4xl font-black md:text-6xl uppercase leading-none">
                Ingeniería <br /> de precisión <br /> en cada plaza.
              </h3>
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-xl leading-relaxed text-gray-800">
                En <strong>NextPark</strong>, no solo gestionamos espacios; diseñamos flujos urbanos inteligentes.
                Utilizando algoritmos de alta disponibilidad y arquitecturas distribuidas, garantizamos que el
                acceso a tu destino sea la parte más rápida de tu viaje.
              </p>
              <div className="mt-8 h-1 w-20 bg-black" />
            </div>
          </div>
        </section>

        {/* FOOTER SIMPLE */}
        <footer className="border-t border-white/10 py-10 text-center text-[10px] tracking-[0.3em] text-gray-500">
          © 2026 NEXTPARK SYSTEMS ENGINE. TODOS LOS DERECHOS RESERVADOS.
        </footer>
      </div>
  );
}