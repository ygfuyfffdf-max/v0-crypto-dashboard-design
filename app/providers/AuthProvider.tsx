/**
 * 🔒 Authentication Context Provider - MODO LOCAL
 *
 * ⚠️ Firebase deshabilitado - Autenticación simulada
 * Proporciona estado de autenticación a toda la app
 */

'use client'

import { logger } from '@/app/lib/utils/logger'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

// Tipo de usuario simplificado
interface User {
  id: string
  email: string
  nombre: string
  role: 'admin' | 'operator' | 'viewer'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

// Helper para obtener cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] ?? null : null
}

// Helper para establecer cookie con configuración robusta
function setCookie(name: string, value: string, days: number = 30) {
  if (typeof document === 'undefined') return
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

// Helper para eliminar cookie
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar usuario al montar (solo cliente)
  useEffect(() => {
    const loadUser = () => {
      try {
        // Verificar cookie de sesión
        const sessionId = getCookie('chronos-session')
        if (!sessionId) {
          setLoading(false)
          return
        }

        // Cargar datos del usuario desde localStorage
        const stored = localStorage.getItem('chronos-user')
        if (stored) {
          const parsedUser = JSON.parse(stored)
          setUser(parsedUser)
          // Refrescar la cookie para mantenerla activa
          setCookie('chronos-session', parsedUser.id, 30)
        }
      } catch (error) {
        logger.error('Error loading user', error as Error, { context: 'AuthProvider' })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      logger.info('Auth: signIn called', { context: 'AuthProvider', data: { email } })

      // Por ahora, autenticar cualquier usuario
      const newUser: User = {
        id: 'user-' + Date.now(),
        email,
        nombre: email.split('@')[0] || 'Usuario',
        role: 'admin',
      }

      // Guardar en localStorage
      localStorage.setItem('chronos-user', JSON.stringify(newUser))

      // Establecer cookie de sesión (30 días)
      setCookie('chronos-session', newUser.id, 30)

      setUser(newUser)
    } catch (error) {
      logger.error('Error en signIn', error as Error, { context: 'AuthProvider' })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      logger.info('Auth: signOut called', { context: 'AuthProvider' })

      // Limpiar localStorage y cookies
      localStorage.removeItem('chronos-user')
      deleteCookie('chronos-session')

      setUser(null)
    } catch (error) {
      logger.error('Error en signOut', error as Error, { context: 'AuthProvider' })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
