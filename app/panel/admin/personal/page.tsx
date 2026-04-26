'use client';

import {
  AdminAlerts,
  AdminSectionHeader,
  TenantSelector,
} from '../components/AdminUi';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import type { StaffRole } from '../lib/types';

export default function AdminPersonalPage() {
  const dashboard = useAdminDashboard('personal');

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
        title="Personal"
        subtitle="Registra vigilantes y administradores segun los limites del plan actual."
      />

      <AdminAlerts errorMessage={dashboard.errorMessage} feedbackMessage={dashboard.feedbackMessage} />

      <TenantSelector
        tenants={dashboard.tenants}
        selectedTenantId={dashboard.selectedTenantId}
        onSelect={dashboard.selectTenant}
      />

      <section className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl">
        <h2 className="text-xl font-black uppercase text-black">Gestion de personal</h2>
        <p className="mt-2 text-xs font-bold text-gray-600">
          Admins: {dashboard.adminCount}/{dashboard.selectedPlan?.max_admins || 'N/A'} | Vigilantes: {dashboard.guardCount}/
          {dashboard.selectedPlan?.max_vigilantes || 'N/A'}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form onSubmit={dashboard.handleRegisterStaff} className="rounded-2xl border border-gray-100 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Agregar personal por user_id</p>
            <div className="mt-3 space-y-3">
              <input
                value={dashboard.forms.staffUserId}
                onChange={(event) => dashboard.setForm('staffUserId', event.target.value)}
                placeholder="UUID del usuario"
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
              />
              <select
                value={dashboard.forms.staffRole}
                onChange={(event) => dashboard.setForm('staffRole', event.target.value as StaffRole)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
              >
                <option value="admin">admin</option>
                <option value="vigilante">vigilante</option>
              </select>
            </div>
            <button
              disabled={
                (dashboard.forms.staffRole === 'admin' && !dashboard.canAddAdmin) ||
                (dashboard.forms.staffRole === 'vigilante' && !dashboard.canAddGuard)
              }
              className="mt-3 rounded-xl bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar personal
            </button>
          </form>

          <div className="rounded-2xl border border-gray-100 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Equipo actual</p>
            <ul className="mt-3 space-y-2">
              {dashboard.staff.length === 0 && <li className="text-xs font-semibold text-gray-500">No hay personal registrado.</li>}
              {dashboard.staff.map((item) => (
                <li key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-[11px] font-black uppercase text-black">{item.role}</p>
                  <p className="text-[11px] font-semibold text-gray-600">{item.user_id}</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500">{item.active ? 'Activo' : 'Inactivo'}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
