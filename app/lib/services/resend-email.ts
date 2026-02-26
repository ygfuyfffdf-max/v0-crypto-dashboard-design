// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📧 CHRONOS INFINITY 2026 — RESEND EMAIL SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio de emails transaccionales:
 * - Envío de emails con templates
 * - Batch sending
 * - Email scheduling
 * - Analytics de emails
 * - Webhooks de delivery
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { Resend } from 'resend'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  react?: React.ReactElement
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
  tags?: Array<{
    name: string
    value: string
  }>
  headers?: Record<string, string>
  scheduledAt?: string
}

export interface EmailResult {
  id: string
  success: boolean
  error?: string
}

export interface BatchEmailResult {
  data: EmailResult[]
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// RESEND CLIENT
// ═══════════════════════════════════════════════════════════════════════════════════════

let resendClient: Resend | null = null

export function getResend(): Resend {
  if (resendClient) return resendClient

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('❌ Resend API key not configured')
  }

  resendClient = new Resend(apiKey)
  return resendClient
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES — CHRONOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const EmailTemplates = {
  // Authentication
  WELCOME: 'welcome',
  VERIFY_EMAIL: 'verify_email',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_CHANGED: 'password_changed',
  
  // Notifications
  ORDER_CONFIRMATION: 'order_confirmation',
  ORDER_STATUS_UPDATE: 'order_status_update',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_REMINDER: 'payment_reminder',
  
  // Reports
  DAILY_REPORT: 'daily_report',
  WEEKLY_REPORT: 'weekly_report',
  MONTHLY_REPORT: 'monthly_report',
  
  // Alerts
  LOW_STOCK_ALERT: 'low_stock_alert',
  SYSTEM_ALERT: 'system_alert',
  
  // Marketing
  NEWSLETTER: 'newsletter',
  PROMOTION: 'promotion',
} as const

export type EmailTemplate = (typeof EmailTemplates)[keyof typeof EmailTemplates]

// ═══════════════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_FROM = `${process.env.EMAIL_FROM_NAME || 'CHRONOS System'} <${process.env.EMAIL_FROM || 'noreply@chronos.app'}>`

// ═══════════════════════════════════════════════════════════════════════════════════════
// SEND EMAIL
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Send single email
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const resend = getResend()

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      react: options.react,
      reply_to: options.replyTo,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
      attachments: options.attachments,
      tags: options.tags,
      headers: options.headers,
      scheduled_at: options.scheduledAt,
    })

    if (error) {
      return {
        id: '',
        success: false,
        error: error.message,
      }
    }

    return {
      id: data?.id || '',
      success: true,
    }
  } catch (error) {
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send batch emails
 */
export async function sendBatchEmails(
  emails: EmailOptions[]
): Promise<BatchEmailResult> {
  const resend = getResend()

  try {
    const { data, error } = await resend.batch.send(
      emails.map((email) => ({
        from: email.from || DEFAULT_FROM,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        react: email.react,
        reply_to: email.replyTo,
        tags: email.tags,
      }))
    )

    if (error) {
      return {
        data: [],
        error: error.message,
      }
    }

    return {
      data: (data?.data || []).map((d) => ({
        id: d.id,
        success: true,
      })),
    }
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TEMPLATE-BASED EMAILS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Generate HTML from template
 */
function generateEmailHtml(
  template: EmailTemplate,
  data: Record<string, unknown>
): string {
  // Base styles
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #0a0a0a;
    color: #e5e5e5;
    padding: 40px;
  `

  const headerStyles = `
    background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
    padding: 30px;
    border-radius: 12px 12px 0 0;
    text-align: center;
  `

  const contentStyles = `
    background-color: #171717;
    padding: 30px;
    border-radius: 0 0 12px 12px;
  `

  const buttonStyles = `
    display: inline-block;
    background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin: 16px 0;
  `

  const templates: Record<EmailTemplate, string> = {
    welcome: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">🚀 ¡Bienvenido a CHRONOS!</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hola <strong>${data.name || 'Usuario'}</strong>,</p>
          <p>Tu cuenta ha sido creada exitosamente. Estás listo para comenzar a usar CHRONOS Infinity 2026.</p>
          <a href="${data.dashboardUrl || '#'}" style="${buttonStyles}">Ir al Dashboard</a>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
      </div>
    `,
    verify_email: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">✉️ Verifica tu Email</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hola <strong>${data.name || 'Usuario'}</strong>,</p>
          <p>Por favor verifica tu dirección de email haciendo clic en el botón:</p>
          <a href="${data.verifyUrl || '#'}" style="${buttonStyles}">Verificar Email</a>
          <p style="color: #888; font-size: 12px;">
            Este enlace expira en 24 horas. Si no solicitaste esta verificación, ignora este email.
          </p>
        </div>
      </div>
    `,
    password_reset: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">🔐 Restablecer Contraseña</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hola <strong>${data.name || 'Usuario'}</strong>,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña:</p>
          <a href="${data.resetUrl || '#'}" style="${buttonStyles}">Restablecer Contraseña</a>
          <p style="color: #888; font-size: 12px;">
            Este enlace expira en 1 hora. Si no solicitaste esto, contacta soporte inmediatamente.
          </p>
        </div>
      </div>
    `,
    password_changed: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">✅ Contraseña Actualizada</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hola <strong>${data.name || 'Usuario'}</strong>,</p>
          <p>Tu contraseña ha sido actualizada exitosamente el ${data.date || new Date().toLocaleDateString()}.</p>
          <p style="color: #888; font-size: 12px;">
            Si no realizaste este cambio, contacta soporte inmediatamente.
          </p>
        </div>
      </div>
    `,
    order_confirmation: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">📦 Orden Confirmada</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hola <strong>${data.clientName || 'Cliente'}</strong>,</p>
          <p>Tu orden <strong>#${data.orderNumber || '---'}</strong> ha sido confirmada.</p>
          <p><strong>Total:</strong> $${data.total || '0.00'}</p>
          <a href="${data.orderUrl || '#'}" style="${buttonStyles}">Ver Orden</a>
        </div>
      </div>
    `,
    order_status_update: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">🔄 Actualización de Orden</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hola <strong>${data.clientName || 'Cliente'}</strong>,</p>
          <p>Tu orden <strong>#${data.orderNumber || '---'}</strong> ha sido actualizada.</p>
          <p><strong>Nuevo Estado:</strong> ${data.status || 'Desconocido'}</p>
          <a href="${data.orderUrl || '#'}" style="${buttonStyles}">Ver Detalles</a>
        </div>
      </div>
    `,
    payment_received: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">💰 Pago Recibido</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hola <strong>${data.clientName || 'Cliente'}</strong>,</p>
          <p>Hemos recibido tu pago de <strong>$${data.amount || '0.00'}</strong>.</p>
          <p><strong>Referencia:</strong> ${data.reference || '---'}</p>
          <p style="color: #22c55e;">¡Gracias por tu pago!</p>
        </div>
      </div>
    `,
    payment_reminder: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">⏰ Recordatorio de Pago</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hola <strong>${data.clientName || 'Cliente'}</strong>,</p>
          <p>Te recordamos que tienes un pago pendiente de <strong>$${data.amount || '0.00'}</strong>.</p>
          <p><strong>Vencimiento:</strong> ${data.dueDate || '---'}</p>
          <a href="${data.paymentUrl || '#'}" style="${buttonStyles}">Realizar Pago</a>
        </div>
      </div>
    `,
    daily_report: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">📊 Reporte Diario</h1>
        </div>
        <div style="${contentStyles}">
          <p>Aquí está tu resumen del día <strong>${data.date || new Date().toLocaleDateString()}</strong>:</p>
          <ul style="list-style: none; padding: 0;">
            <li>💵 Ventas: $${data.totalSales || '0.00'}</li>
            <li>📦 Órdenes: ${data.ordersCount || 0}</li>
            <li>👥 Nuevos clientes: ${data.newClients || 0}</li>
          </ul>
          <a href="${data.dashboardUrl || '#'}" style="${buttonStyles}">Ver Dashboard</a>
        </div>
      </div>
    `,
    weekly_report: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">📈 Reporte Semanal</h1>
        </div>
        <div style="${contentStyles}">
          <p>Resumen de la semana ${data.weekNumber || ''}:</p>
          <ul style="list-style: none; padding: 0;">
            <li>💵 Ventas totales: $${data.totalSales || '0.00'}</li>
            <li>📦 Órdenes completadas: ${data.ordersCompleted || 0}</li>
            <li>📈 Crecimiento: ${data.growth || '0'}%</li>
          </ul>
          <a href="${data.reportUrl || '#'}" style="${buttonStyles}">Ver Reporte Completo</a>
        </div>
      </div>
    `,
    monthly_report: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">📅 Reporte Mensual</h1>
        </div>
        <div style="${contentStyles}">
          <p>Resumen del mes de <strong>${data.month || ''}</strong>:</p>
          <ul style="list-style: none; padding: 0;">
            <li>💵 Ingresos: $${data.revenue || '0.00'}</li>
            <li>📊 Utilidad: $${data.profit || '0.00'}</li>
            <li>📈 vs mes anterior: ${data.monthOverMonth || '0'}%</li>
          </ul>
          <a href="${data.reportUrl || '#'}" style="${buttonStyles}">Ver Análisis Completo</a>
        </div>
      </div>
    `,
    low_stock_alert: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">⚠️ Alerta de Stock Bajo</h1>
        </div>
        <div style="${contentStyles}">
          <p style="color: #fbbf24;">Los siguientes productos tienen stock bajo:</p>
          <ul>
            ${(data.products as string[] || []).map((p: string) => `<li>${p}</li>`).join('')}
          </ul>
          <a href="${data.inventoryUrl || '#'}" style="${buttonStyles}">Ver Inventario</a>
        </div>
      </div>
    `,
    system_alert: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">🚨 Alerta del Sistema</h1>
        </div>
        <div style="${contentStyles}">
          <p><strong>Tipo:</strong> ${data.alertType || 'General'}</p>
          <p><strong>Mensaje:</strong> ${data.message || 'Sin mensaje'}</p>
          <p><strong>Fecha:</strong> ${data.timestamp || new Date().toISOString()}</p>
        </div>
      </div>
    `,
    newsletter: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">📰 ${data.title || 'Newsletter CHRONOS'}</h1>
        </div>
        <div style="${contentStyles}">
          ${data.content || '<p>Sin contenido</p>'}
        </div>
      </div>
    `,
    promotion: `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="color: white; margin: 0;">🎉 ${data.title || 'Promoción Especial'}</h1>
        </div>
        <div style="${contentStyles}">
          <p>${data.description || ''}</p>
          <p style="font-size: 24px; font-weight: bold; color: #22c55e;">${data.discount || ''}% DESCUENTO</p>
          <a href="${data.promoUrl || '#'}" style="${buttonStyles}">Ver Promoción</a>
          <p style="color: #888; font-size: 12px;">Válido hasta: ${data.validUntil || 'Sin fecha'}</p>
        </div>
      </div>
    `,
  }

  return templates[template] || templates.welcome
}

/**
 * Send template-based email
 */
export async function sendTemplateEmail(
  to: string | string[],
  template: EmailTemplate,
  data: Record<string, unknown>,
  options?: Partial<EmailOptions>
): Promise<EmailResult> {
  const subjects: Record<EmailTemplate, string> = {
    welcome: '🚀 ¡Bienvenido a CHRONOS!',
    verify_email: '✉️ Verifica tu Email - CHRONOS',
    password_reset: '🔐 Restablecer Contraseña - CHRONOS',
    password_changed: '✅ Contraseña Actualizada - CHRONOS',
    order_confirmation: `📦 Orden #${data.orderNumber || ''} Confirmada`,
    order_status_update: `🔄 Actualización de Orden #${data.orderNumber || ''}`,
    payment_received: '💰 Pago Recibido - CHRONOS',
    payment_reminder: '⏰ Recordatorio de Pago - CHRONOS',
    daily_report: `📊 Reporte Diario - ${data.date || ''}`,
    weekly_report: `📈 Reporte Semanal ${data.weekNumber || ''}`,
    monthly_report: `📅 Reporte Mensual - ${data.month || ''}`,
    low_stock_alert: '⚠️ Alerta de Stock Bajo - CHRONOS',
    system_alert: '🚨 Alerta del Sistema - CHRONOS',
    newsletter: `📰 ${data.title || 'Newsletter CHRONOS'}`,
    promotion: `🎉 ${data.title || 'Promoción Especial'}`,
  }

  return sendEmail({
    to,
    subject: options?.subject || subjects[template],
    html: generateEmailHtml(template, data),
    tags: [
      { name: 'template', value: template },
      { name: 'app', value: 'chronos' },
    ],
    ...options,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// AUDIENCE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Add contact to audience
 */
export async function addToAudience(
  audienceId: string,
  contact: {
    email: string
    firstName?: string
    lastName?: string
    unsubscribed?: boolean
  }
): Promise<{ id: string; success: boolean }> {
  const resend = getResend()

  try {
    const { data, error } = await resend.contacts.create({
      audienceId,
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      unsubscribed: contact.unsubscribed || false,
    })

    if (error) {
      return { id: '', success: false }
    }

    return { id: data?.id || '', success: true }
  } catch {
    return { id: '', success: false }
  }
}

/**
 * Remove contact from audience
 */
export async function removeFromAudience(
  audienceId: string,
  contactId: string
): Promise<boolean> {
  const resend = getResend()

  try {
    await resend.contacts.remove({
      audienceId,
      id: contactId,
    })
    return true
  } catch {
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  details?: string
}> {
  const start = Date.now()
  
  try {
    const resend = getResend()
    await resend.domains.list()
    const latency = Date.now() - start
    
    return {
      status: latency < 500 ? 'healthy' : 'degraded',
      latency,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const resendEmail = {
  client: getResend,
  send: sendEmail,
  sendBatch: sendBatchEmails,
  sendTemplate: sendTemplateEmail,
  audience: {
    add: addToAudience,
    remove: removeFromAudience,
  },
  health: healthCheck,
  templates: EmailTemplates,
}

export default resendEmail
