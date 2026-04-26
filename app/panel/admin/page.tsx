'use client';

import { useEffect, useState } from 'react';
import { Orbitron } from 'next/font/google';
import { supabase } from '../../../lib/supabase/client';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function AdminPanelPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Sedes Reales
      const { data: ten } = await supabase.from('tenant_users').select('tenant_id').eq('user_id', session.user.id);
      setTenants(ten || []);

      // Vigilantes Reales (Asumiendo que seleccionamos la primera sede para la métrica inicial)
      if (ten && ten.length > 0) {
        const { data: gua } = await supabase.from('tenant_users').select('id').eq('tenant_id', ten[0].tenant_id).eq('role', 'vigilante');
        setGuards(gua || []);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="p-10 text-[10px] font-black uppercase tracking-widest text-black">Sincronizando Base de Datos...</div>;

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">Administrador Principal</p>
        <h1 className={`${orbitron.className} text-5xl font-black uppercase tracking-tighter text-black`}>
          Visión <br /> General.
        </h1>
      </header>

      {/* MÉTRICAS REALES */}
      <div className="grid gap-6 md:grid-cols-2">
        <MetricCard label="Sedes Vinculadas" value={tenants.length.toString()} detail="Sedes bajo tu administración" />
        <MetricCard label="Vigilantes Registrados" value={guards.length.toString()} detail="Personal en la sede principal" isBlack />
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* FORMULARIO - TEXTO NEGRO */}
        <section id="vigilantes" className="rounded-[2.5rem] bg-white p-10 shadow-xl border border-gray-100">
          <h2 className={`${orbitron.className} text-xl font-black uppercase text-black`}>Nuevo Operativo</h2>
          <form className="mt-8 space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
              <input type="text" className="w-full border-b-2 border-gray-200 py-3 text-sm font-black uppercase text-black outline-none focus:border-black transition-all" placeholder="EJ. JUAN PEREZ" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email de Acceso</label>
              <input type="email" className="w-full border-b-2 border-gray-200 py-3 text-sm font-black uppercase text-black outline-none focus:border-black transition-all" placeholder="VIGILANTE@NEXTPARK.COM" />
            </div>
            <button className="w-full bg-black py-5 mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:invert transition-all shadow-xl">
              Crear Credenciales
            </button>
          </form>
        </section>

        <section id="gestion" className="rounded-[2.5rem] bg-white p-10 shadow-xl border border-gray-100">
          <h2 className={`${orbitron.className} text-xl font-black uppercase text-black`}>Control de Sede</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 mb-8">Información de la sede activa</p>
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-[9px] font-black text-gray-400 uppercase">Sede Actual</p>
            <p className="text-xl font-black text-black mt-1 uppercase tracking-tight">Terminal Norte</p>
            <div className="mt-4 flex gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-black uppercase">Sistema Online</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, isBlack = false }: { label: string, value: string, detail: string, isBlack?: boolean }) {
  return (
    <div className={`rounded-[2.5rem] p-10 transition-all ${isBlack ? 'bg-black text-white shadow-2xl' : 'bg-white text-black border border-gray-100 shadow-lg'}`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isBlack ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
      <p className={`${orbitron.className} mt-6 text-5xl font-black tracking-tighter uppercase`}>{value}</p>
      <p className={`mt-4 text-[9px] font-bold uppercase tracking-widest ${isBlack ? 'text-gray-400' : 'text-gray-500'}`}>{detail}</p>
    </div>
  );
}