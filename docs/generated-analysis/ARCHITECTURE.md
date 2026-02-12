# Documentación Arquitectónica Integral - Chronos Infinity 2026

## 1. Visión General del Sistema

El sistema **Chronos Infinity 2026** es una plataforma de gestión empresarial (ERP) de alto rendimiento diseñada con tecnologías web modernas, enfocada en la gestión de ventas, inventario y finanzas con una experiencia de usuario inmersiva (3D/WebGL).

### Stack Tecnológico

*   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4.
*   **UI/UX**: Framer Motion, GSAP, Three.js (React Three Fiber), Radix UI.
*   **Backend**: Server Actions (Next.js), API Routes.
*   **Base de Datos**: PostgreSQL (vía Drizzle ORM).
*   **Cache/Estado**: Redis (@upstash/redis), React Query, Zustand.
*   **Validación**: Zod.
*   **Observabilidad**: Sentry, OpenTelemetry, Logger personalizado.

## 2. Diagrama de Arquitectura (C4 - Nivel Contenedor)

```mermaid
graph TD
    User[Usuario Operador] -->|HTTPS| WebApp[Next.js Web App]
    WebApp -->|Server Actions| Logic[Lógica de Negocio / Controladores]
    Logic -->|SQL| DB[(PostgreSQL Database)]
    Logic -->|Redis Protocol| Cache[(Redis Cache)]
    WebApp -->|Client Side| 3D[Motor 3D / WebGL]
    Logic -->|API| Ext[Servicios Externos (AI, Auth)]
```

## 3. Mapeo de Componentes Principales

### Módulo de Ventas (`app/_components/chronos-2026/panels/ventas`)
*   **VentasProvider**: Gestión de estado global de ventas y filtros.
*   **VentasHeader**: Controles principales, búsqueda y acciones globales.
*   **VentasStats**: Visualización de KPIs y métricas en tiempo real.
*   **VentasTable**: Listado virtualizado de transacciones.
*   **CreateVentaModal**: Formulario transaccional para nuevas ventas.

### Módulo de Datos (`app/_actions`)
*   **ventas.ts**: Fachada para operaciones de ventas.
*   **flujos-completos.ts**: Orquestador de transacciones atómicas complejas.

## 4. Puntos de Entrada y Salida

### Entradas (Inputs)
*   **Interfaz de Usuario**: Formularios de creación de ventas, abonos, filtros.
*   **API Routes**: Webhooks, endpoints REST para integraciones (`app/api/*`).
*   **Server Actions**: Invocaciones directas desde componentes cliente.

### Salidas (Outputs)
*   **Persistencia**: Escritura en tablas `ventas`, `movimientos`, `bancos`, `almacen`.
*   **Visualización**: Renderizado de datos en tablas y gráficos 3D.
*   **Notificaciones**: Toasts y alertas al usuario.
*   **Exportación**: Generación de archivos CSV/Excel/PDF.

## 5. Catálogo de APIs e Integraciones

| Servicio | Tipo | Propósito |
|----------|------|-----------|
| **PostgreSQL** | Base de Datos | Almacenamiento relacional transaccional. |
| **Redis** | Cache | Rate limiting y caché de consultas frecuentes. |
| **Vercel AI SDK** | AI | Procesamiento de lenguaje natural y análisis. |
| **Sentry** | Monitoreo | Traza de errores y performance. |
