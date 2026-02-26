/**
 * 🤖 Bot Detection Utility
 * Lightweight bot detection based on request headers
 * Replaces non-existent 'botid/server' package
 */

import { headers } from 'next/headers'

interface BotCheckResult {
  isBot: boolean
  reason?: string
}

const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /httpx/i,
  /postman/i,
]

/**
 * Checks if the current request is from a bot
 * by analyzing the User-Agent header
 */
export async function checkBotId(): Promise<BotCheckResult> {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''

    for (const pattern of BOT_PATTERNS) {
      if (pattern.test(userAgent)) {
        return { isBot: true, reason: `Matched pattern: ${pattern}` }
      }
    }

    return { isBot: false }
  } catch {
    // If headers aren't available (e.g., during build), assume not a bot
    return { isBot: false }
  }
}
