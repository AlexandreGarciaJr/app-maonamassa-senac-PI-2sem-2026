import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { sessionStore } from '@/lib/storage'
import { authApi } from '../api/authApi'
import { AuthContext } from './authContext'

/** Guarda a sessão do usuário (token + dados) e expõe login, cadastro e logout. */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState(() => sessionStore.get())

  const startSession = useCallback((newSession) => {
    sessionStore.set(newSession)
    setSession(newSession)
    return newSession.user
  }, [])

  const login = useCallback(
    async (credentials) => startSession(await authApi.login(credentials)),
    [startSession],
  )

  const register = useCallback(
    async (data) => startSession(await authApi.register(data)),
    [startSession],
  )

  const logout = useCallback(() => {
    sessionStore.clear()
    setSession(null)
    queryClient.clear()
  }, [queryClient])

  /** Atualiza dados/preferências do usuário logado e mantém a sessão em dia. */
  const updateProfile = useCallback(
    async (patch) => {
      const user = await authApi.updateMe(patch, { userId: session?.user?.id })
      startSession({ ...session, user: { ...session.user, ...user } })
      return user
    },
    [session, startSession],
  )

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      logout,
      updateProfile,
    }),
    [session, login, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
