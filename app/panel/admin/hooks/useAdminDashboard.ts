'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';
import { buildRevenueHistory } from '../lib/formatters';
import type {
  ActiveTicketRow,
  AdminSection,
  CellRow,
  LevelRow,
  PaymentMethod,
  PaymentRow,
  PlanInfo,
  RateRow,
  RevenuePoint,
  StaffRole,
  StaffRow,
  TenantInfo,
  VehicleType,
} from '../lib/types';

export type DashboardAdminFormState = {
  levelName: string;
  levelNumber: string;
  cellCode: string;
  cellLevelId: string;
  staffUserId: string;
  staffRole: StaffRole;
  staffFullName: string;
  staffEmail: string;
  staffPassword: string;
  staffPhone: string;
  rateVehicleType: VehicleType;
  rateHourlyPrice: string;
  entryPlate: string;
  entryVehicleType: VehicleType;
  entryCellId: string;
  exitPlate: string;
  exitMethod: PaymentMethod;
};

type TenantSnapshot = {
  levels: LevelRow[];
  cells: CellRow[];
  staff: StaffRow[];
  rates: RateRow[];
  activeTickets: ActiveTicketRow[];
  payments: PaymentRow[];
  revenueHistory: RevenuePoint[];
  activeTicketsCount: number;
  closedTicketsCount: number;
  updatedAt: number;
};

type WorkspaceSnapshot = {
  userId: string;
  tenants: TenantInfo[];
  lastTenantId: string | null;
  updatedAt: number;
};

const WORKSPACE_CACHE_TTL_MS = 5 * 60 * 1000;
const TENANT_CACHE_TTL_MS = 60 * 1000;

let workspaceSnapshot: WorkspaceSnapshot | null = null;
const tenantSnapshots = new Map<string, TenantSnapshot>();

function isFresh(updatedAt: number, ttlMs: number): boolean {
  return Date.now() - updatedAt < ttlMs;
}

function getWorkspaceSnapshot(): WorkspaceSnapshot | null {
  if (!workspaceSnapshot) {
    return null;
  }

  if (!isFresh(workspaceSnapshot.updatedAt, WORKSPACE_CACHE_TTL_MS)) {
    workspaceSnapshot = null;
    return null;
  }

  return workspaceSnapshot;
}

function getTenantSnapshot(tenantId: string): TenantSnapshot | null {
  const snapshot = tenantSnapshots.get(tenantId);
  if (!snapshot) {
    return null;
  }

  if (!isFresh(snapshot.updatedAt, TENANT_CACHE_TTL_MS)) {
    tenantSnapshots.delete(tenantId);
    return null;
  }

  return snapshot;
}

function storeWorkspaceSnapshot(snapshot: WorkspaceSnapshot): void {
  workspaceSnapshot = snapshot;
}

function storeTenantSnapshot(tenantId: string, snapshot: TenantSnapshot): void {
  tenantSnapshots.set(tenantId, snapshot);
}

export function useAdminDashboard(section: AdminSection) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantFromQuery = searchParams.get('tenant');
  const cachedWorkspace = getWorkspaceSnapshot();

  const initialTenantId = (() => {
    if (!cachedWorkspace) {
      return tenantFromQuery;
    }

    if (tenantFromQuery && cachedWorkspace.tenants.some((tenant) => tenant.id === tenantFromQuery)) {
      return tenantFromQuery;
    }

    if (cachedWorkspace.lastTenantId && cachedWorkspace.tenants.some((tenant) => tenant.id === cachedWorkspace.lastTenantId)) {
      return cachedWorkspace.lastTenantId;
    }

    return cachedWorkspace.tenants[0]?.id || null;
  })();

  const cachedTenant = initialTenantId ? getTenantSnapshot(initialTenantId) : null;

  const [isLoading, setIsLoading] = useState(!cachedWorkspace);
  const [isTenantLoading, setIsTenantLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(cachedWorkspace?.userId || null);
  const [tenants, setTenants] = useState<TenantInfo[]>(cachedWorkspace?.tenants || []);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(initialTenantId);

  const [levels, setLevels] = useState<LevelRow[]>(cachedTenant?.levels || []);
  const [cells, setCells] = useState<CellRow[]>(cachedTenant?.cells || []);
  const [staff, setStaff] = useState<StaffRow[]>(cachedTenant?.staff || []);
  const [rates, setRates] = useState<RateRow[]>(cachedTenant?.rates || []);
  const [activeTickets, setActiveTickets] = useState<ActiveTicketRow[]>(cachedTenant?.activeTickets || []);
  const [payments, setPayments] = useState<PaymentRow[]>(cachedTenant?.payments || []);
  const [revenueHistory, setRevenueHistory] = useState<RevenuePoint[]>(cachedTenant?.revenueHistory || []);
  const [activeTicketsCount, setActiveTicketsCount] = useState(cachedTenant?.activeTicketsCount || 0);
  const [closedTicketsCount, setClosedTicketsCount] = useState(cachedTenant?.closedTicketsCount || 0);

  const [forms, setForms] = useState<DashboardAdminFormState>({
    levelName: '',
    levelNumber: '1',
    cellCode: '',
    cellLevelId: '',
    staffUserId: '',
    staffRole: 'vigilante',
    staffFullName: '',
    staffEmail: '',
    staffPassword: '',
    staffPhone: '',
    rateVehicleType: 'carro',
    rateHourlyPrice: '',
    entryPlate: '',
    entryVehicleType: 'carro',
    entryCellId: '',
    exitPlate: '',
    exitMethod: 'efectivo',
  });

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) || null,
    [tenants, selectedTenantId]
  );

  const isOwner = selectedTenant?.isOwner === true;

  const isAdmin = useMemo(() => {
    if (!userId) return false;
    return staff.some((s) => s.user_id === userId && s.role === 'admin' && s.active);
  }, [staff, userId]);

  const selectedPlan = selectedTenant?.plan || null;
  const adminCount = staff.filter((item) => item.role === 'admin' && item.active).length;
  const guardCount = staff.filter((item) => item.role === 'vigilante' && item.active).length;
  const availableCells = cells.filter((cell) => cell.status === 'available').length;
  const occupiedCells = cells.filter((cell) => cell.status === 'occupied').length;
  const reservedCells = cells.filter((cell) => cell.status === 'reserved').length;
  const disabledCells = cells.filter((cell) => cell.status === 'disabled').length;
  const monthlyRevenue = payments.reduce((acc, item) => acc + item.amount, 0);

  const canAddAdmin = !selectedPlan || adminCount < selectedPlan.max_admins;
  const canAddGuard = !selectedPlan || guardCount < selectedPlan.max_vigilantes;

  const buildSectionUrl = useCallback(
    (nextSection: AdminSection, tenantId?: string | null) => {
      const tenant = tenantId || selectedTenantId;
      if (tenant) {
        return `/panel/admin/${nextSection}?tenant=${tenant}`;
      }
      return `/panel/admin/${nextSection}`;
    },
    [selectedTenantId]
  );

  const goToSection = useCallback(
    (nextSection: AdminSection, tenantId?: string | null) => {
      router.push(buildSectionUrl(nextSection, tenantId));
    },
    [buildSectionUrl, router]
  );

  const selectTenant = useCallback(
    (tenantId: string) => {
      setSelectedTenantId(tenantId);
      router.replace(buildSectionUrl(section, tenantId));
    },
    [buildSectionUrl, router, section]
  );

  const applyTenantSnapshot = useCallback((snapshot: TenantSnapshot) => {
    setLevels(snapshot.levels);
    setCells(snapshot.cells);
    setStaff(snapshot.staff);
    setRates(snapshot.rates);
    setActiveTickets(snapshot.activeTickets);
    setPayments(snapshot.payments);
    setRevenueHistory(snapshot.revenueHistory);
    setActiveTicketsCount(snapshot.activeTicketsCount);
    setClosedTicketsCount(snapshot.closedTicketsCount);
  }, []);

  const loadWorkspace = useCallback(async () => {
    if (tenants.length === 0) {
      setIsLoading(true);
    }
    setErrorMessage(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setErrorMessage('No fue posible validar tu sesion.');
      setIsLoading(false);
      return;
    }

    setUserId(session.user.id);

    const { data: tenantUsers, error: tenantUsersError } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', session.user.id)
      .eq('active', true);

    if (tenantUsersError) {
      setErrorMessage(tenantUsersError.message);
      setIsLoading(false);
      return;
    }

    const tenantIds = (tenantUsers || []).map((item) => item.tenant_id);

    if (tenantIds.length === 0) {
      setTenants([]);
      setSelectedTenantId(null);
      applyTenantSnapshot({
        levels: [],
        cells: [],
        staff: [],
        rates: [],
        activeTickets: [],
        payments: [],
        revenueHistory: [],
        activeTicketsCount: 0,
        closedTicketsCount: 0,
        updatedAt: Date.now(),
      });
      storeWorkspaceSnapshot({
        userId: session.user.id,
        tenants: [],
        lastTenantId: null,
        updatedAt: Date.now(),
      });
      setIsLoading(false);
      return;
    }

    const { data: tenantRows, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, address, city, account_id, active')
      .in('id', tenantIds)
      .order('created_at', { ascending: true });

    if (tenantsError) {
      setErrorMessage(tenantsError.message);
      setIsLoading(false);
      return;
    }

    const accountIds = Array.from(new Set((tenantRows || []).map((tenant) => tenant.account_id)));
    let accountRows: { id: string; plan_id: string }[] = [];
    if (accountIds.length > 0) {
      const { data, error } = await supabase.from('accounts').select('id, plan_id').in('id', accountIds);
      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }
      accountRows = data || [];
    }

    const planIds = Array.from(new Set(accountRows.map((account) => account.plan_id)));
    let planRows: PlanInfo[] = [];
    if (planIds.length > 0) {
      const { data, error } = await supabase
        .from('plans')
        .select('id, code, name, max_tenants, max_admins, max_vigilantes, analytics_months')
        .in('id', planIds);
      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }
      planRows = (data || []) as PlanInfo[];
    }

    const accountsById = new Map(accountRows.map((account) => [account.id, account]));
    const plansById = new Map(planRows.map((plan) => [plan.id, plan]));

    // determine which accounts the current user is owner of
    const ownerAccountIds = new Set<string>();
    if (accountRows.length > 0) {
      try {
        const { data: memData, error: memError } = await supabase
          .from('memberships')
          .select('account_id, role')
          .in('account_id', accountRows.map((a) => a.id))
          .eq('user_id', session.user.id);

        if (!memError && memData) {
          memData.forEach((m: { account_id: string; role: string }) => {
            if (m.role === 'owner') ownerAccountIds.add(m.account_id);
          });
        }
      } catch {
        // ignore membership enrichment failures, default to no owner flags
      }
    }

    const tenantSummary: TenantInfo[] = (tenantRows || []).map((tenant) => {
      const account = accountsById.get(tenant.account_id);
      return {
        ...tenant,
        plan: account ? plansById.get(account.plan_id) || null : null,
        isOwner: ownerAccountIds.has(tenant.account_id),
      };
    });

    setTenants(tenantSummary);

    const existsQueryTenant = tenantFromQuery && tenantSummary.some((tenant) => tenant.id === tenantFromQuery);
    const nextTenantId = existsQueryTenant ? tenantFromQuery : tenantSummary[0]?.id || null;
    setSelectedTenantId(nextTenantId);

    storeWorkspaceSnapshot({
      userId: session.user.id,
      tenants: tenantSummary,
      lastTenantId: nextTenantId,
      updatedAt: Date.now(),
    });

    if (nextTenantId && (!tenantFromQuery || !existsQueryTenant)) {
      router.replace(buildSectionUrl(section, nextTenantId));
    }

    setIsLoading(false);
  }, [applyTenantSnapshot, buildSectionUrl, router, section, tenantFromQuery, tenants.length]);

  const loadTenantData = useCallback(async (tenantId: string, forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getTenantSnapshot(tenantId);
      if (cached) {
        applyTenantSnapshot(cached);
        return;
      }
    }

    setIsTenantLoading(true);
    setErrorMessage(null);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      levelsRes,
      cellsRes,
      staffRes,
      ratesRes,
      activeTicketsRes,
      paymentsRes,
      activeCountRes,
      closedCountRes,
    ] = await Promise.all([
      supabase
        .from('parking_levels')
        .select('id, name, level_number')
        .eq('tenant_id', tenantId)
        .order('level_number', { ascending: true }),
      supabase
        .from('parking_cells')
        .select('id, level_id, code, status')
        .eq('tenant_id', tenantId)
        .order('code', { ascending: true }),
      supabase
        .from('tenant_users')
        .select('id, user_id, role, active')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false }),
      supabase
        .from('rates')
        .select('id, vehicle_type, hourly_rate')
        .eq('tenant_id', tenantId),
      supabase
        .from('tickets')
        .select('id, vehicle_id, cell_id, entry_time')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('entry_time', { ascending: false })
        .limit(20),
      supabase
        .from('payments')
        .select('id, amount, method, paid_at')
        .eq('tenant_id', tenantId)
        .gte('paid_at', thirtyDaysAgo.toISOString())
        .order('paid_at', { ascending: false }),
      supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'active'),
      supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'closed'),
    ]);

    const errors = [
      levelsRes.error,
      cellsRes.error,
      staffRes.error,
      ratesRes.error,
      activeTicketsRes.error,
      paymentsRes.error,
      activeCountRes.error,
      closedCountRes.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      setErrorMessage(errors[0]?.message || 'No se pudo cargar la informacion de la sede.');
      setIsTenantLoading(false);
      return;
    }

    const rawTickets = activeTicketsRes.data || [];
    const vehicleIds = Array.from(new Set(rawTickets.map((ticket) => ticket.vehicle_id).filter(Boolean)));
    const cellIds = Array.from(new Set(rawTickets.map((ticket) => ticket.cell_id).filter(Boolean)));

    let vehiclesById = new Map<string, { plate: string; vehicle_type: VehicleType }>();
    if (vehicleIds.length > 0) {
      const { data, error } = await supabase.from('vehicles').select('id, plate, vehicle_type').in('id', vehicleIds);
      if (!error && data) {
        vehiclesById = new Map(
          data.map((vehicle) => [vehicle.id, { plate: vehicle.plate, vehicle_type: vehicle.vehicle_type as VehicleType }])
        );
      }
    }

    let cellsById = new Map<string, { code: string; level_id: string }>();
    if (cellIds.length > 0) {
      const { data, error } = await supabase.from('parking_cells').select('id, code, level_id').in('id', cellIds);
      if (!error && data) {
        cellsById = new Map(data.map((cell) => [cell.id, { code: cell.code, level_id: cell.level_id }]));
      }
    }

    const levelIds = Array.from(new Set(Array.from(cellsById.values()).map((cell) => cell.level_id)));
    let levelsById = new Map<string, { name: string }>();
    if (levelIds.length > 0) {
      const { data, error } = await supabase.from('parking_levels').select('id, name').in('id', levelIds);
      if (!error && data) {
        levelsById = new Map(data.map((level) => [level.id, { name: level.name }]));
      }
    }

    const enrichedTickets: ActiveTicketRow[] = rawTickets.map((ticket) => {
      const vehicle = vehiclesById.get(ticket.vehicle_id);
      const cell = ticket.cell_id ? cellsById.get(ticket.cell_id) : undefined;
      const level = cell ? levelsById.get(cell.level_id) : undefined;

      return {
        id: ticket.id,
        plate: vehicle?.plate || 'N/D',
        vehicle_type: vehicle?.vehicle_type || 'otro',
        cell_code: cell?.code || 'Sin celda',
        level_name: level?.name || 'N/A',
        entry_time: ticket.entry_time,
      };
    });

    const cleanRates: RateRow[] = (ratesRes.data || []).map((rate) => ({
      id: rate.id,
      vehicle_type: rate.vehicle_type as VehicleType,
      hourly_rate: Number(rate.hourly_rate),
    }));

    const cleanPayments: PaymentRow[] = (paymentsRes.data || []).map((item) => ({
      id: item.id,
      amount: Number(item.amount),
      method: item.method as PaymentMethod,
      paid_at: item.paid_at,
    }));

    setLevels((levelsRes.data || []) as LevelRow[]);
    const snapshot: TenantSnapshot = {
      levels: (levelsRes.data || []) as LevelRow[],
      cells: (cellsRes.data || []) as CellRow[],
      staff: (staffRes.data || []) as StaffRow[],
      rates: cleanRates,
      activeTickets: enrichedTickets,
      payments: cleanPayments,
      revenueHistory: buildRevenueHistory(cleanPayments, 14),
      activeTicketsCount: activeCountRes.count || 0,
      closedTicketsCount: closedCountRes.count || 0,
      updatedAt: Date.now(),
    };

    // Try to fetch enriched staff via server endpoint (includes email and full_name) using session token
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (accessToken) {
        const staffRes = await fetch(`/api/admin/staff?tenantId=${tenantId}`, {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        if (staffRes.ok) {
          const json = (await staffRes.json().catch(() => ({}))) as {
            staff?: StaffRow[];
            isOwner?: boolean;
          };
          if (Array.isArray(json.staff)) {
            snapshot.staff = json.staff.map((s) => ({
              id: s.id,
              user_id: s.user_id,
              role: s.role,
              active: s.active,
              email: s.email || null,
              full_name: s.full_name || null,
              created_at: s.created_at || undefined,
            }));
            // also update tenant owner flag if provided
            if (typeof json.isOwner === 'boolean') {
              setTenants((currentTenants) =>
                currentTenants.map((t) => (t.id === tenantId ? { ...t, isOwner: json.isOwner } : t))
              );
            }
          }
        }
      }
    } catch {
      // ignore enrichment failures
    }

    storeTenantSnapshot(tenantId, snapshot);
    applyTenantSnapshot(snapshot);
    setIsTenantLoading(false);
  }, [applyTenantSnapshot]);

  useEffect(() => {
    if (cachedWorkspace) {
      return;
    }

    const id = window.setTimeout(() => {
      void loadWorkspace();
    }, 0);

    return () => window.clearTimeout(id);
  }, [cachedWorkspace, loadWorkspace]);

  useEffect(() => {
    if (!selectedTenantId) {
      return;
    }

    if (workspaceSnapshot) {
      workspaceSnapshot = {
        ...workspaceSnapshot,
        lastTenantId: selectedTenantId,
      };
    }

    const id = window.setTimeout(() => {
      void loadTenantData(selectedTenantId);
    }, 0);

    return () => window.clearTimeout(id);
  }, [applyTenantSnapshot, loadTenantData, selectedTenantId]);

  const setForm = <K extends keyof DashboardAdminFormState>(key: K, value: DashboardAdminFormState[K]) => {
    setForms((current) => ({ ...current, [key]: value }));
  };

  const handleCreateLevel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenantId) {
      return;
    }

    setFeedbackMessage(null);
    const parsedLevel = Number(forms.levelNumber);
    if (Number.isNaN(parsedLevel) || parsedLevel <= 0) {
      setFeedbackMessage('El numero de nivel debe ser mayor a 0.');
      return;
    }

    const { error } = await supabase.from('parking_levels').insert({
      tenant_id: selectedTenantId,
      name: forms.levelName.trim(),
      level_number: parsedLevel,
    });

    if (error) {
      setFeedbackMessage(error.message);
      return;
    }

    setForm('levelName', '');
    setForm('levelNumber', (levels.length + 1).toString());
    setFeedbackMessage('Nivel creado correctamente.');
    await loadTenantData(selectedTenantId, true);
  };

  const handleCreateCell = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenantId || !forms.cellLevelId) {
      return;
    }

    setFeedbackMessage(null);

    const { error } = await supabase.from('parking_cells').insert({
      tenant_id: selectedTenantId,
      level_id: forms.cellLevelId,
      code: forms.cellCode.trim().toUpperCase(),
      status: 'available',
    });

    if (error) {
      setFeedbackMessage(error.message);
      return;
    }

    setForm('cellCode', '');
    setFeedbackMessage('Celda creada correctamente.');
    await loadTenantData(selectedTenantId, true);
  };

  const handleRegisterStaff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenantId) {
      return;
    }

    if ((forms.staffRole === 'admin' && !canAddAdmin) || (forms.staffRole === 'vigilante' && !canAddGuard)) {
      setFeedbackMessage('El plan actual ya alcanzo el limite permitido para este rol.');
      return;
    }

    // require email and password for creation flow
    const email = forms.staffEmail.trim().toLowerCase();
    const password = forms.staffPassword || '';
    const fullName = forms.staffFullName.trim() || null;

    if (!email || !password) {
      setFeedbackMessage('Email y contraseña son requeridos para crear un usuario.');
      return;
    }

    if (password.length < 8) {
      setFeedbackMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    // check local role-based creation permission (owner/admin rules already enforced server-side)
    if (forms.staffRole === 'admin' && !isOwner) {
      setFeedbackMessage('Solo el owner puede crear administradores.');
      return;
    }

    if (forms.staffRole === 'vigilante' && !(isOwner || isAdmin)) {
      setFeedbackMessage('No tienes permisos para crear vigilantes.');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      setFeedbackMessage('No hay sesión válida para crear usuarios.');
      return;
    }

    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tenantId: selectedTenantId, role: forms.staffRole, email, password, fullName }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFeedbackMessage(body.error || 'No fue posible crear el usuario.');
      return;
    }

    setForm('staffEmail', '');
    setForm('staffPassword', '');
    setForm('staffFullName', '');
    setForm('staffPhone', '');
    setFeedbackMessage('Personal agregado correctamente.');
    await loadTenantData(selectedTenantId, true);
  };

  const handleSaveRate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenantId) {
      return;
    }

    const hourlyRate = Number(forms.rateHourlyPrice);
    if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
      setFeedbackMessage('La tarifa debe ser un numero mayor o igual a 0.');
      return;
    }

    const { error } = await supabase.from('rates').upsert(
      {
        tenant_id: selectedTenantId,
        vehicle_type: forms.rateVehicleType,
        hourly_rate: hourlyRate,
      },
      { onConflict: 'tenant_id,vehicle_type' }
    );

    if (error) {
      setFeedbackMessage(error.message);
      return;
    }

    setForm('rateHourlyPrice', '');
    setFeedbackMessage('Tarifa guardada correctamente.');
    await loadTenantData(selectedTenantId, true);
  };

  const handleRegisterEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenantId) {
      return;
    }

    const cleanPlate = forms.entryPlate.trim().toUpperCase();
    if (!cleanPlate) {
      setFeedbackMessage('Debes ingresar una placa valida.');
      return;
    }

    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicles')
      .upsert(
        {
          tenant_id: selectedTenantId,
          plate: cleanPlate,
          vehicle_type: forms.entryVehicleType,
        },
        { onConflict: 'tenant_id,plate' }
      )
      .select('id')
      .single();

    if (vehicleError || !vehicleData) {
      setFeedbackMessage(vehicleError?.message || 'No fue posible crear/actualizar el vehiculo.');
      return;
    }

    const { error: ticketError } = await supabase.from('tickets').insert({
      tenant_id: selectedTenantId,
      vehicle_id: vehicleData.id,
      cell_id: forms.entryCellId || null,
      status: 'active',
    });

    if (ticketError) {
      setFeedbackMessage(ticketError.message);
      return;
    }

    setForm('entryPlate', '');
    setForm('entryCellId', '');
    setFeedbackMessage('Entrada registrada correctamente.');
    await loadTenantData(selectedTenantId, true);
  };

  const handleRegisterExit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTenantId || !userId) {
      return;
    }

    const cleanPlate = forms.exitPlate.trim().toUpperCase();
    if (!cleanPlate) {
      setFeedbackMessage('Debes ingresar una placa para salida.');
      return;
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, vehicle_type')
      .eq('tenant_id', selectedTenantId)
      .eq('plate', cleanPlate)
      .maybeSingle();

    if (vehicleError || !vehicle) {
      setFeedbackMessage(vehicleError?.message || 'No se encontro el vehiculo para esta sede.');
      return;
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, entry_time')
      .eq('tenant_id', selectedTenantId)
      .eq('vehicle_id', vehicle.id)
      .eq('status', 'active')
      .order('entry_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ticketError || !ticket) {
      setFeedbackMessage(ticketError?.message || 'No hay ticket activo para esta placa.');
      return;
    }

    const rate = rates.find((item) => item.vehicle_type === vehicle.vehicle_type)?.hourly_rate || 0;
    const entryDate = new Date(ticket.entry_time);
    const now = new Date();
    const totalHours = Math.max(1, (now.getTime() - entryDate.getTime()) / 1000 / 60 / 60);
    const totalAmount = Number((totalHours * rate).toFixed(2));

    const { error: closeError } = await supabase
      .from('tickets')
      .update({ status: 'closed', exit_time: now.toISOString(), closed_by: userId })
      .eq('id', ticket.id);

    if (closeError) {
      setFeedbackMessage(closeError.message);
      return;
    }

    const { error: paymentError } = await supabase.from('payments').insert({
      tenant_id: selectedTenantId,
      ticket_id: ticket.id,
      amount: totalAmount,
      method: forms.exitMethod,
      paid_by: userId,
    });

    if (paymentError) {
      setFeedbackMessage(paymentError.message);
      return;
    }

    setForm('exitPlate', '');
    setFeedbackMessage(`Salida registrada. Total cobrado: ${totalAmount.toFixed(0)}.`);
    await loadTenantData(selectedTenantId, true);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!selectedTenantId || !userId) return;
    setFeedbackMessage(null);

    // fetch the staff row to inspect user_id and role
    const { data: targetRow, error: fetchError } = await supabase
      .from('tenant_users')
      .select('id, user_id, role')
      .eq('id', staffId)
      .maybeSingle();

    if (fetchError || !targetRow) {
      setFeedbackMessage(fetchError?.message || 'No se encontro el registro de personal.');
      return;
    }

    // prevent deleting your own access (owner/admin cannot remove their own tenant_user)
    if (targetRow.user_id === userId) {
      setFeedbackMessage('No puedes eliminar tu propio acceso desde este panel.');
      return;
    }

    // only owner can delete admins
    if (targetRow.role === 'admin' && !isOwner) {
      setFeedbackMessage('Solo el owner puede eliminar administradores.');
      return;
    }

    // vigilantes can be deleted by owner or by admins
    if (targetRow.role === 'vigilante' && !(isOwner || isAdmin)) {
      setFeedbackMessage('No tienes permisos para eliminar a este vigilante.');
      return;
    }

    const { error } = await supabase.from('tenant_users').delete().eq('id', staffId);
    if (error) {
      setFeedbackMessage(error.message);
      return;
    }
    setFeedbackMessage('Personal eliminado correctamente.');
    await loadTenantData(selectedTenantId, true);
  };

  return {
    isLoading,
    isTenantLoading,
    errorMessage,
    feedbackMessage,
    tenants,
    selectedTenantId,
    selectedTenant,
      isOwner,
          userId,
          isAdmin,
    selectedPlan,
    levels,
    cells,
    staff,
    rates,
    activeTickets,
    payments,
    revenueHistory,
    activeTicketsCount,
    closedTicketsCount,
    adminCount,
    guardCount,
    availableCells,
    occupiedCells,
    reservedCells,
    disabledCells,
    monthlyRevenue,
    canAddAdmin,
    canAddGuard,
    forms,
    setForm,
    selectTenant,
    goToSection,
    buildSectionUrl,
    handleCreateLevel,
    handleCreateCell,
    handleDeleteStaff,
    handleRegisterStaff,
    handleSaveRate,
    handleRegisterEntry,
    handleRegisterExit,
  };
}
