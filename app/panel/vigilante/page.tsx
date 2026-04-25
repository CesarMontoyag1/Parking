'use client';

import Link from 'next/link';

export default function VigilantePanelPage() {
  return (
    <section className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-10">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-400">Panel Vigilante</p>
        <h1 className="mt-4 text-4xl font-black uppercase">Operación en tiempo real</h1>
        <p className="mt-6 max-w-2xl text-gray-300">
          Desde esta vista podrás registrar entradas y salidas, consultar disponibilidad de celdas y completar
          cobros del turno.
        </p>

        <div className="mt-8 flex gap-4">
          <button className="border border-white px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] transition hover:bg-white hover:text-black">
            Registrar entrada
          </button>
          <button className="border border-white px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] transition hover:bg-white hover:text-black">
            Registrar salida
          </button>
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex border border-white/40 px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-gray-300 transition hover:border-white hover:text-white"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
