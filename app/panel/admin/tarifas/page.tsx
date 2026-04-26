'use client';

import {
  AdminAlerts,
  AdminSectionHeader,
  TenantSelector,
} from '../components/AdminUi';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { formatMoney } from '../lib/formatters';
import { vehicleTypeOptions } from '../lib/constants';
import type { VehicleType } from '../lib/types';

export default function AdminTarifasPage() {
  const dashboard = useAdminDashboard('tarifas');

  if (dashboard.isLoading) {
    return <div className="p-10 text-[10px] font-black uppercase tracking-widest text-black">Sincronizando base de datos...</div>;
  }

  if (dashboard.tenants.length === 0) {
    return (
      <div className="rounded-[2.5rem] border border-gray-200 bg-white p-10">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">Panel Admin</p>
        <h1 className="mt-4 text-4xl font-black uppercase text-black">Sin sedes asignadas</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminSectionHeader
        title="Tarifas"
        subtitle="Gestiona los precios por hora para cada tipo de vehiculo de la sede seleccionada."
      />

      <AdminAlerts errorMessage={dashboard.errorMessage} feedbackMessage={dashboard.feedbackMessage} />

      <TenantSelector
        tenants={dashboard.tenants}
        selectedTenantId={dashboard.selectedTenantId}
        onSelect={dashboard.selectTenant}
      />

      <section className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl">
        <h2 className="text-xl font-black uppercase text-black">Configuracion de tarifas</h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form onSubmit={dashboard.handleSaveRate} className="rounded-2xl border border-gray-100 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Configurar tarifa</p>
            <div className="mt-3 space-y-3">
              <select
                value={dashboard.forms.rateVehicleType}
                onChange={(event) => dashboard.setForm('rateVehicleType', event.target.value as VehicleType)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
              >
                {vehicleTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                value={dashboard.forms.rateHourlyPrice}
                onChange={(event) => dashboard.setForm('rateHourlyPrice', event.target.value)}
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Valor por hora"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
              />
            </div>
            <button className="mt-3 rounded-xl bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Guardar tarifa
            </button>
          </form>

          <div className="rounded-2xl border border-gray-100 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Tarifas actuales</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tipo</th>
                    <th className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Valor hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dashboard.rates.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-4 text-xs font-semibold text-gray-500">
                        No hay tarifas registradas.
                      </td>
                    </tr>
                  )}
                  {dashboard.rates.map((rate) => (
                    <tr key={rate.id}>
                      <td className="py-3 text-sm font-black uppercase text-black">{rate.vehicle_type}</td>
                      <td className="py-3 text-sm font-bold text-gray-700">{formatMoney(rate.hourly_rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
