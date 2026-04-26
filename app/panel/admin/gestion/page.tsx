'use client';

import { paymentMethodOptions, vehicleTypeOptions } from '../lib/constants';
import {
  AdminAlerts,
  AdminSectionHeader,
  MiniStat,
  TenantSelector,
} from '../components/AdminUi';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import type { PaymentMethod, VehicleType } from '../lib/types';

export default function AdminGestionPage() {
  const dashboard = useAdminDashboard('gestion');

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
        title="Gestion de Parqueaderos"
        subtitle="Configura niveles, celdas y opera el flujo central de entrada/salida de vehiculos."
      />

      <AdminAlerts errorMessage={dashboard.errorMessage} feedbackMessage={dashboard.feedbackMessage} />

      <TenantSelector
        tenants={dashboard.tenants}
        selectedTenantId={dashboard.selectedTenantId}
        onSelect={dashboard.selectTenant}
      />

      <section className="grid gap-8 lg:grid-cols-2">
        <article className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-black uppercase text-black">Estructura del parqueadero</h2>
            {dashboard.isTenantLoading && (
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Actualizando...</span>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MiniStat label="Niveles" value={dashboard.levels.length.toString()} />
            <MiniStat label="Celdas" value={dashboard.cells.length.toString()} />
            <MiniStat label="Disponibles" value={dashboard.availableCells.toString()} />
            <MiniStat label="Ocupadas" value={dashboard.occupiedCells.toString()} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Resumen de ocupacion</p>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-full bg-black"
                style={{
                  width: `${
                    dashboard.cells.length === 0
                      ? 0
                      : Math.min(100, (dashboard.occupiedCells / dashboard.cells.length) * 100)
                  }%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs font-bold text-gray-600">
              Reservadas: {dashboard.reservedCells} | Deshabilitadas: {dashboard.disabledCells}
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <form onSubmit={dashboard.handleCreateLevel} className="rounded-2xl border border-gray-100 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Crear nivel</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  value={dashboard.forms.levelName}
                  onChange={(event) => dashboard.setForm('levelName', event.target.value)}
                  placeholder="Nombre del nivel"
                  required
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
                />
                <input
                  type="number"
                  min={1}
                  value={dashboard.forms.levelNumber}
                  onChange={(event) => dashboard.setForm('levelNumber', event.target.value)}
                  required
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
                />
              </div>
              <button className="mt-3 rounded-xl bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Guardar nivel
              </button>
            </form>

            <form onSubmit={dashboard.handleCreateCell} className="rounded-2xl border border-gray-100 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Crear celda</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <select
                  value={dashboard.forms.cellLevelId}
                  onChange={(event) => dashboard.setForm('cellLevelId', event.target.value)}
                  required
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
                >
                  <option value="">Selecciona nivel</option>
                  {dashboard.levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.level_number} - {level.name}
                    </option>
                  ))}
                </select>
                <input
                  value={dashboard.forms.cellCode}
                  onChange={(event) => dashboard.setForm('cellCode', event.target.value)}
                  placeholder="Codigo celda"
                  required
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold uppercase text-black outline-none focus:border-black"
                />
              </div>
              <button className="mt-3 rounded-xl bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Guardar celda
              </button>
            </form>
          </div>
        </article>

        <article className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl">
          <h2 className="text-xl font-black uppercase text-black">Operacion vehicular</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <form onSubmit={dashboard.handleRegisterEntry} className="rounded-2xl border border-gray-100 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Registrar entrada</p>
              <div className="mt-3 space-y-3">
                <input
                  value={dashboard.forms.entryPlate}
                  onChange={(event) => dashboard.setForm('entryPlate', event.target.value)}
                  required
                  placeholder="Placa"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold uppercase text-black outline-none focus:border-black"
                />
                <select
                  value={dashboard.forms.entryVehicleType}
                  onChange={(event) => dashboard.setForm('entryVehicleType', event.target.value as VehicleType)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
                >
                  {vehicleTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  value={dashboard.forms.entryCellId}
                  onChange={(event) => dashboard.setForm('entryCellId', event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
                >
                  <option value="">Sin celda asignada</option>
                  {dashboard.cells
                    .filter((cell) => cell.status === 'available')
                    .map((cell) => (
                      <option key={cell.id} value={cell.id}>
                        {cell.code}
                      </option>
                    ))}
                </select>
              </div>
              <button className="mt-3 rounded-xl bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Registrar
              </button>
            </form>

            <form onSubmit={dashboard.handleRegisterExit} className="rounded-2xl border border-gray-100 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Registrar salida</p>
              <div className="mt-3 space-y-3">
                <input
                  value={dashboard.forms.exitPlate}
                  onChange={(event) => dashboard.setForm('exitPlate', event.target.value)}
                  required
                  placeholder="Placa"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold uppercase text-black outline-none focus:border-black"
                />
                <select
                  value={dashboard.forms.exitMethod}
                  onChange={(event) => dashboard.setForm('exitMethod', event.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
                >
                  {paymentMethodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button className="mt-3 rounded-xl bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Liquidar
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Tickets activos</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Placa</th>
                    <th className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tipo</th>
                    <th className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Celda</th>
                    <th className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nivel</th>
                    <th className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Ingreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dashboard.activeTickets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-xs font-semibold text-gray-500">
                        No hay tickets activos.
                      </td>
                    </tr>
                  )}
                  {dashboard.activeTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="py-3 text-sm font-black uppercase text-black">{ticket.plate}</td>
                      <td className="py-3 text-xs font-bold uppercase text-gray-600">{ticket.vehicle_type}</td>
                      <td className="py-3 text-xs font-bold uppercase text-gray-600">{ticket.cell_code}</td>
                      <td className="py-3 text-xs font-bold text-gray-600">{ticket.level_name}</td>
                      <td className="py-3 text-xs font-bold text-gray-600">{new Date(ticket.entry_time).toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
