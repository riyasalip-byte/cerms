import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rentalService, type CloseRentalPayload } from '@/api/services'
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

export function useCloseRental() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & CloseRentalPayload) => {
      try {
        return await rentalService.closeRental(id, data)
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
      toast.error(getErrorMessage(error, 'Failed to close rental'))
    }
  })
}
