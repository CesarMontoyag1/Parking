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
  // Forzar el tipado de forms para ayudar a TypeScript
  // El tipado se infiere automáticamente del hook actualizado
  const forms = dashboard.forms;

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

        {!dashboard.isOwner && (
          <p className="mt-3 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm font-semibold text-yellow-800">
            Nota: los admins pueden gestionar vigilantes. Solo el owner puede crear/eliminar otros administradores. No puedes eliminar tu propio acceso desde aquí.
          </p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form onSubmit={dashboard.handleRegisterStaff} className="rounded-2xl border border-gray-100 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Agregar personal por email</p>
            <div className="mt-3 space-y-3">
              <input
                value={forms.staffEmail}
                onChange={(event) => dashboard.setForm('staffEmail', event.target.value)}
                placeholder="Email del usuario"
                required
                type="email"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
              />
              <input
                value={forms.staffPassword}
                onChange={(event) => dashboard.setForm('staffPassword', event.target.value)}
                placeholder="Contraseña temporal (min 8)"
                required
                type="password"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
              />
              <input
                value={forms.staffFullName}
                onChange={(event) => dashboard.setForm('staffFullName', event.target.value)}
                placeholder="Nombre completo (opcional)"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
              />
              <input
                value={forms.staffPhone}
                onChange={(event) => dashboard.setForm('staffPhone', event.target.value)}
                placeholder="Teléfono (opcional)"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
              />
              <select
                value={forms.staffRole}
                onChange={(event) => dashboard.setForm('staffRole', event.target.value as StaffRole)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
              >
                <option value="admin">admin</option>
                <option value="vigilante">vigilante</option>
              </select>
            </div>
            <button
              disabled={
                (dashboard.forms.staffRole === 'admin' && !dashboard.isOwner) ||
                (dashboard.forms.staffRole === 'vigilante' && !(dashboard.isOwner || dashboard.isAdmin)) ||
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
                  <p className="text-[11px] font-semibold text-gray-600">{item.email || item.user_id}</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500">{item.active ? 'Activo' : 'Inactivo'}</p>
                  {item.full_name && <p className="text-[10px] text-gray-700">{item.full_name}</p>}
                  {/* email already shown above when available */}

                  {(dashboard.isOwner || (dashboard.isAdmin && item.role === 'vigilante')) && item.user_id !== dashboard.userId && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => dashboard.handleDeleteStaff(item.id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
