'use client';

import { Orbitron } from 'next/font/google';
import type { TenantInfo } from '../lib/types';
import { formatShortMoney } from '../lib/formatters';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export function AdminSectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Panel Administrativo</p>
      <h1 className={`${orbitron.className} text-4xl font-black uppercase tracking-tight text-black`}>{title}</h1>
      <p className="mt-3 max-w-3xl text-sm font-semibold text-gray-600">{subtitle}</p>
    </header>
  );
}

export function AdminAlerts({ errorMessage, feedbackMessage }: { errorMessage: string | null; feedbackMessage: string | null }) {
  return (
    <>
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-600">{errorMessage}</div>
      )}
      {feedbackMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-sm font-bold text-green-700">{feedbackMessage}</div>
      )}
    </>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  isBlack = false,
}: {
  label: string;
  value: string;
  detail: string;
  isBlack?: boolean;
}) {
  return (
    <div className={`rounded-[2.5rem] p-8 transition-all ${isBlack ? 'bg-black text-white shadow-2xl' : 'bg-white text-black border border-gray-100 shadow-lg'}`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isBlack ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
      <p className={`${orbitron.className} mt-4 text-4xl font-black tracking-tighter uppercase`}>{value}</p>
      <p className={`mt-3 text-[9px] font-bold uppercase tracking-widest ${isBlack ? 'text-gray-400' : 'text-gray-500'}`}>{detail}</p>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className={`${orbitron.className} mt-2 text-2xl font-black uppercase text-black`}>{value}</p>
    </div>
  );
}

export function TenantSelector({
  tenants,
  selectedTenantId,
  onSelect,
}: {
  tenants: TenantInfo[];
  selectedTenantId: string | null;
  onSelect: (tenantId: string) => void;
}) {
  return (
    <section className="rounded-[2.2rem] border border-gray-100 bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className={`${orbitron.className} text-lg font-black uppercase text-black`}>Sede Activa</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tenants.map((tenant) => {
          const isSelected = tenant.id === selectedTenantId;
          return (
            <button
              type="button"
              key={tenant.id}
              onClick={() => onSelect(tenant.id)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                isSelected ? 'border-black bg-black text-white' : 'border-gray-200 bg-gray-50 text-black'
              }`}
            >
              <p className={`text-[9px] font-black uppercase tracking-[0.25em] ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                {tenant.city || 'Ciudad no definida'}
              </p>
              <p className="mt-2 text-sm font-black uppercase tracking-wide">{tenant.name}</p>
              <p className={`mt-2 text-[11px] font-bold ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                {tenant.plan?.name || 'Plan no asignado'}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function SimpleBarChart({ data }: { data: Array<{ day: string; total: number }> }) {
  const maxValue = data.reduce((max, item) => Math.max(max, item.total), 0);

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="flex min-w-[640px] items-end gap-2 rounded-2xl bg-gray-50 p-4">
        {data.map((item) => (
          <div key={item.day} className="flex flex-1 flex-col items-center">
            <div className="mb-2 text-[10px] font-black text-gray-500">{item.total > 0 ? formatShortMoney(item.total) : '$0'}</div>
            <div className="h-36 w-full max-w-8 rounded-xl bg-white p-1">
              <div
                className="w-full rounded-lg bg-black"
                style={{ height: `${maxValue === 0 ? 4 : Math.max(4, (item.total / maxValue) * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-[9px] font-black uppercase text-gray-500">{item.day.slice(5)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
