'use client';

import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function VigilantePanelPage() {
  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">Terminal Operativa</p>
        <h1 className={`${orbitron.className} text-5xl font-black uppercase tracking-tighter text-black`}>
          Control de <br /> Campo.
        </h1>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* REGISTRO DE ENTRADA */}
        <button className="group relative overflow-hidden rounded-[2.5rem] bg-black p-10 text-left transition-all hover:scale-[1.02] shadow-2xl">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Punto de Control 01</p>
          <span className={`${orbitron.className} text-3xl font-black text-white uppercase`}>Entrada</span>
          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-4">Asignar celda y placa</p>
          <div className="absolute -right-4 -bottom-6 text-9xl font-black text-white/5 transition-all group-hover:text-white/10">IN</div>
        </button>

        {/* REGISTRO DE SALIDA */}
        <button className="group relative overflow-hidden rounded-[2.5rem] bg-white border-2 border-black p-10 text-left transition-all hover:scale-[1.02] shadow-lg">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Punto de Control 02</p>
          <span className={`${orbitron.className} text-3xl font-black text-black uppercase`}>Salida</span>
          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-4">Liquidación de tiempo</p>
          <div className="absolute -right-4 -bottom-6 text-9xl font-black text-black/5 transition-all group-hover:text-black/[0.08]">OUT</div>
        </button>

        {/* ESTADO DE OCUPACIÓN */}
        <div className="rounded-[2.5rem] bg-gray-100 p-10 flex flex-col justify-center border border-gray-200">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Celdas Disponibles</p>
          <p className={`${orbitron.className} text-5xl font-black text-black mt-2`}>28 / 45</p>
          <div className="mt-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <p className="text-[9px] font-black text-black uppercase tracking-widest">Sincronizado</p>
          </div>
        </div>
      </div>

      {/* REGISTROS RECIENTES - TEXTO NEGRO */}
      <section className="rounded-[2.5rem] bg-white p-10 shadow-xl border border-gray-100">
        <h2 className={`${orbitron.className} text-xl font-black uppercase text-black`}>Últimos Movimientos</h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Vehículo</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Ingreso</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="group">
                <td className="py-5 font-black text-black uppercase text-sm">PLQ-872</td>
                <td className="py-5 text-xs font-bold text-gray-600">14:20 PM</td>
                <td className="py-5">
                  <span className="px-3 py-1 rounded-full bg-black/5 text-[9px] font-black text-black uppercase">Activo</span>
                </td>
                <td className="py-5 text-right">
                  <button className="text-[9px] font-black uppercase underline hover:text-gray-500">Detalles</button>
                </td>
              </tr>
              {/* Más filas aquí... */}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}