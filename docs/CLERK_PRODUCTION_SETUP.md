# Guía de Configuración de Clerk para Producción (Vercel)

Para eliminar los mensajes de "Clerk has been loaded with development keys" y asegurar la autenticación en producción, debes configurar las claves de entorno manualmente en Vercel.

## 1. Obtener Claves de Producción
1. Ve al Dashboard de Clerk: https://dashboard.clerk.com/
2. Selecciona tu aplicación.
3. En el menú superior, cambia de **Development** a **Production**. (Si no tienes una instancia de producción, crea una haciendo clic en "Create production instance").
4. Ve a **API Keys** en el menú lateral.
5. Copia las siguientes claves:
   - `Publishable Key` (empieza con `pk_live_...`)
   - `Secret Key` (empieza con `sk_live_...`)

## 2. Configurar en Vercel
1. Ve a tu proyecto en Vercel.
2. Ve a **Settings** > **Environment Variables**.
3. Agrega/Edita las siguientes variables para el entorno **Production**:

| Nombre Variable | Valor (Ejemplo) | Entorno |
|-----------------|-----------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_xxxxxxxx` | Production |
| `CLERK_SECRET_KEY` | `sk_live_xxxxxxxx` | Production |

## 3. Redesplegar
Una vez agregadas las variables, debes hacer un **Redeploy** en Vercel para que tomen efecto.
1. Ve a **Deployments**.
2. Haz clic en el último despliegue.
3. Haz clic en los tres puntos (...) > **Redeploy**.

Esto eliminará el aviso de desarrollo y habilitará la autenticación segura real.
