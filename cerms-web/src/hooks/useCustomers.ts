import { useQuery } from '@tanstack/react-query'
import { customerService } from '@/api/services'

export function useCustomers(params?: any) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.getAll(params)
  })
}
