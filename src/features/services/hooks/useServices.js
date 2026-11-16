import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { servicesApi } from '../api/servicesApi'

export const servicesKeys = {
  all: ['services'],
  list: (filters) => [...servicesKeys.all, 'list', filters],
  detail: (serviceId) => [...servicesKeys.all, 'detail', serviceId],
}

export function useServices(filters) {
  return useQuery({
    queryKey: servicesKeys.list(filters),
    queryFn: () => servicesApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useService(serviceId) {
  return useQuery({
    queryKey: servicesKeys.detail(serviceId),
    queryFn: () => servicesApi.getById(serviceId),
    enabled: Boolean(serviceId),
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    // O segundo argumento só é usado pelo mock; o backend real identifica o prestador pelo token.
    mutationFn: (data) => servicesApi.create(data, { providerId: user?.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: servicesKeys.all }),
  })
}
