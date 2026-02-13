# Correcciones para producción — WebGL, Clerk y CSS

## 1. WebGL context lost y TypeError `length` undefined

**Problema:** Al perderse el contexto WebGL (pestaña en segundo plano, GPU ocupada, etc.), la librería `postprocessing` (EffectComposer) accedía a propiedades de un objeto indefinido, generando:

- `WebGL context was lost`
- `Uncaught TypeError: can't access property "length", t is undefined`

**Solución aplicada:**

- **WebGLErrorBoundary:** Componente de error boundary que captura cualquier error en el árbol WebGL/Three.js y deja de renderizar el 3D sin tumbar la app. Ubicación: `app/_components/chronos-2026/3d/WebGLErrorBoundary.tsx`.
- **SafeEffectComposer:**
  - Listener de `webglcontextlost` en el canvas: al detectar pérdida de contexto se marca error y se deja de renderizar el EffectComposer.
  - Comprobación de `isContextLost()` antes de considerar el contexto listo.
- **Uso del boundary:** Todos los usos de `<Canvas>` (OrbFondoVivo, EnhancedOrbFondoVivo, SilverSpaceThreeBackground, Scene3D) están envueltos en `<WebGLErrorBoundary>`.

Con esto, si el contexto se pierde o la librería lanza el `TypeError`, la UI sigue funcionando; solo se oculta el fondo 3D.

---

## 2. Clerk: claves de desarrollo y cookies rechazadas

**Problema:**

- Mensaje: *"Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production."*
- Cookie `__clerk_test_etld` rechazada por “dominio no válido” en el dominio de Vercel.

**Causa:** En el proyecto de Vercel se están usando claves de **desarrollo** (`pk_test_...` / `sk_test_...`) y/o el dominio de producción no está configurado en Clerk.

**Qué hacer en producción:**

1. En [Clerk Dashboard](https://dashboard.clerk.com): crear o usar una **instancia de producción**.
2. Obtener las claves de **producción**: `pk_live_...` y `sk_live_...`.
3. En Vercel → proyecto → Settings → Environment Variables, definir:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...`
   - `CLERK_SECRET_KEY` = `sk_live_...`
   (y las mismas para Production si usas Preview con dominio propio.)
4. En Clerk Dashboard → **Domains**: añadir el dominio de producción (ej. `tu-app.vercel.app` o tu dominio custom).
5. Redesplegar tras cambiar las variables.

Con claves de producción y dominio correcto, el aviso de “development keys” y el rechazo de la cookie `__clerk_test_etld` dejan de aparecer en producción.

---

## 3. Advertencias CSS (opcional)

Los mensajes del tipo:

- *"Error al analizar el valor para '-webkit-text-size-adjust'"*
- *"Error al analizar el valor para 'grid-template-columns'"*
- *"Propiedad desconocida '-moz-osx-font-smoothing'"*
- *"Juego de reglas ignoradas debido a un mal selector"*
- *"Se encontró un valor inválido para una propiedad de medios"*

suelen venir del CSS generado (p. ej. Tailwind) o de prefijos propietarios en navegadores que no los soportan. No suelen romper la app; solo indican que alguna regla no se aplica en ese entorno. Si se quiere reducir avisos, se puede revisar:

- Uso de `-webkit-` / `-moz-` en `globals.css` o en componentes.
- Selectores complejos o modernos (p. ej. `:has()`) y su soporte en el navegador.
- Media queries con sintaxis no estándar.

No es obligatorio para tener “0 errores” funcionales; los críticos eran WebGL y Clerk.

---

## 4. Resumen de archivos tocados

- `app/_components/chronos-2026/3d/WebGLErrorBoundary.tsx` — nuevo.
- `app/_components/chronos-2026/3d/effects/SafeEffectComposer.tsx` — listener context lost y comprobación `isContextLost`.
- `app/_components/chronos-2026/3d/OrbFondoVivo.tsx` — envuelto en WebGLErrorBoundary.
- `app/_components/chronos-2026/3d/EnhancedOrbFondoVivo.tsx` — envuelto en WebGLErrorBoundary.
- `app/_components/cinematics/SilverSpaceThreeBackground.tsx` — envuelto en WebGLErrorBoundary.
- `app/_lib/3d/components/Scene3D.tsx` — envuelto en WebGLErrorBoundary.
- `.env.example` — comentarios sobre uso de claves de producción de Clerk.
- `docs/FIXES_PRODUCCION_WEBGL_CLERK.md` — este documento.

Tras desplegar de nuevo y configurar Clerk en producción como arriba, los flujos operacionales, formularios, base de datos y componentes UI deberían seguir funcionando con 0 errores críticos incluso si el contexto WebGL se pierde.
