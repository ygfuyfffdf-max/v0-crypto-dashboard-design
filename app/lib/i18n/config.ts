/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - i18n Configuration                     ║
 * ║                    Configuración de Internacionalización                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'es'

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}

export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇺🇸',
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
