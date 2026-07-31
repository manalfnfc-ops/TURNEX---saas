-- Migración 03: servicios que permiten agendar a más de un cliente a la vez,
-- y campos adicionales de información del negocio.
-- Ejecutar UNA VEZ en Supabase > SQL Editor.

-- 1) Servicios: ¿requiere el horario completo para un solo cliente, o se
--    puede agendar a alguien más al mismo tiempo? (ej. clases grupales)
alter table services add column if not exists allows_concurrent boolean not null default false;

-- 2) Cada cita "recuerda" si bloquea el calendario para otros, según lo que
--    decía el servicio en el momento de agendar.
alter table appointments add column if not exists blocks_calendar boolean not null default true;

-- 3) Reemplaza el bloqueo de doble-reserva para que respete blocks_calendar
--    (las citas de servicios concurrentes no se bloquean entre sí).
do $$
declare
  cname text;
begin
  select conname into cname from pg_constraint where conrelid = 'appointments'::regclass and contype = 'x';
  if cname is not null then
    execute format('alter table appointments drop constraint %I', cname);
  end if;
end $$;

alter table appointments add constraint appointments_no_overlap
  exclude using gist (business_id with =, during with &&)
  where (status in ('pending','accepted') and blocks_calendar);

-- 4) La función que crea la cita ahora decide blocks_calendar según el
--    servicio elegido, automáticamente.
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

-- 5) Los horarios "ocupados" que ve el cliente solo deben contar las citas
--    que sí bloquean el calendario.
create or replace function public.get_busy_slots(p_business_id uuid, p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz) language sql security definer as $$
  select starts_at, ends_at from appointments
  where business_id = p_business_id
    and status in ('pending','accepted')
    and blocks_calendar
    and starts_at >= p_from and starts_at < p_to;
$$;

-- 6) Más campos de información del negocio.
alter table businesses add column if not exists instagram text;
alter table businesses add column if not exists website text;
alter table businesses add column if not exists notes text;
