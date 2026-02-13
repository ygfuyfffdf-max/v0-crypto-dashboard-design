# Inicio de sesión por email (sin teléfono) — Clerk

Si los usuarios no pueden crear cuenta o iniciar sesión por número de teléfono, configura Clerk para usar **email** como método principal.

## Pasos en Clerk Dashboard

1. Entra a **[dashboard.clerk.com](https://dashboard.clerk.com)** e inicia sesión.
2. Selecciona tu aplicación (la que usa este proyecto).
3. En el menú izquierdo: **Configure** → **Email, Phone, Username**  
   (o **User & Authentication** → **Email, Phone, Username**, según la versión).
4. **Email address**
   - Activa **Email address**.
   - Marca como **Required** si quieres que el registro sea solo por email.
5. **Phone number**
   - Para **no** pedir teléfono en el registro/inicio de sesión:
     - Desactiva **Phone number**, o
     - Déjalo en **Optional** (no requerido).
6. Guarda los cambios (**Save**).

Así, en la pantalla de Sign up / Sign in de tu app se usará **email + contraseña** (y opcionalmente teléfono si lo dejaste opcional).

## Comprobar en producción

- Tu app en Vercel usa las variables `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` de **Production**.
- Asegúrate de que en Clerk Dashboard el **dominio de producción** (ej. `v0-crypto-dashboard-design-tau.vercel.app`) esté añadido en **Configure** → **Domains**, para que las cookies y el flujo funcionen bien.

## Enlaces rápidos

- **Iniciar sesión (app):** `/login`
- **Crear cuenta (app):** `/register`
- **Clerk Dashboard:** https://dashboard.clerk.com
