import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { hiringApi } from '../api/hiringApi'

export const hiringKeys = {
  all: ['hire-requests'],
  mine: (userId) => [...hiringKeys.all, 'mine', userId],
  detail: (requestId) => [...hiringKeys.all, 'detail', requestId],
}

export function useMyHireRequests() {
  const { user } = useAuth()
  return useQuery({
    queryKey: hiringKeys.mine(user?.id),
    queryFn: () => hiringApi.listMine({ userId: user.id, role: user.role }),
    enabled: Boolean(user),
  })
}

export function useCreateHireRequest() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => hiringApi.create(data, { clientId: user?.id, clientName: user?.name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hiringKeys.all }),
  })
}

export function useHireRequest(requestId) {
  const { user } = useAuth()
  return useQuery({
    queryKey: hiringKeys.detail(requestId),
    queryFn: () => hiringApi.getById(requestId, { userId: user?.id }),
    enabled: Boolean(requestId && user),
  })
}

/** Cancelar (cliente), aceitar/recusar (prestador) ou confirmar conclusão (cliente). */
export function useUpdateHireStatus() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId, status }) =>
      hiringApi.updateStatus(requestId, status, { role: user?.role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hiringKeys.all }),
  })
}
