import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as customersApi from '@/api/customers'
import { toast } from 'sonner'

export function useCustomers(params?: customersApi.GetCustomersParams) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersApi.getCustomers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersApi.getCustomerById(id),
    enabled: !!id
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customersApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to create customer')
    }
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: customersApi.UpdateCustomerRequest }) =>
      customersApi.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] })
      toast.success('Customer updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to update customer')
    }
  })
}

export function useDeactivateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customersApi.deactivateCustomer,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', id] })
      toast.success('Customer deactivated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to deactivate customer')
    }
  })
}
