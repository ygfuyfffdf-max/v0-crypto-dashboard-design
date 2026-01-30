/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔐 CHRONOS INFINITY 2026 — CLERK WEBHOOKS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Webhook handler para eventos de Clerk:
 * - User created/updated/deleted
 * - Session events
 * - Organization events
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { posthogAnalytics, ablyRealtime, sentryMonitoring } from '@/app/lib/services'

// Use nodejs runtime since services use Node.js modules
export const runtime = 'nodejs'

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  // Verify webhook signature
  if (!CLERK_WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await request.text()

  let event: WebhookEvent

  try {
    const wh = new Webhook(CLERK_WEBHOOK_SECRET)
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (error) {
    console.error('Webhook verification failed:', error)
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  // Handle events
  try {
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = event.data
        const email = email_addresses?.[0]?.email_address

        // Track in PostHog
        posthogAnalytics.identify(id, {
          email,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          role: 'user',
        })
        posthogAnalytics.trackChronosEvent(id, 'user_signed_up', {
          method: 'clerk',
        })

        // Notify via realtime
        await ablyRealtime.broadcast('user:created', {
          userId: id,
          email,
        })

        console.log('✅ User created:', id)
        break
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, public_metadata } = event.data
        const email = email_addresses?.[0]?.email_address

        // Update PostHog
        posthogAnalytics.setProperties(id, {
          email,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          role: public_metadata?.role as string || 'user',
        })

        console.log('✅ User updated:', id)
        break
      }

      case 'user.deleted': {
        const { id } = event.data

        if (id) {
          // Track deletion
          posthogAnalytics.trackChronosEvent(id, 'user_signed_out', {
            reason: 'account_deleted',
          })

          console.log('✅ User deleted:', id)
        }
        break
      }

      case 'session.created': {
        const { user_id } = event.data

        if (user_id) {
          posthogAnalytics.trackChronosEvent(user_id, 'user_signed_in', {
            method: 'clerk',
          })
        }
        break
      }

      case 'session.ended': {
        const { user_id } = event.data

        if (user_id) {
          posthogAnalytics.trackChronosEvent(user_id, 'user_signed_out', {})
        }
        break
      }

      default:
        console.log('Unhandled webhook event:', event.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    sentryMonitoring.captureChronosError(error, 'api_error', {
      extra: { event: event.type },
    })
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }
}
