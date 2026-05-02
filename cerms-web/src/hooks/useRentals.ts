import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalService } from '@/api/services'
import { toast } from 'sonner'

export function useRentals(params?: any) {
  return useQuery({
    queryKey: ['rentals', params],
    queryFn: () => rentalService.getRentals(params)
  })
}

export function useRental(id: string) {
  return useQuery({
    queryKey: ['rentals', id],
    queryFn: () => rentalService.getRentalById(id),
    enabled: !!id
  })
}

export function useCreateRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rentalService.createRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Rental created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to create rental')
    }
  })
}

export function useConfirmRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rentalService.confirmRental(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rentals', id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Rental confirmed')
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to confirm rental')
    }
  })
}

export function useStartRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, startOdometer }: { id: string; startOdometer: number }) => rentalService.startRental(id, { startOdometer }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rentals', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Rental started successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to start rental')
    }
  })
}

export function useCloseRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, actualEndDateTime, endOdometer }: { id: string; actualEndDateTime: string; endOdometer: number }) => {
      try {
        return await rentalService.closeRental(id, { actualEndDateTime, endOdometer })
      } catch (error) {
        if (!navigator.onLine) {
          toast.info('Offline: Close will sync automatically when back online')
          return { offline: true }
        }
        throw error
      }
    },
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rentals', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      
      if (!data?.offline) {
        toast.success('Rental successfully closed and billing calculated')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to close rental')
    }
  })
}
