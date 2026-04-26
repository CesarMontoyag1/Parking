-- =============================================================
-- NEXTPARK — ESQUEMA COMPLETO v2.1 (FUNCIONAL)
-- Compatible con: Supabase (PostgreSQL 15+)
-- Patrón: Multi-tenant con isolación lógica por tenant_id
-- =============================================================

create extension if not exists "pgcrypto";

-- =============================================================
-- PLANS
-- =============================================================
create table plans (
                       id               uuid        primary key default gen_random_uuid(),
                       code             text        unique not null
                           check (code in ('basico', 'pro', 'premium')),
                       name             text        not null,
                       max_tenants      int         not null check (max_tenants > 0),
                       max_admins       int         not null check (max_admins > 0),
                       max_vigilantes   int         not null check (max_vigilantes > 0),
                       analytics_months int         not null default 1,
                       created_at       timestamptz default now()
);

insert into plans (code, name, max_tenants, max_admins, max_vigilantes, analytics_months)
values
    ('basico',  'Básico',  1,  1,  1,  1),
    ('pro',     'Pro',     2,  5,  5,  3),
    ('premium', 'Premium', 3, 10, 10, 12);

-- =============================================================
-- ACCOUNTS
-- =============================================================
create table accounts (
                          id         uuid        primary key default gen_random_uuid(),
                          name       text        not null,
                          plan_id    uuid        not null references plans(id),
                          active     boolean     not null default true,
                          created_at timestamptz default now(),
                          updated_at timestamptz default now()
);

create index idx_accounts_plan on accounts(plan_id);

-- =============================================================
-- MEMBERSHIPS
-- =============================================================
create table memberships (
                             id         uuid        primary key default gen_random_uuid(),
                             account_id uuid        not null references accounts(id) on delete cascade,
                             user_id    uuid        not null references auth.users(id) on delete cascade,
                             role       text        not null check (role in ('owner', 'admin')),
                             created_at timestamptz default now(),
                             unique (account_id, user_id)
);

create index idx_memberships_user    on memberships(user_id);
create index idx_memberships_account on memberships(account_id);

-- =============================================================
-- TENANTS
-- =============================================================
create table tenants (
                         id         uuid        primary key default gen_random_uuid(),
                         account_id uuid        not null references accounts(id) on delete cascade,
                         name       text        not null,
                         address    text,
                         city       text,
                         phone      text,
                         active     boolean     not null default true,
                         created_at timestamptz default now(),
                         updated_at timestamptz default now()
);

create index idx_tenants_account on tenants(account_id);

-- =============================================================
-- TENANT_USERS
-- =============================================================
create table tenant_users (
                              id         uuid        primary key default gen_random_uuid(),
                              tenant_id  uuid        not null references tenants(id) on delete cascade,
                              user_id    uuid        not null references auth.users(id) on delete cascade,
                              role       text        not null check (role in ('admin', 'vigilante')),
                              active     boolean     not null default true,
                              created_at timestamptz default now(),
                              unique (tenant_id, user_id)
);

create index idx_tenant_users_user   on tenant_users(user_id);
create index idx_tenant_users_tenant on tenant_users(tenant_id);

-- =============================================================
-- PARKING_LEVELS
-- =============================================================
create table parking_levels (
                                id           uuid primary key default gen_random_uuid(),
                                tenant_id    uuid not null references tenants(id) on delete cascade,
                                name         text not null,
                                level_number int  not null,
                                unique (tenant_id, level_number)
);

create index idx_levels_tenant on parking_levels(tenant_id);

-- =============================================================
-- PARKING_CELLS
-- =============================================================
create table parking_cells (
                               id        uuid primary key default gen_random_uuid(),
                               tenant_id uuid not null references tenants(id) on delete cascade,
                               level_id  uuid not null references parking_levels(id) on delete cascade,
                               code      text not null,
                               status    text not null default 'available'
                                   check (status in ('available', 'occupied', 'reserved', 'disabled')),
                               unique (tenant_id, level_id, code)
);

create index idx_cells_tenant        on parking_cells(tenant_id);
create index idx_cells_tenant_status on parking_cells(tenant_id, status);

-- =============================================================
-- RATES
-- =============================================================
create table rates (
                       id           uuid           primary key default gen_random_uuid(),
                       tenant_id    uuid           not null references tenants(id) on delete cascade,
                       vehicle_type text           not null
                           check (vehicle_type in ('carro', 'moto', 'camioneta', 'bicicleta', 'otro')),
                       hourly_rate  numeric(10, 2) not null check (hourly_rate >= 0),
                       updated_at   timestamptz    default now(),
                       unique (tenant_id, vehicle_type)
);

create index idx_rates_tenant on rates(tenant_id);

-- =============================================================
-- VEHICLES
-- =============================================================
create table vehicles (
                          id           uuid        primary key default gen_random_uuid(),
                          tenant_id    uuid        not null references tenants(id) on delete cascade,
                          plate        text        not null,
                          vehicle_type text        not null
                              check (vehicle_type in ('carro', 'moto', 'camioneta', 'bicicleta', 'otro')),
                          owner_name   text,
                          created_at   timestamptz default now(),
                          unique (tenant_id, plate)
);

create index idx_vehicles_tenant       on vehicles(tenant_id);
create index idx_vehicles_tenant_plate on vehicles(tenant_id, plate);

-- =============================================================
-- TICKETS
-- =============================================================
create table tickets (
                         id          uuid        primary key default gen_random_uuid(),
                         tenant_id   uuid        not null references tenants(id) on delete cascade,
                         vehicle_id  uuid        not null references vehicles(id) on delete cascade,
                         cell_id     uuid        references parking_cells(id),
                         entry_time  timestamptz not null default now(),
                         exit_time   timestamptz,
                         status      text        not null default 'active'
                             check (status in ('active', 'closed', 'cancelled')),
                         created_by  uuid        not null default auth.uid()
                             references auth.users(id),
                         closed_by   uuid        references auth.users(id),
                         notes       text,
                         created_at  timestamptz default now()
);

create unique index one_active_ticket_per_vehicle
    on tickets(vehicle_id)
    where status = 'active';

create index idx_tickets_tenant_status on tickets(tenant_id, status);
create index idx_tickets_tenant_time   on tickets(tenant_id, entry_time desc);
create index idx_tickets_vehicle       on tickets(vehicle_id);
create index idx_tickets_cell          on tickets(cell_id) where cell_id is not null;

create index idx_tickets_duration
    on tickets(tenant_id, (extract(epoch from (exit_time - entry_time)) / 3600))
    where status = 'closed';

-- =============================================================
-- PAYMENTS
-- =============================================================
create table payments (
                          id        uuid           primary key default gen_random_uuid(),
                          tenant_id uuid           not null references tenants(id) on delete cascade,
                          ticket_id uuid           not null references tickets(id) on delete cascade,
                          amount    numeric(10, 2) not null check (amount >= 0),
                          method    text           not null
                              check (method in ('efectivo', 'tarjeta', 'transferencia', 'qr', 'otro')),
                          paid_by   uuid           references auth.users(id),
                          paid_at   timestamptz    not null default now()
);

create unique index one_payment_per_ticket on payments(ticket_id);
create index idx_payments_tenant      on payments(tenant_id);
create index idx_payments_tenant_time on payments(tenant_id, paid_at desc);

-- =============================================================
-- AUDIT_LOG
-- =============================================================
create table audit_log (
                           id         uuid        primary key default gen_random_uuid(),
                           tenant_id  uuid        not null references tenants(id),
                           user_id    uuid        not null references auth.users(id),
                           action     text        not null,
                           entity     text        not null,
                           entity_id  uuid,
                           payload    jsonb,
                           created_at timestamptz default now()
);

create index idx_audit_tenant_time on audit_log(tenant_id, created_at desc);
create index idx_audit_user        on audit_log(user_id);
create index idx_audit_entity      on audit_log(tenant_id, entity, entity_id);

-- =============================================================
-- HELPERS (RLS)
-- =============================================================
create or replace function is_tenant_user(tid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
select exists (
    select 1 from tenant_users
    where tenant_id = tid
      and user_id   = auth.uid()
      and active    = true
);
$$;

create or replace function is_tenant_admin(tid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
select exists (
    select 1 from tenant_users
    where tenant_id = tid
      and user_id   = auth.uid()
      and role      = 'admin'
      and active    = true
);
$$;

create or replace function is_account_member(acc_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
select exists (
    select 1 from memberships
    where account_id = acc_id
      and user_id    = auth.uid()
);
$$;

-- =============================================================
-- TRIGGERS
-- =============================================================
create or replace function auto_add_owner_to_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
owner_uid uuid;
begin
select user_id into owner_uid
from memberships
where account_id = new.account_id
  and role = 'owner'
    limit 1;

if owner_uid is not null then
    insert into tenant_users (tenant_id, user_id, role)
    values (new.id, owner_uid, 'admin')
    on conflict (tenant_id, user_id) do nothing;
end if;

return new;
end;
$$;

create trigger trg_owner_to_tenant_users
    after insert on tenants
    for each row execute function auto_add_owner_to_tenant();

create or replace function validate_ticket_integrity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1 from vehicles v
    where v.id = new.vehicle_id
      and v.tenant_id = new.tenant_id
  ) then
    raise exception 'El vehículo no pertenece a esta sede';
end if;

  if new.cell_id is not null then
    if not exists (
      select 1 from parking_cells c
      where c.id = new.cell_id
        and c.tenant_id = new.tenant_id
    ) then
      raise exception 'La celda no pertenece a esta sede';
end if;
end if;

return new;
end;
$$;

create trigger trg_validate_ticket
    before insert or update on tickets
                         for each row execute function validate_ticket_integrity();

create or replace function sync_cell_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if TG_OP = 'UPDATE'
     and old.cell_id is not null
     and new.cell_id is distinct from old.cell_id
     and new.status = 'active' then

update parking_cells set status = 'available' where id = old.cell_id;

if new.cell_id is not null then
update parking_cells set status = 'occupied' where id = new.cell_id;
end if;

return new;
end if;

  if TG_OP = 'INSERT' and new.cell_id is not null then
update parking_cells set status = 'occupied' where id = new.cell_id;
end if;

  if TG_OP = 'UPDATE'
     and new.status in ('closed', 'cancelled')
     and old.cell_id is not null then
update parking_cells set status = 'available' where id = old.cell_id;
end if;

return new;
end;
$$;

create trigger trg_sync_cell_status
    after insert or update on tickets
                        for each row execute function sync_cell_status();

create or replace function check_tenant_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
max_allowed   int;
  current_count int;
begin
select p.max_tenants into max_allowed
from accounts a
         join plans p on p.id = a.plan_id
where a.id = new.account_id
    for update;

select count(*) into current_count
from tenants
where account_id = new.account_id
  and active = true;

if current_count >= max_allowed then
    raise exception 'Límite de sedes alcanzado (máximo: %)', max_allowed;
end if;

return new;
end;
$$;

create trigger trg_tenant_limit
    before insert or update on tenants
                         for each row execute function check_tenant_limit();

create or replace function check_role_limits()
returns trigger
language plpgsql
set search_path = public
as $$
declare
max_admins         int;
  max_vigilantes     int;
  current_admins     int;
  current_vigilantes int;
  acc_id             uuid;
begin
select t.account_id into acc_id
from tenants t where t.id = new.tenant_id;

select p.max_admins, p.max_vigilantes
into max_admins, max_vigilantes
from accounts a
         join plans p on p.id = a.plan_id
where a.id = acc_id;

select count(*) into current_admins
from tenant_users
where tenant_id = new.tenant_id
  and role = 'admin'
  and active = true
  and (TG_OP != 'UPDATE' or id != old.id);

select count(*) into current_vigilantes
from tenant_users
where tenant_id = new.tenant_id
  and role = 'vigilante'
  and active = true
  and (TG_OP != 'UPDATE' or id != old.id);

if new.role = 'admin' and current_admins >= max_admins then
    raise exception 'Límite de administradores alcanzado (máximo: %)', max_admins;
end if;

  if new.role = 'vigilante' and current_vigilantes >= max_vigilantes then
    raise exception 'Límite de vigilantes alcanzado (máximo: %)', max_vigilantes;
end if;

return new;
end;
$$;

create trigger trg_role_limits
    before insert or update on tenant_users
                         for each row execute function check_role_limits();

create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
return new;
end;
$$;

create trigger trg_accounts_updated_at
    before update on accounts
    for each row execute function set_updated_at();

create trigger trg_tenants_updated_at
    before update on tenants
    for each row execute function set_updated_at();

-- =============================================================
-- RLS — ACTIVACIÓN
-- =============================================================
alter table accounts       enable row level security;
alter table memberships    enable row level security;
alter table tenants        enable row level security;
alter table tenant_users   enable row level security;
alter table parking_levels enable row level security;
alter table parking_cells  enable row level security;
alter table rates          enable row level security;
alter table vehicles       enable row level security;
alter table tickets        enable row level security;
alter table payments       enable row level security;
alter table audit_log      enable row level security;
alter table plans          enable row level security;

-- =============================================================
-- POLICIES
-- =============================================================
create policy "planes visibles para todos"
  on plans for select to authenticated using (true);

create policy "ver account propio"
  on accounts for select using (is_account_member(id));

create policy "editar account (solo owner)"
  on accounts for update
                             using (
                             exists (
                             select 1 from memberships
                             where account_id = accounts.id
                             and user_id = auth.uid()
                             and role = 'owner'
                             )
                             );

create policy "ver memberships de mi account"
  on memberships for select using (is_account_member(account_id));

create policy "gestionar memberships (solo owner)"
  on memberships for insert
  with check (
    exists (
      select 1 from memberships m
      where m.account_id = memberships.account_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

create policy "eliminar memberships (solo owner)"
  on memberships for delete
using (
    exists (
      select 1 from memberships m
      where m.account_id = memberships.account_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

create policy "ver sedes donde soy usuario"
  on tenants for select using (is_tenant_user(id));

create policy "crear sedes (solo owner)"
  on tenants for insert
  with check (
    exists (
      select 1 from memberships
      where account_id = tenants.account_id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

create policy "editar sede (solo admin)"
  on tenants for update using (is_tenant_admin(id));

create policy "ver usuarios de mi sede"
  on tenant_users for select using (is_tenant_user(tenant_id));

create policy "agregar usuarios (solo admin)"
  on tenant_users for insert with check (is_tenant_admin(tenant_id));

create policy "editar usuarios (solo admin)"
  on tenant_users for update using (is_tenant_admin(tenant_id));

create policy "eliminar usuarios (solo admin)"
  on tenant_users for delete using (is_tenant_admin(tenant_id));

create policy "ver niveles"
  on parking_levels for select using (is_tenant_user(tenant_id));

create policy "crear niveles (admin)"
  on parking_levels for insert with check (is_tenant_admin(tenant_id));

create policy "editar niveles (admin)"
  on parking_levels for update using (is_tenant_admin(tenant_id));

create policy "eliminar niveles (admin)"
  on parking_levels for delete using (is_tenant_admin(tenant_id));

create policy "ver celdas"
  on parking_cells for select using (is_tenant_user(tenant_id));

create policy "crear celdas (admin)"
  on parking_cells for insert with check (is_tenant_admin(tenant_id));

create policy "actualizar celda (usuarios de la sede)"
  on parking_cells for update using (is_tenant_user(tenant_id));

create policy "eliminar celdas (admin)"
  on parking_cells for delete using (is_tenant_admin(tenant_id));

create policy "ver tarifas"
  on rates for select using (is_tenant_user(tenant_id));

create policy "crear tarifas (admin)"
  on rates for insert with check (is_tenant_admin(tenant_id));

create policy "editar tarifas (admin)"
  on rates for update using (is_tenant_admin(tenant_id));

create policy "eliminar tarifas (admin)"
  on rates for delete using (is_tenant_admin(tenant_id));

create policy "acceso a vehículos (usuarios de la sede)"
  on vehicles for all
  using (is_tenant_user(tenant_id))
  with check (is_tenant_user(tenant_id));

create policy "ver tickets"
  on tickets for select using (is_tenant_user(tenant_id));

create policy "crear tickets (usuarios)"
  on tickets for insert with check (is_tenant_user(tenant_id));

create policy "actualizar tickets (usuarios)"
  on tickets for update using (is_tenant_user(tenant_id));

create policy "no borrar tickets"
  on tickets for delete using (false);

create policy "ver pagos"
  on payments for select using (is_tenant_user(tenant_id));

create policy "registrar pagos (usuarios)"
  on payments for insert with check (is_tenant_user(tenant_id));

create policy "no editar pagos"
  on payments for update using (false);

create policy "no borrar pagos"
  on payments for delete using (false);

create policy "ver audit log (solo admin)"
  on audit_log for select using (is_tenant_admin(tenant_id));

create policy "no insertar audit log manualmente"
  on audit_log for insert with check (false);

create policy "no editar audit log"
  on audit_log for update using (false);

create policy "no borrar audit log"
  on audit_log for delete using (false);

-- =============================================================
-- VISTAS CON security_invoker = true
-- =============================================================
create or replace view v_cell_availability
  with (security_invoker = true)
as
select
    t.id           as tenant_id,
    t.name         as tenant_name,
    l.id           as level_id,
    l.name         as level_name,
    l.level_number,
    count(*)                                             as total_cells,
    count(*) filter (where c.status = 'available')       as available,
    count(*) filter (where c.status = 'occupied')        as occupied,
    count(*) filter (where c.status = 'reserved')        as reserved,
    count(*) filter (where c.status = 'disabled')        as disabled,
    round(
            count(*) filter (where c.status = 'occupied')::numeric
    / nullif(count(*), 0) * 100, 1
    )                                                    as occupancy_pct
from tenants t
         join parking_levels l on l.tenant_id = t.id
         join parking_cells  c on c.level_id  = l.id
group by t.id, t.name, l.id, l.name, l.level_number;

create or replace view v_active_tickets
  with (security_invoker = true)
as
select
    tk.id             as ticket_id,
    tk.tenant_id,
    tk.entry_time,
    round(
            extract(epoch from (now() - tk.entry_time)) / 3600, 2
    )                 as hours_elapsed,
    v.plate,
    v.vehicle_type,
    v.owner_name,
    c.code            as cell_code,
    l.name            as level_name,
    r.hourly_rate,
    round(
            (extract(epoch from (now() - tk.entry_time)) / 3600) * r.hourly_rate
    )                 as estimated_charge
from tickets tk
         join vehicles v          on v.id  = tk.vehicle_id
         left join parking_cells c  on c.id  = tk.cell_id
         left join parking_levels l on l.id  = c.level_id
         left join rates r          on r.tenant_id    = tk.tenant_id
    and r.vehicle_type = v.vehicle_type
where tk.status = 'active';

create or replace view v_daily_revenue
  with (security_invoker = true)
as
select
    p.tenant_id,
    date_trunc('day', p.paid_at)                          as day,
  count(*)                                              as total_tickets,
  sum(p.amount)                                         as total_revenue,
  round(avg(p.amount), 0)                               as avg_ticket,
  count(*) filter (where p.method = 'efectivo')         as cash_count,
  count(*) filter (where p.method = 'tarjeta')          as card_count,
  count(*) filter (where p.method = 'transferencia')    as transfer_count,
  count(*) filter (where p.method = 'qr')               as qr_count
from payments p
group by p.tenant_id, date_trunc('day', p.paid_at);

-- =============================================================
-- RPC: REPORTE DE INGRESOS (analytics_months)
-- =============================================================
create or replace function get_revenue_report(
  p_tenant_id uuid,
  p_months    int default 1
)
returns table (
  day           date,
  total_tickets bigint,
  total_revenue numeric,
  avg_ticket    numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
allowed_months int;
begin
  if not is_tenant_user(p_tenant_id) then
    raise exception 'Acceso denegado a esta sede';
end if;

select pl.analytics_months into allowed_months
from tenants t
         join accounts a  on a.id = t.account_id
         join plans pl    on pl.id = a.plan_id
where t.id = p_tenant_id;

if p_months > allowed_months then
    raise exception
      'Tu plan permite consultar hasta % mes(es) de histórico. Solicitaste %.',
      allowed_months, p_months;
end if;

return query
select
    date_trunc('day', p.paid_at)::date,
    count(*)::bigint,
    sum(p.amount),
    round(avg(p.amount), 0)
from payments p
where p.tenant_id = p_tenant_id
  and p.paid_at  >= now() - (p_months || ' months')::interval
group by date_trunc('day', p.paid_at)
order by 1 desc;
end;
$$;

-- =============================================================
-- FIN
-- =============================================================