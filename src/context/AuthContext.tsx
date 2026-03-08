import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react'
import Keycloak from 'keycloak-js'
import { apiClient } from '../api/client'

interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
}

interface AuthContextValue {
  authenticated: boolean
  user: User | null
  token: string | null
  loading: boolean
  login: () => void
  logout: () => void
  register: () => void
}

const AuthContext = createContext<AuthContextValue>({
  authenticated: false,
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  register: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

const keycloak = new Keycloak({
  url: 'http://localhost:4000/auth/',
  realm: 'pathly',
  clientId: 'web-app',
})

// Token refresh interval (4 minutes - tokens expire after 5 min)
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const initCalled = useRef(false)

  const updateUserFromToken = useCallback(() => {
    if (keycloak.authenticated && keycloak.tokenParsed) {
      const parsed = keycloak.tokenParsed as Record<string, string>
      setUser({
        id: parsed.sub ?? '',
        username: parsed.preferred_username ?? '',
        email: parsed.email ?? '',
        firstName: parsed.given_name ?? '',
        lastName: parsed.family_name ?? '',
      })
      const newToken = keycloak.token ?? null
      setToken(newToken)
      apiClient.setToken(newToken)
      setAuthenticated(true)
    } else {
      setUser(null)
      setToken(null)
      apiClient.setToken(null)
      setAuthenticated(false)
    }
  }, [])

  useEffect(() => {
    // Guard against React StrictMode double-init
    if (initCalled.current) return
    initCalled.current = true

    keycloak
      .init({
        checkLoginIframe: false,
        enableLogging: false,
      })
      .then(() => {
        updateUserFromToken()
      })
      .catch((err) => {
        console.warn('Keycloak init failed:', err)
      })
      .finally(() => {
        setLoading(false)
      })

    // Token refresh
    const interval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak
          .updateToken(60)
          .then((refreshed) => {
            if (refreshed) {
              const refreshedToken = keycloak.token ?? null
              setToken(refreshedToken)
              apiClient.setToken(refreshedToken)
            }
          })
          .catch(() => {
            console.warn('Token refresh failed')
          })
      }
    }, TOKEN_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [updateUserFromToken])

  const login = useCallback(() => {
    keycloak.login({ redirectUri: window.location.origin + '/' })
  }, [])

  const logout = useCallback(() => {
    keycloak.logout({ redirectUri: window.location.origin + '/' })
  }, [])

  const register = useCallback(() => {
    keycloak.register({ redirectUri: window.location.origin + '/' })
  }, [])

  const value = useMemo(
    () => ({ authenticated, user, token, loading, login, logout, register }),
    [authenticated, user, token, loading, login, logout, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
