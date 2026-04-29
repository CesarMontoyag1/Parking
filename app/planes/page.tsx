//Pagina base de planes 
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function PlanesPage() {
  return (
    <div className={`min-h-screen bg-black text-white ${orbitron.className}`}>
      <section className="container mx-auto flex flex-col gap-12 px-8 py-20">
        <header className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-gray-400">Planes</p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">
            Elige tu plan NextPark
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-300">
            Empieza con 3 días gratis y luego activa el plan ideal para tu operación.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-black uppercase">Básico</h2>
            <p className="mt-3 text-gray-300">Operación esencial para una sede.</p>
            <ul className="mt-6 space-y-3 text-gray-300">
              <li>Entradas y salidas en tiempo real.</li>
              <li>Disponibilidad por nivel.</li>
              <li>Dashboard básico.</li>
            </ul>
            <button className="mt-8 w-full border border-white px-6 py-3 text-sm font-bold tracking-widest transition-colors hover:bg-white hover:text-black">
              CONTINUAR CON PAGO
            </button>
          </div>

          <div className="rounded-3xl border border-white bg-white/10 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-300">Más popular</p>
            <h2 className="mt-3 text-2xl font-black uppercase">Pro</h2>
            <p className="mt-3 text-gray-300">Escala con analítica y multi-sede.</p>
            <ul className="mt-6 space-y-3 text-gray-200">
              <li>Multi-sede y roles avanzados.</li>
              <li>Reportes por periodos.</li>
              <li>Notificaciones inteligentes.</li>
            </ul>
            <button className="mt-8 w-full border border-white px-6 py-3 text-sm font-bold tracking-widest transition-colors hover:bg-white hover:text-black">
              CONTINUAR CON PAGO
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-black uppercase">Premium</h2>
            <p className="mt-3 text-gray-300">IA generativa y analítica avanzada.</p>
            <ul className="mt-6 space-y-3 text-gray-300">
              <li>Recomendaciones con IA.</li>
              <li>Predicción de demanda.</li>
              <li>Reportes anuales.</li>
            </ul>
            <button className="mt-8 w-full border border-white px-6 py-3 text-sm font-bold tracking-widest transition-colors hover:bg-white hover:text-black">
              CONTINUAR CON PAGO
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
