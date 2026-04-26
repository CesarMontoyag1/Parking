'use client';

import {
  AdminAlerts,
  AdminSectionHeader,
  MetricCard,
  TenantSelector,
} from '../components/AdminUi';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { formatMoney } from '../lib/formatters';

export default function AdminInicioPage() {
  const dashboard = useAdminDashboard('inicio');

  if (dashboard.isLoading) {
    return <div className="p-10 text-[10px] font-black uppercase tracking-widest text-black">Sincronizando base de datos...</div>;
  }

  if (dashboard.tenants.length === 0) {
    return (
      <div className="rounded-[2.5rem] border border-gray-200 bg-white p-10">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">Panel Admin</p>
        <h1 className="mt-4 text-4xl font-black uppercase text-black">Sin sedes asignadas</h1>
        <p className="mt-4 text-sm font-semibold text-gray-600">
          Tu usuario no tiene una sede activa con rol administrativo. Pide al owner que te agregue en tenant_users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminSectionHeader
        title="Inicio"
        subtitle="Resumen rapido del sistema y de tus parqueaderos disponibles por plan."
      />

      <AdminAlerts errorMessage={dashboard.errorMessage} feedbackMessage={dashboard.feedbackMessage} />

      <section className="rounded-[2.2rem] border border-gray-100 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-black uppercase text-black">Capacidad del plan</h2>
        <p className="mt-2 text-xs font-bold text-gray-600">
          Tu plan actual permite hasta {dashboard.selectedPlan?.max_tenants || 1} sede(s). Actualmente tienes {dashboard.tenants.length} registrada(s).
        </p>
      </section>

      <TenantSelector
        tenants={dashboard.tenants}
        selectedTenantId={dashboard.selectedTenantId}
        onSelect={dashboard.selectTenant}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Sedes vinculadas" value={dashboard.tenants.length.toString()} detail="Bajo tu administracion" />
        <MetricCard label="Tickets activos" value={dashboard.activeTicketsCount.toString()} detail="En sede seleccionada" isBlack />
        <MetricCard label="Celdas ocupadas" value={dashboard.occupiedCells.toString()} detail={`Disponibles ${dashboard.availableCells}`} />
        <MetricCard label="Ingresos 30 dias" value={formatMoney(dashboard.monthlyRevenue)} detail="Contabilidad reciente" isBlack />
      </div>

      <section className="rounded-[2.2rem] border border-gray-100 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-black uppercase text-black">Mis parqueaderos</h2>
        <p className="mt-2 text-xs font-bold text-gray-600">
          Cada sede se gestiona por separado. Selecciona una sede y usa el menu lateral para entrar a Gestion, Personal, Tarifas o Contabilidad.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.tenants.map((tenant) => {
            const isActive = tenant.id === dashboard.selectedTenantId;
            return (
              <div
                key={tenant.id}
                className={`rounded-2xl border p-4 ${
                  isActive ? 'border-black bg-black text-white' : 'border-gray-200 bg-gray-50 text-black'
                }`}
              >
                <p className={`text-[9px] font-black uppercase tracking-[0.25em] ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                  {tenant.city || 'Ciudad no definida'}
                </p>
                <p className="mt-2 text-sm font-black uppercase tracking-wide">{tenant.name}</p>
                <p className={`mt-2 text-[11px] font-bold ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                  {tenant.plan?.name || 'Plan no asignado'}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
