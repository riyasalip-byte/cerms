import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalService } from '@/api/services'
import { toast } from 'sonner'

export function useRentals(params?: any) {
  return useQuery({
    queryKey: ['rentals', params],
    queryFn: () => rentalService.getAll(params)
  })
}

export function useRental(id: string) {
  return useQuery({
    queryKey: ['rentals', id],
    queryFn: () => rentalService.getById(id),
    enabled: !!id
  })
}

export function useCreateRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rentalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] }) // Assets status might change
      toast.success('Rental created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to create rental')
    }
  })
}

export function useUpdateRentalStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) => rentalService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rentals', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Rental status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to update rental status')
    }
  })
}


export function useCloseRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, actualEndDate, currentOdometer }: { id: string; actualEndDate: string; currentOdometer: number }) => {
      try {
        return await rentalService.close(id, { actualEndDate, currentOdometer })
      } catch (error) {
        if (!navigator.onLine) {
          toast.info('Offline: Bill will sync automatically when back online')
          return { offline: true }
        }
        throw error
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      
      if (!data?.offline) {
        toast.success('Rental closed and invoice generated')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to close rental')
    }
  })
}

export function useExtendRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newExpectedEndDate }: { id: string; newExpectedEndDate: string }) => rentalService.extend(id, newExpectedEndDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rentals', variables.id] })
      toast.success('Rental extension recorded')
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to extend rental')
    }
  })
}
