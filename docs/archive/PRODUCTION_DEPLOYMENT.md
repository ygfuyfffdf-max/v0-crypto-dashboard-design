# 🚀 CHRONOS INFINITY 2026 - DESPLIEGUE EN PRODUCCIÓN

## ✅ LISTO PARA PRODUCCIÓN

Sistema 100% funcional con:

- ✅ **Turso Database** (LibSQL edge database)
- ✅ **Drizzle ORM** para queries type-safe
- ✅ **Vercel** hosting optimizado
- ✅ **Sin datos mock** - Todo en tiempo real
- ✅ **APIs REST** validadas con Zod
- ✅ **Rate limiting** y cache inteligente
- ✅ **Error handling** robusto

---

## 📋 PREREQUISITOS

### 1. Variables de Entorno

Asegúrate de tener configurado en Vercel:

```bash
# Base de datos (REQUERIDO)
DATABASE_URL="libsql://tu-proyecto.turso.io"
DATABASE_AUTH_TOKEN="tu_token_aqui"

# Autenticación (REQUERIDO)
NEXTAUTH_URL="https://tu-dominio.vercel.app"
NEXTAUTH_SECRET="tu_secret_key_de_32_caracteres"

# AI APIs (OPCIONAL - Solo si usas funciones de IA)
XAI_API_KEY="tu_key"
ELEVENLABS_API_KEY="tu_key"
GITHUB_MODELS_ENDPOINT="https://models.inference.ai.azure.com"
```

### 2. Turso Database Setup

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login a Turso
turso auth login

# Crear base de datos
turso db create chronos-infinity-2026

# Obtener URL y token
turso db show chronos-infinity-2026 --url
turso db tokens create chronos-infinity-2026
```

---

## 🎬 INICIALIZACIÓN DE BASE DE DATOS

### Opción 1: Producción desde Cero (RECOMENDADO)

Para iniciar con **capital en cero** (operación real):

```bash
# 1. Push del schema a Turso
pnpm db:push

# 2. Seed de producción (7 bancos con capital = 0)
pnpm db:seed:prod
```

**Resultado:**

- ✅ 7 bancos creados (Bóveda Monte, Bóveda USA, Profit, Leftie, Azteca, Flete Sur, Utilidades)
- ✅ Capital inicial: $0 en todos
- ✅ Sin datos de prueba
- ✅ Listo para registrar primera orden de compra

### Opción 2: Con Datos de Prueba (DESARROLLO)

Para testing con datos demo:

```bash
# Seed con capital inicial y datos de ejemplo
pnpm db:seed
```

---

## 🚀 DEPLOY A VERCEL

### Deploy Manual

```bash
# 1. Instalar Vercel CLI
pnpm add -g vercel

# 2. Login
vercel login

# 3. Link al proyecto
vercel link

# 4. Deploy a producción
pnpm deploy:prod
```

### Deploy Automático (Git Push)

1. Conecta tu repo a Vercel Dashboard
2. Configura las variables de entorno en Vercel
3. Push a la rama principal:

```bash
git push origin main
```

Vercel automáticamente:

- ✅ Instala dependencias
- ✅ Ejecuta build
- ✅ Despliega a producción
- ✅ Configura edge functions

---

## 🔧 CONFIGURACIÓN DE VERCEL

### Variables de Entorno Esenciales

En Vercel Dashboard → Settings → Environment Variables:

| Variable              | Valor             | Scope      |
| --------------------- | ----------------- | ---------- |
| `DATABASE_URL`        | Tu URL de Turso   | Production |
| `DATABASE_AUTH_TOKEN` | Token de Turso    | Production |
| `NEXTAUTH_SECRET`     | Secret key único  | Production |
| `NEXTAUTH_URL`        | URL de producción | Production |

### Performance Settings

Ya configurado en `vercel.json`:

- ✅ Edge functions en múltiples regiones
- ✅ Cache headers optimizados
- ✅ Memory: 1024MB para APIs
- ✅ Max duration: 60s (APIs), 120s (AI)

---

## 📊 MONITOREO POST-DEPLOY

### 1. Verificar APIs

```bash
# Bancos
curl https://tu-dominio.vercel.app/api/bancos

# Clientes
curl https://tu-dominio.vercel.app/api/clientes

# Órdenes de Compra
curl https://tu-dominio.vercel.app/api/ordenes
```

### 2. Verificar Base de Datos

```bash
# Conectar a Turso Shell
turso db shell chronos-infinity-2026

# Verificar bancos
SELECT id, nombre, capital_actual FROM bancos;

# Verificar estructura
.tables
```

### 3. Logs en Tiempo Real

```bash
# Ver logs de Vercel
pnpm vercel:logs
```

---

## 🎯 PRIMER USO - FLUJO OPERACIONAL

### 1. Crear Primera Orden de Compra

1. Accede a `/dashboard`
2. Ve a "Órdenes de Compra"
3. Click en "Nueva Orden"
4. Completa el wizard:
   - **Distribuidor**: Crea uno nuevo
   - **Producto**: Registra tu primer producto
   - **Cantidad y Costos**: Define precios
   - **Pago Inicial**: Opcional (si pagas de inmediato)

**Resultado:**

- ✅ Producto creado en almacén
- ✅ Orden registrada
- ✅ Si hay pago: Bóveda Monte se decrementa

### 2. Registrar Primera Venta

1. Ve a "Ventas"
2. Click en "Nueva Venta"
3. Wizard de 4 pasos:
   - **Cliente**: Selecciona o crea
   - **Producto**: De las OCs disponibles
   - **Precios**: Define venta y flete
   - **Pago**: Completo, parcial o pendiente

**Distribución Automática (GYA):**

```
Bóveda Monte  = Costo del producto
Flete Sur     = Costo de transporte
Utilidades    = Ganancia neta
```

### 3. Gestionar Capital

- **Transferencias**: Entre bancos desde el dashboard
- **Movimientos**: Registra gastos/ingresos manuales
- **Cortes**: Visualiza reportes financieros

---

## 🔒 SEGURIDAD

✅ **Implementado:**

- Rate limiting por IP
- Validación Zod en todas las APIs
- SQL injection prevention (Drizzle parameterized queries)
- CORS configurado
- Security headers en vercel.json
- HTTPS enforcement

---

## 🐛 TROUBLESHOOTING

### Error: "DATABASE_URL not found"

```bash
# Verificar variables en Vercel
vercel env ls

# Agregar variable
vercel env add DATABASE_URL
```

### Error: "Failed to connect to Turso"

1. Verifica que el token no haya expirado
2. Regenera token: `turso db tokens create chronos-infinity-2026`
3. Actualiza en Vercel

### Pantalla negra en modales

Ya corregido en última versión. Las APIs ahora manejan correctamente:

```typescript
// Defensivo para ambos formatos de respuesta
const data = Array.isArray(response) ? response : response.data || []
```

---

## 📞 SOPORTE

- **Logs**: `pnpm vercel:logs`
- **Studio DB**: `pnpm db:studio`
- **Health Check**: Accede a `/api/health`

---

## 🎉 CHECKLIST FINAL

Antes de ir a producción:

- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos Turso creada y conectada
- [ ] Schema pushed: `pnpm db:push`
- [ ] Seed de producción ejecutado: `pnpm db:seed:prod`
- [ ] Deploy exitoso en Vercel
- [ ] APIs responden correctamente
- [ ] Dashboard carga sin errores
- [ ] Primera orden de compra registrada (test)
- [ ] Primera venta registrada (test)
- [ ] Distribución GYA funcionando

---

**🚀 Sistema listo para operación real. Sin datos mock. 100% Turso + Drizzle + Vercel.**
