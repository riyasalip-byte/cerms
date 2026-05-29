import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as operatorsApi from '@/api/operators'
import type { StartRentalPayload, CompleteRentalPayload } from '@/api/operators'
import { toast } from 'sonner'

type ApiError = {
  response?: {
    data?: {
      error?: string
    }
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return (error as ApiError).response?.data?.error || fallback
}

export function useOperators() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: operatorsApi.getOperators
  })
}

export function useAssignOperator() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rentalId, operatorId }: { rentalId: string; operatorId: string }) =>
      operatorsApi.assignOperator(rentalId, operatorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      toast.success('Operator assigned successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to assign operator'))
    }
  })
}

export function useMyAssignments() {
  return useQuery({
    queryKey: ['assignments', 'my-assignments'],
    queryFn: operatorsApi.getMyAssignments
  })
}

export function useAcceptAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: operatorsApi.acceptAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', 'my-assignments'] })
      toast.success('Assignment accepted successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to accept assignment'))
    }
  })
}

export function useStartAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StartRentalPayload }) =>
      operatorsApi.startAssignment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', 'my-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      toast.success('Rental started successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to start rental'))
    }
  })
}

export function useCompleteAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CompleteRentalPayload }) =>
      operatorsApi.completeAssignment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', 'my-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['rentals'] })
      toast.success('Rental completed successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to complete rental'))
    }
  })
}

export function useGenerateAssignmentInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: operatorsApi.generateAssignmentInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', 'my-assignments'] })
      toast.success('Operator invoice generated successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to generate invoice'))
    }
  })
}
