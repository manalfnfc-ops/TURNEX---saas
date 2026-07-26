# Turnex — Guía de despliegue (GitHub + Vercel + Supabase)

Este proyecto ya está construido (frontend + backend + base de datos). Esta guía te enseña a **conectar cada pieza** para que funcione en producción.

## 0. Qué ya está hecho

- Flujo público del cliente: `/[slug]` (agenda sin cuenta)
- Panel del negocio: `/admin/*` (login, onboarding, servicios, citas, KPIs)
- Panel Super Admin: `/super-admin` (control global de membresías)
- Motor de calendario con prevención de doble-reserva **a nivel de base de datos** (no solo visual)
- Webhook de Wompi para activar membresías automáticamente
- Envío de correos con Resend (confirmación + recordatorios)

## 1. Crear el proyecto en Supabase

1. Ve a https://supabase.com → **New Project**. Elige región cercana (ej. `sa-east-1` São Paulo, la más cercana a Colombia).
2. Cuando esté listo, ve a **SQL Editor** → pega TODO el contenido de `supabase/schema.sql` → **Run**. Esto crea las tablas, las reglas de seguridad (RLS) y la protección anti-doble-reserva.
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → será `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → será `SUPABASE_SERVICE_ROLE_KEY` (¡nunca la subas al frontend ni a GitHub!)

## 2. Crear tu usuario y volverte Super Admin

1. En Supabase → **Authentication → Users → Add user**, crea tu propio usuario (tu correo, una contraseña).
2. Copia el `UID` de ese usuario.
3. En **SQL Editor**, ejecuta (reemplaza el UID):
   ```sql
   insert into super_admins (user_id) values ('TU-UID-AQUI');
   ```
4. Con ese mismo usuario podrás entrar en `/admin/login` y luego visitar `/super-admin`.

## 3. Subir el proyecto a GitHub

Desde tu computador, con este proyecto descargado:

```bash
cd turnex
git init
git add .
git commit -m "Turnex - primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/turnex.git
git push -u origin main
```

Si no tienes el repo creado aún: ve a https://github.com/new, créalo vacío (sin README), y usa la URL que te da ahí en el comando `git remote add origin`.

## 4. Desplegar en Vercel

1. Ve a https://vercel.com/new e importa el repositorio `turnex` desde GitHub.
2. En **Environment Variables**, agrega las mismas variables de `.env.example` con tus valores reales:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `WOMPI_EVENTS_SECRET`
3. Click **Deploy**. En unos minutos tendrás una URL como `turnex.vercel.app`.

## 5. Conectar Resend (correos automáticos)

1. Crea cuenta en https://resend.com.
2. Verifica tu dominio (o usa el dominio de prueba de Resend mientras validas).
3. Crea una **API Key** → pégala en Vercel como `RESEND_API_KEY`.
4. `RESEND_FROM_EMAIL` debe ser un correo de un dominio verificado en Resend.

## 6. Conectar Wompi (pagos y activación automática)

1. Crea cuenta comercio en https://comercios.wompi.co.
2. En **Configuración → Eventos**, registra la URL de tu webhook:
   `https://tu-dominio.vercel.app/api/webhooks/wompi`
3. Copia el **secreto de eventos** → pégalo en Vercel como `WOMPI_EVENTS_SECRET`.
4. Cuando generes el link de pago para un negocio, usa como **referencia** de la transacción: `ID_DEL_NEGOCIO:monthly` o `ID_DEL_NEGOCIO:annual`. El webhook usa ese texto para saber qué negocio activar y por cuánto tiempo.

## 7. Flujo de prueba de punta a punta

1. Entra a `/admin/login` con tu usuario, crea tu negocio en `/admin/onboarding`, define horarios.
2. Agrega servicios en `/admin/servicios`.
3. Copia tu slug (aparece en `/admin/onboarding`) y abre `/tu-slug` en otra pestaña como si fueras cliente.
4. Agenda una cita de prueba. Verifica que llegue el correo de confirmación (si usaste tu propio correo).
5. Vuelve a `/admin/citas` y acéptala. Intenta agendar dos citas al mismo horario desde dos pestañas — la segunda debe rechazarse ("ese horario ya no está disponible").
6. Entra a `/super-admin` y verifica que tu negocio aparece en la lista.

## Checklist final antes de lanzar con clientes reales

- [ ] Esquema SQL ejecutado sin errores en Supabase
- [ ] Tu usuario está en `super_admins`
- [ ] Variables de entorno cargadas en Vercel (no solo en tu `.env.local`)
- [ ] Dominio verificado en Resend y correo de prueba recibido
- [ ] Webhook de Wompi probado con una transacción de prueba (sandbox)
- [ ] Doble-reserva probada manualmente (dos pestañas, mismo horario)
- [ ] Dominio propio conectado en Vercel (opcional, Project Settings → Domains)

## Notas de arquitectura

- **Motor de calendario**: no hay agenda por empleado. Cada negocio tiene un solo calendario general definido por su horario de atención (`business_hours`) y la duración de cada servicio. La prevención de doble-reserva está en la base de datos (constraint `EXCLUDE` en la tabla `appointments`), así que ni siquiera dos solicitudes simultáneas pueden chocar.
- **Trabajadores**: son solo un campo informativo — no tienen horario propio. Está así por diseño (ver `Fuera de alcance` en el documento de requisitos original).
- **RLS (seguridad)**: cada dueño solo ve su propio negocio; el Super Admin ve todos; el público solo puede leer lo necesario para agendar, vía funciones RPC controladas — nunca acceso directo a las tablas.
