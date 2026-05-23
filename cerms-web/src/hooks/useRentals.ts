import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalService, type CompleteRentalPayload } from '@/api/services'
import { toast } from 'sonner'

function getErrorMessage(error: any, fallback: string) {
  const data = error.response?.data

  if (typeof data === 'string') return data
  if (Array.isArray(data?.errors)) return data.errors.join(', ')
  if (data?.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat()
    if (messages.length) return messages.join(', ')
  }

  return data?.error || data?.detail || error.message || data?.title || fallback
}

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
      toast.error(getErrorMessage(error, 'Failed to create rental'))
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
      toast.error(getErrorMessage(error, 'Failed to confirm rental'))
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
      toast.error(getErrorMessage(error, 'Failed to start rental'))
    }
  })
}

export function useDispatchRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rentalService.dispatchRental(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rentals', id] })
      toast.success('Rental dispatched and out for delivery')
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to dispatch rental'))
    }
  })
}

export function useCancelRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rentalService.cancelRental(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rentals', id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Rental agreement cancelled successfully')
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to cancel rental'))
    }
  })
}

export function useCompleteRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & CompleteRentalPayload) => {
      try {
        return await rentalService.completeRental(id, data)
      } catch (error) {
        if (!navigator.onLine) {
          toast.info('Offline: Completion will sync automatically when back online')
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
        toast.success('Rental successfully completed and billing finalized')
      }
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to complete rental'))
    }
  })
}

export function useCloseRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rentalService.closeRental(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rentals', id] })
      toast.success('Rental booking closed and archived')
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to close rental'))
    }
  })
}

export function useUpdateRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => rentalService.updateRental(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['rentals', variables.id] })
      toast.success('Rental details updated successfully')
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update rental details'))
    }
  })
}
