-- =========================================================
-- TURNEX — Esquema de base de datos (Supabase / Postgres)
-- Ejecutar completo en: Supabase Dashboard > SQL Editor
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists btree_gist; -- necesaria para evitar solapes de horario

-- ---------------------------------------------------------
-- 1. NEGOCIOS
-- ---------------------------------------------------------
create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade,
  slug text unique not null,               -- usado en el enlace público /:slug
  name text not null,
  niche text,                              -- barbería, salón de uñas, etc.
  description text,
  logo_url text,
  address text,
  phone text,
  email text,
  timezone text not null default 'America/Bogota',
  instagram text,
  website text,
  notes text,
  plan_status text not null default 'pending' check (plan_status in ('pending','demo','active','inactive')),
  demo_started_at timestamptz default now(),
  demo_expires_at timestamptz default (now() + interval '30 days'),
  plan_expires_at timestamptz,             -- para plan mensual/anual pagado
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 2. HORARIOS DE ATENCIÓN (por día de la semana)
-- ---------------------------------------------------------
create table if not exists business_hours (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6), -- 0=domingo
  open_time time not null,
  close_time time not null,
  is_closed boolean default false,
  unique (business_id, weekday)
);

-- ---------------------------------------------------------
-- 3. SERVICIOS (catálogo del negocio)
-- ---------------------------------------------------------
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  duration_minutes int not null check (duration_minutes > 0),
  allows_concurrent boolean not null default false, -- true = se puede agendar a alguien más al mismo tiempo (ej. clase grupal)
  active boolean default true,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 4. TRABAJADORES (solo informativo, sin agenda propia)
-- ---------------------------------------------------------
create table if not exists workers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 5. CITAS
-- El campo "during" (tstzrange) es la clave para prevenir
-- doble-reserva mediante un EXCLUDE constraint.
-- ---------------------------------------------------------
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  service_id uuid references services(id),
  worker_id uuid references workers(id),          -- asignado por el admin al aceptar (informativo)
  client_name text not null,
  client_email text,
  client_phone text,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  during tstzrange generated always as (tstzrange(starts_at, ends_at, '[)')) stored,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','postponed','cancelled','completed')),
  paid_amount numeric(12,2),
  blocks_calendar boolean not null default true, -- false = servicio concurrente, no bloquea el horario para otros
  created_at timestamptz default now(),
  constraint valid_range check (ends_at > starts_at),
  -- Evita que dos citas ACEPTADAS o PENDIENTES se solapen en el mismo negocio
  -- (solo entre citas que sí bloquean el calendario)
  exclude using gist (
    business_id with =,
    during with &&
  ) where (status in ('pending','accepted') and blocks_calendar)
);

create index if not exists idx_appointments_business on appointments(business_id, starts_at);

-- ---------------------------------------------------------
-- 6. RESEÑAS / SUGERENCIAS DE CLIENTES
-- ---------------------------------------------------------
create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  appointment_id uuid references appointments(id),
  message text not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- 7. SUPER ADMINS (tú, MANALF) — control global del SaaS
-- ---------------------------------------------------------
create table if not exists super_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table businesses enable row level security;
alter table business_hours enable row level security;
alter table services enable row level security;
alter table workers enable row level security;
alter table appointments enable row level security;
alter table feedback enable row level security;
alter table super_admins enable row level security;

-- El Super Admin puede ver y editar TODOS los negocios (soporte global)
create policy "super_admin_all_businesses" on businesses for all using (
  auth.uid() in (select user_id from super_admins)
);
create policy "super_admin_all_appointments" on appointments for all using (
  auth.uid() in (select user_id from super_admins)
);

-- Dueño del negocio ve/edita SOLO su negocio
create policy "owner_select_business" on businesses for select using (auth.uid() = owner_id);
create policy "owner_update_business" on businesses for update using (auth.uid() = owner_id);
create policy "owner_insert_business" on businesses for insert with check (auth.uid() = owner_id);

create policy "owner_all_hours" on business_hours for all using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "owner_all_services" on services for all using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "owner_all_workers" on workers for all using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "owner_all_appointments" on appointments for all using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "owner_read_feedback" on feedback for select using (
  business_id in (select id from businesses where owner_id = auth.uid())
);

-- Lectura pública (anónima) de datos necesarios para agendar:
-- negocio activo, horarios, servicios activos -> vía funciones RPC (ver abajo),
-- no acceso directo de tablas a "anon" para evitar fuga de datos de otros negocios.

-- =========================================================
-- FUNCIONES RPC (usadas por el enlace público del cliente)
-- =========================================================

-- Devuelve datos públicos del negocio por slug (sin datos sensibles)
create or replace function public.get_business_public(p_slug text)
returns table (
  id uuid, name text, niche text, description text, logo_url text,
  address text, phone text, instagram text, website text, timezone text, plan_status text, demo_expires_at timestamptz
) language sql security definer as $$
  select id, name, niche, description, logo_url, address, phone, instagram, website, timezone, plan_status, demo_expires_at
  from businesses
  where slug = p_slug and plan_status in ('demo','active');
$$;

-- Servicios activos de un negocio (público)
create or replace function public.get_services_public(p_business_id uuid)
returns setof services language sql security definer as $$
  select * from services where business_id = p_business_id and active = true order by price asc;
$$;

-- Trabajadores activos (informativo, público)
create or replace function public.get_workers_public(p_business_id uuid)
returns setof workers language sql security definer as $$
  select * from workers where business_id = p_business_id and active = true order by name asc;
$$;

-- Horarios de atención (público)
create or replace function public.get_hours_public(p_business_id uuid)
returns setof business_hours language sql security definer as $$
  select * from business_hours where business_id = p_business_id order by weekday asc;
$$;

-- Citas ya ocupadas en un rango de fechas (público, solo para calcular disponibilidad,
-- sin exponer datos personales del cliente)
create or replace function public.get_busy_slots(p_business_id uuid, p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz) language sql security definer as $$
  select starts_at, ends_at from appointments
  where business_id = p_business_id
    and status in ('pending','accepted')
    and blocks_calendar
    and starts_at >= p_from and starts_at < p_to;
$$;

-- Crear una cita pública. Si hay solape, el EXCLUDE constraint de la tabla
-- lanza un error 23P01 que la API captura y convierte en "horario no disponible".
-- blocks_calendar se decide solo, según si el servicio permite concurrencia.
create or replace function public.create_public_appointment(
  p_business_id uuid,
  p_service_id uuid,
  p_worker_id uuid,
  p_client_name text,
  p_client_email text,
  p_client_phone text,
  p_notes text,
  p_starts_at timestamptz,
  p_duration_minutes int
) returns appointments language plpgsql security definer as $$
declare
  new_row appointments;
  v_blocks boolean;
begin
  select not coalesce(allows_concurrent, false) into v_blocks from services where id = p_service_id;

  insert into appointments (
    business_id, service_id, worker_id, client_name, client_email,
    client_phone, notes, starts_at, ends_at, blocks_calendar
  ) values (
    p_business_id, p_service_id, p_worker_id, p_client_name, p_client_email,
    p_client_phone, p_notes, p_starts_at, p_starts_at + (p_duration_minutes || ' minutes')::interval,
    coalesce(v_blocks, true)
  )
  returning * into new_row;

  return new_row;
end;
$$;

grant execute on function public.get_business_public to anon;
grant execute on function public.get_services_public to anon;
grant execute on function public.get_workers_public to anon;
grant execute on function public.get_hours_public to anon;
grant execute on function public.get_busy_slots to anon;
grant execute on function public.create_public_appointment to anon;
