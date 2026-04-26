'use client';

import {
  AdminAlerts,
  AdminSectionHeader,
  MiniStat,
  SimpleBarChart,
  TenantSelector,
} from '../components/AdminUi';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { formatMoney } from '../lib/formatters';

export default function AdminContabilidadPage() {
  const dashboard = useAdminDashboard('contabilidad');

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
        title="Contabilidad"
        subtitle="Analiza el historico de ingresos y los ultimos movimientos de caja."
      />

      <AdminAlerts errorMessage={dashboard.errorMessage} feedbackMessage={dashboard.feedbackMessage} />

      <TenantSelector
        tenants={dashboard.tenants}
        selectedTenantId={dashboard.selectedTenantId}
        onSelect={dashboard.selectTenant}
      />

      <section className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl">
        <h2 className="text-xl font-black uppercase text-black">Resumen financiero</h2>
        <p className="mt-2 text-xs font-bold text-gray-600">
          Historico habilitado por plan: hasta {dashboard.selectedPlan?.analytics_months || 1} mes(es).
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MiniStat label="Total 30 dias" value={formatMoney(dashboard.monthlyRevenue)} />
          <MiniStat label="Pagos registrados" value={dashboard.payments.length.toString()} />
          <MiniStat label="Tickets cerrados" value={dashboard.closedTicketsCount.toString()} />
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Grafica historica de ingresos (ultimos 14 dias)</p>
          <SimpleBarChart data={dashboard.revenueHistory} />
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Ultimos pagos</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Fecha</th>
                  <th className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Metodo</th>
                  <th className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dashboard.payments.slice(0, 10).map((payment) => (
                  <tr key={payment.id}>
                    <td className="py-3 text-xs font-bold text-gray-700">{new Date(payment.paid_at).toLocaleString('es-CO')}</td>
                    <td className="py-3 text-xs font-black uppercase text-black">{payment.method}</td>
                    <td className="py-3 text-sm font-black text-black">{formatMoney(payment.amount)}</td>
                  </tr>
                ))}
                {dashboard.payments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-xs font-semibold text-gray-500">
                      No hay movimientos contables en los ultimos 30 dias.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
