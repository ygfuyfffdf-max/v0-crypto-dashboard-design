/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📅 CHRONOS INFINITY 2026 — DAILY REPORT CRON
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Cron job para generar y enviar reportes diarios:
 * - Se ejecuta a las 8:00 AM diariamente
 * - Envía resumen a administradores
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server'
import { resendEmail, posthogAnalytics, sentryMonitoring } from '@/app/lib/services'

// Use nodejs runtime since services use Node.js modules
export const runtime = 'nodejs'
export const maxDuration = 60

// Verify cron secret
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    const dateStr = today.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Track cron execution
    posthogAnalytics.trackEvent('cron-system', 'daily_report_started', {
      date: dateStr,
    })

    // Generate report data (placeholder - integrate with your actual data)
    const reportData = {
      date: dateStr,
      totalSales: '0.00',
      ordersCount: 0,
      newClients: 0,
      dashboardUrl: process.env.NEXT_PUBLIC_APP_URL + '/dashboard',
    }

    // Get admin emails from environment
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

    if (adminEmails.length > 0) {
      // Send report to admins
      await resendEmail.sendTemplate(
        adminEmails,
        'daily_report',
        reportData
      )
    }

    // Track completion
    posthogAnalytics.trackEvent('cron-system', 'daily_report_completed', {
      date: dateStr,
      recipients: adminEmails.length,
    })

    return NextResponse.json({
      success: true,
      date: dateStr,
      recipients: adminEmails.length,
    })
  } catch (error) {
    console.error('Daily report cron error:', error)
    sentryMonitoring.captureChronosError(error, 'api_error', {
      extra: { cron: 'daily-report' },
    })
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
