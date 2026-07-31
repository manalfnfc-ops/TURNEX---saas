-- Migración: agrega estado "completada" y el valor realmente pagado por cita.
-- Ejecutar UNA VEZ en Supabase > SQL Editor si tu base de datos ya existía
-- antes de este cambio (si vas a crear el proyecto desde cero, esto ya
-- viene incluido en schema.sql y no hace falta correr este archivo).

alter table appointments drop constraint if exists appointments_status_check;
alter table appointments add constraint appointments_status_check
  check (status in ('pending','accepted','rejected','postponed','cancelled','completed'));

alter table appointments add column if not exists paid_amount numeric(12,2);

-- Nuevo estado "pending": un negocio recién creado no tiene acceso hasta
-- que tú (Super Admin) lo pases a "demo" o "active" manualmente.
alter table businesses drop constraint if exists businesses_plan_status_check;
alter table businesses add constraint businesses_plan_status_check
  check (plan_status in ('pending','demo','active','inactive'));
alter table businesses alter column plan_status set default 'pending';

