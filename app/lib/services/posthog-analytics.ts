/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2026 — POSTHOG ANALYTICS SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio de analytics avanzado:
 * - Event tracking
 * - Feature flags
 * - A/B testing
 * - Session recordings
 * - User identification
 * - Cohort analysis
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { PostHog } from 'posthog-node'

// ═══════════════════════════════════════════════════════════════════════════════════════
// SERVER-SIDE POSTHOG CLIENT
// ═══════════════════════════════════════════════════════════════════════════════════════

let posthogServer: PostHog | null = null

export function getPostHogServer(): PostHog {
  if (posthogServer) return posthogServer

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    throw new Error('PostHog API key not configured')
  }

  posthogServer = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    flushAt: 20,
    flushInterval: 10000,
  })

  return posthogServer
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EVENT TRACKING
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Track custom event (server-side)
 */
export function trackEvent(
  distinctId: string,
  eventName: string,
  properties?: EventProperties
): void {
  const posthog = getPostHogServer()
  
  posthog.capture({
    distinctId,
    event: eventName,
    properties: {
      ...properties,
      $lib: 'chronos-server',
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Track page view (server-side)
 */
export function trackPageView(
  distinctId: string,
  url: string,
  referrer?: string
): void {
  trackEvent(distinctId, '$pageview', {
    $current_url: url,
    $referrer: referrer || '',
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BUSINESS EVENTS — CHRONOS SPECIFIC
// ═══════════════════════════════════════════════════════════════════════════════════════

export const ChronosEvents = {
  // User lifecycle
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  
  // Dashboard
  DASHBOARD_VIEWED: 'dashboard_viewed',
  WIDGET_INTERACTED: 'widget_interacted',
  FILTER_APPLIED: 'filter_applied',
  
  // Sales & Orders
  SALE_CREATED: 'sale_created',
  ORDER_CREATED: 'order_created',
  PAYMENT_RECEIVED: 'payment_received',
  
  // AI Features
  AI_QUERY_MADE: 'ai_query_made',
  AI_SUGGESTION_ACCEPTED: 'ai_suggestion_accepted',
  AI_SUGGESTION_REJECTED: 'ai_suggestion_rejected',
  
  // Reports
  REPORT_GENERATED: 'report_generated',
  REPORT_EXPORTED: 'report_exported',
  REPORT_SCHEDULED: 'report_scheduled',
  
  // Settings
  SETTINGS_UPDATED: 'settings_updated',
  THEME_CHANGED: 'theme_changed',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
} as const

export type ChronosEventName = (typeof ChronosEvents)[keyof typeof ChronosEvents]

/**
 * Track Chronos-specific events
 */
export function trackChronosEvent(
  distinctId: string,
  event: ChronosEventName,
  properties?: EventProperties
): void {
  trackEvent(distinctId, event, {
    ...properties,
    app: 'chronos',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '3.0.0',
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USER IDENTIFICATION
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface UserProperties {
  email?: string
  name?: string
  role?: string
  plan?: string
  company?: string
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Identify user with properties
 */
export function identifyUser(
  distinctId: string,
  properties: UserProperties
): void {
  const posthog = getPostHogServer()
  
  posthog.identify({
    distinctId,
    properties: {
      ...properties,
      $set_once: {
        first_seen: new Date().toISOString(),
      },
    },
  })
}

/**
 * Alias user IDs (for anonymous → authenticated transitions)
 */
export function aliasUser(distinctId: string, alias: string): void {
  const posthog = getPostHogServer()
  
  posthog.alias({
    distinctId,
    alias,
  })
}

/**
 * Set user properties
 */
export function setUserProperties(
  distinctId: string,
  properties: UserProperties
): void {
  const posthog = getPostHogServer()
  
  posthog.capture({
    distinctId,
    event: '$set',
    properties: {
      $set: properties,
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Check if feature flag is enabled
 */
export async function isFeatureEnabled(
  distinctId: string,
  flagKey: string
): Promise<boolean> {
  const posthog = getPostHogServer()
  
  return await posthog.isFeatureEnabled(flagKey, distinctId) ?? false
}

/**
 * Get feature flag value
 */
export async function getFeatureFlag<T = string | boolean>(
  distinctId: string,
  flagKey: string
): Promise<T | undefined> {
  const posthog = getPostHogServer()
  
  return await posthog.getFeatureFlag(flagKey, distinctId) as T | undefined
}

/**
 * Get all feature flags for user
 */
export async function getAllFeatureFlags(
  distinctId: string
): Promise<Record<string, string | boolean>> {
  const posthog = getPostHogServer()
  
  return await posthog.getAllFlags(distinctId)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GROUPS & COHORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Add user to group (company/organization tracking)
 */
export function groupIdentify(
  distinctId: string,
  groupType: string,
  groupKey: string,
  groupProperties?: EventProperties
): void {
  const posthog = getPostHogServer()
  
  posthog.groupIdentify({
    groupType,
    groupKey,
    properties: groupProperties,
  })

  // Also capture group assignment
  posthog.capture({
    distinctId,
    event: '$groupidentify',
    properties: {
      $group_type: groupType,
      $group_key: groupKey,
      ...groupProperties,
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CHRONOS FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const ChronosFeatureFlags = {
  // UI Features
  NEW_DASHBOARD: 'new_dashboard',
  DARK_MODE_V2: 'dark_mode_v2',
  ADVANCED_CHARTS: 'advanced_charts',
  
  // AI Features
  AI_ASSISTANT: 'ai_assistant',
  AI_INSIGHTS: 'ai_insights',
  AI_PREDICTIONS: 'ai_predictions',
  
  // Business Features
  MULTI_CURRENCY: 'multi_currency',
  ADVANCED_REPORTS: 'advanced_reports',
  BULK_OPERATIONS: 'bulk_operations',
  
  // Beta Features
  BETA_FEATURES: 'beta_features',
  EXPERIMENTAL: 'experimental',
} as const

/**
 * Check Chronos feature flag
 */
export async function isChronosFeatureEnabled(
  distinctId: string,
  flag: keyof typeof ChronosFeatureFlags
): Promise<boolean> {
  return isFeatureEnabled(distinctId, ChronosFeatureFlags[flag])
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// A/B TESTING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Get experiment variant
 */
export async function getExperimentVariant(
  distinctId: string,
  experimentKey: string
): Promise<string | undefined> {
  const posthog = getPostHogServer()
  
  const variant = await posthog.getFeatureFlag(experimentKey, distinctId)
  return typeof variant === 'string' ? variant : undefined
}

/**
 * Track experiment exposure
 */
export function trackExperimentExposure(
  distinctId: string,
  experimentKey: string,
  variant: string
): void {
  trackEvent(distinctId, '$experiment_started', {
    $feature_flag: experimentKey,
    $feature_flag_response: variant,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FLUSH & SHUTDOWN
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Flush all pending events
 */
export async function flush(): Promise<void> {
  if (posthogServer) {
    await posthogServer.flush()
  }
}

/**
 * Shutdown PostHog client
 */
export async function shutdown(): Promise<void> {
  if (posthogServer) {
    await posthogServer.shutdown()
    posthogServer = null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const posthogAnalytics = {
  client: getPostHogServer,
  track: trackEvent,
  trackPageView,
  trackChronosEvent,
  identify: identifyUser,
  alias: aliasUser,
  setProperties: setUserProperties,
  featureFlags: {
    isEnabled: isFeatureEnabled,
    getValue: getFeatureFlag,
    getAll: getAllFeatureFlags,
    isChronosEnabled: isChronosFeatureEnabled,
  },
  groups: {
    identify: groupIdentify,
  },
  experiments: {
    getVariant: getExperimentVariant,
    trackExposure: trackExperimentExposure,
  },
  flush,
  shutdown,
  events: ChronosEvents,
  flags: ChronosFeatureFlags,
}

export default posthogAnalytics
