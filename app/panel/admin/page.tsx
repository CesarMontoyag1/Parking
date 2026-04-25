'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';

type TenantOption = {
  tenant_id: string;
  tenants: {
    id: string;
    name: string;
  } | null;
};

type TenantRow = {
  tenant_id: string;
  tenants: { id: string; name: string } | { id: string; name: string }[] | null;
};

type GuardSummary = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
};

export default function AdminPanelPage() {
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [guards, setGuards] = useState<GuardSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tenantName = useMemo(() => {
    const selected = tenants.find((entry) => entry.tenant_id === selectedTenantId);
    return selected?.tenants?.name || 'Sede';
  }, [selectedTenantId, tenants]);

  useEffect(() => {
    let isMounted = true;

    const loadAdminContext = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!session) {
        window.location.href = '/';
        return;
      }

      const { data, error } = await supabase
        .from('tenant_users')
        .select('tenant_id, tenants(id, name)')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const tenantRows = ((data || []) as TenantRow[]).map((row) => ({
        tenant_id: row.tenant_id,
        tenants: Array.isArray(row.tenants) ? row.tenants[0] || null : row.tenants,
      }));

      setTenants(tenantRows);
      setSelectedTenantId(tenantRows[0]?.tenant_id || '');
      setIsLoading(false);
    };

    void loadAdminContext();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadGuards = async () => {
      if (!selectedTenantId) {
        setGuards([]);
        return;
      }

      const { data, error } = await supabase
        .from('tenant_users')
        .select('id, user_id, role, created_at')
        .eq('tenant_id', selectedTenantId)
        .eq('role', 'vigilante')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setGuards((data as GuardSummary[]) || []);
    };

    void loadGuards();

    return () => {
      isMounted = false;
    };
  }, [selectedTenantId]);

  const handleCreateGuard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const fullName = String(formData.get('fullName') || '').trim();

    if (!selectedTenantId) {
      setErrorMessage('Selecciona una sede antes de crear el vigilante.');
      return;
    }

    setIsSubmitting(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setIsSubmitting(false);
      setErrorMessage('Tu sesion ya no es valida. Inicia sesion de nuevo.');
      return;
    }

    const response = await fetch('/api/admin/guards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        tenantId: selectedTenantId,
        email,
        password,
        fullName,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(payload.error || 'No se pudo crear la cuenta de vigilante.');
      return;
    }

    setSuccessMessage('Cuenta de vigilante creada correctamente.');
    event.currentTarget.reset();

    const { data } = await supabase
      .from('tenant_users')
      .select('id, user_id, role, created_at')
      .eq('tenant_id', selectedTenantId)
      .eq('role', 'vigilante')
      .eq('active', true)
      .order('created_at', { ascending: false });

    setGuards((data as GuardSummary[]) || []);
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-10">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-400">Panel Admin</p>
          <h1 className="mt-4 text-4xl font-black uppercase">Cargando información...</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-400">Menu principal</p>
          <h2 className="mt-4 text-2xl font-black uppercase">Administrador</h2>
          <nav className="mt-8 flex flex-col gap-3 text-sm uppercase tracking-[0.2em] text-gray-300">
            <span className="rounded-xl border border-white/20 px-4 py-3 text-white">Resumen</span>
            <span className="rounded-xl border border-white/10 px-4 py-3">Vigilantes</span>
            <Link href="/" className="rounded-xl border border-white/10 px-4 py-3 transition hover:border-white/40">
              Volver al inicio
            </Link>
          </nav>
        </aside>

        <main className="space-y-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-400">Dashboard</p>
            <h1 className="mt-4 text-4xl font-black uppercase">Panel de administración</h1>
            <p className="mt-4 max-w-3xl text-gray-300">
              Gestiona tus sedes, crea cuentas de vigilante y mantén el control operativo desde un solo lugar.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Sedes</p>
                <p className="mt-3 text-3xl font-black">{tenants.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Vigilantes activos</p>
                <p className="mt-3 text-3xl font-black">{guards.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Sede actual</p>
                <p className="mt-3 text-base font-bold uppercase">{tenantName}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-400">Personal operativo</p>
                <h2 className="mt-3 text-2xl font-black uppercase">Crear vigilante</h2>
              </div>

              <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                Sede
                <select
                  value={selectedTenantId}
                  onChange={(event) => setSelectedTenantId(event.target.value)}
                  className="mt-2 rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white"
                >
                  {tenants.map((tenant) => (
                    <option key={tenant.tenant_id} value={tenant.tenant_id}>
                      {tenant.tenants?.name || tenant.tenant_id}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleCreateGuard}>
              <input
                type="text"
                name="fullName"
                placeholder="Nombre completo"
                className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-white/60 focus:outline-none"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Correo"
                className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-white/60 focus:outline-none"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Contrasena temporal"
                minLength={8}
                className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-white/60 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl border border-white bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.25em] text-black transition hover:bg-transparent hover:text-white disabled:opacity-60"
              >
                {isSubmitting ? 'Creando...' : 'Crear vigilante'}
              </button>
            </form>

            {errorMessage && <p className="mt-4 text-sm text-red-400">{errorMessage}</p>}
            {successMessage && <p className="mt-4 text-sm text-green-400">{successMessage}</p>}

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Últimos vigilantes creados</p>
              <div className="mt-4 space-y-2 text-sm text-gray-200">
                {guards.length === 0 ? (
                  <p>No hay vigilantes registrados en esta sede.</p>
                ) : (
                  guards.slice(0, 5).map((guard) => (
                    <p key={guard.id}>
                      {guard.user_id} · {new Date(guard.created_at).toLocaleString('es-CO')}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
