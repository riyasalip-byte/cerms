import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as assetsApi from '@/api/assets'
import { toast } from 'sonner'

export function useAssets(params?: any) {
  return useQuery({
    queryKey: ['assets', params],
    queryFn: () => assetsApi.getAssets(params)
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetsApi.getAssetById(id),
    enabled: !!id
  })
}

export function useExpiringAssets(days = 30) {
  return useQuery({
    queryKey: ['assets', 'expiring', days],
    queryFn: () => assetsApi.getExpiringAssets(days)
  })
}

export function useCreateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assetsApi.createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Asset created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to create asset')
    }
  })
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assetsApi.updateAsset(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] })
      toast.success('Asset updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to update asset')
    }
  })
}

export function useAddMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assetsApi.addMaintenance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] })
      toast.success('Maintenance record added successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to add maintenance record')
    }
  })
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; maintenanceId: string; finalCost: number; notes?: string; serviceDate?: string; nextServiceDueDate?: string; nextServiceOdometer?: number }) => 
      assetsApi.completeMaintenance(payload.id, payload.maintenanceId, payload.finalCost, payload.notes, payload.serviceDate, payload.nextServiceDueDate, payload.nextServiceOdometer),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] })
      toast.success('Maintenance completed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to complete maintenance')
    }
  })
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => assetsApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Asset deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to delete asset')
    }
  })
}
