# ═══════════════════════════════════════════════════════════════════════════

# SECURITY.md - Política de Seguridad CHRONOS

# ═══════════════════════════════════════════════════════════════════════════

## 🔐 Reporting Security Vulnerabilities

**Si encuentras una vulnerabilidad de seguridad, por favor NO la reportes públicamente.**

### Reportar de forma segura:

1. Envía un email a: security@chronos-system.com (cuando esté disponible)
2. Usa GitHub Private Security Reporting
3. Incluye:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Impacto potencial
   - Versión afectada

## 🛡️ Políticas de Seguridad

### Autenticación y Autorización

- Todas las operaciones críticas requieren autenticación
- JWT tokens con expiración corta (15min)
- Refresh tokens rotatorios
- Rate limiting en endpoints

### Datos Sensibles

- Encriptación en tránsito (HTTPS/TLS 1.3)
- Encriptación en reposo (Turso/SQLite cifrado)
- Sanitización de inputs
- Validación con Zod schemas

### Base de Datos

- Queries parametrizadas (Drizzle ORM)
- Prepared statements
- Validación de esquemas
- Backups encriptados

### Frontend

- CSP headers configurados
- XSS protection habilitada
- CSRF tokens
- Sanitización HTML

## 🔒 Environment Variables

**NUNCA commitees archivos con credenciales reales:**

```bash
# ❌ PROHIBIDO en .env
TURSO_DATABASE_URL="libsql://real-production-url.turso.io"
TURSO_AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ✅ CORRECTO usar placeholders
TURSO_DATABASE_URL="file:./local-dev.db"
TURSO_AUTH_TOKEN="placeholder_token_for_development"
```

### Variables Requeridas:

- `NEXT_PUBLIC_BASE_URL`: URL base de la aplicación
- `TURSO_DATABASE_URL`: URL de la base de datos
- `TURSO_AUTH_TOKEN`: Token de autenticación
- `NEXTAUTH_SECRET`: Secret para NextAuth.js
- `OPENAI_API_KEY`: Opcional para funciones IA
- `SENTRY_DSN`: Opcional para monitoring

## 📋 Security Checklist

- [ ] Credenciales en variables de entorno
- [ ] Dependencies sin vulnerabilidades conocidas
- [ ] CSP headers configurados
- [ ] Rate limiting implementado
- [ ] Input validation con Zod
- [ ] SQL injection protection (Drizzle)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure headers
- [ ] HTTPS en producción

## 🚨 Respuesta a Incidentes

1. **Contención**: Aislar el problema
2. **Evaluación**: Determinar impacto
3. **Comunicación**: Notificar stakeholders
4. **Resolución**: Implementar fix
5. **Recuperación**: Restaurar servicios
6. **Lecciones**: Documentar aprendizajes

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Turso Security](https://docs.turso.tech/security)
- [Drizzle Security](https://orm.drizzle.team/docs/security)
