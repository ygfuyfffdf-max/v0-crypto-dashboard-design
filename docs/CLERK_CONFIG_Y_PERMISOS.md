# 🔐 Configuración Clerk + Sistema de Permisos

## Clerk en Vercel

Variables requeridas (ya configuradas en el proyecto):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — pk_test_... o pk_live_...
- `CLERK_SECRET_KEY` — sk_test_... o sk_live_...
- `CLERK_WEBHOOK_SECRET` — whsec_... (opcional, para sync usuarios)

**Producción**: Usar `pk_live_` y `sk_live_` en [Clerk Dashboard](https://dashboard.clerk.com) → API Keys.

## Roles y Permisos (advanced-user-permission-system)

Los roles se definen en **Clerk Dashboard** → Users → Metadata → `publicMetadata`:

```json
{
  "role": "financial_manager",
  "chronos_role": "financial_manager",
  "riskScore": 0.15
}
```

### Roles soportados

| Rol | Paneles permitidos |
|-----|--------------------|
| `ceo`, `cfo`, `financial_director` | profit, bancos |
| `financial_manager`, `accountant`, `auditor` | bancos (view) |
| `sales_manager`, `regional_manager`, `analyst` | ventas |
| `data_scientist`, `ai_engineer`, `analyst` | ia |
| `user_admin` | admin, configuracion |
| `viewer` | solo lectura |

### Configurar rol en Clerk

1. Clerk Dashboard → Users → seleccionar usuario
2. Public metadata → Add → `role` → valor (ej: `financial_manager`)

## Logo KOCMOC КОСМОС

- **Favicon**: `/kocmoc-favicon.svg` (estilo cosmic)
- **Login/Register**: `KocmocLogo` con `textVariant="kosmos"`
- **Landing**: Cinematográfica `KocmocLogoOpening` con "КОСМОС"

## Flujo de entrada

1. `/` → Cinematográfica КОСМОС (skip con tecla)
2. Al completar → `/login`
3. Si ya autenticado → `/dashboard`
