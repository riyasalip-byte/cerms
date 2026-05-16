import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as assetsApi from '@/api/assets'
import type { AddMaintenancePayload, AssetQueryParams, UpdateAssetPayload } from '@/api/assets'
import { toast } from 'sonner'

type ApiError = {
  response?: {
    data?: {
      errors?: string[]
    }
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return (error as ApiError).response?.data?.errors?.[0] || fallback
}

export function useAssets(params?: AssetQueryParams) {
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

export function useAssetCategories() {
  return useQuery({
    queryKey: ['asset-categories'],
    queryFn: assetsApi.getAssetCategories
  })
}

export function useMaintenanceTypes() {
  return useQuery({
    queryKey: ['maintenance-types'],
    queryFn: assetsApi.getMaintenanceTypes
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create asset'))
    }
  })
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetPayload }) => assetsApi.updateAsset(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] })
      toast.success('Asset updated successfully')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update asset'))
    }
  })
}

export function useAddMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddMaintenancePayload }) => assetsApi.addMaintenance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] })
      toast.success('Maintenance record added successfully')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to add maintenance record'))
    }
  })
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; maintenanceId: string; sparePartsCost: number; labourCost: number; notes?: string; serviceDate?: string; nextServiceDueDate?: string; nextServiceOdometer?: number }) => 
      assetsApi.completeMaintenance(payload.id, payload.maintenanceId, payload.sparePartsCost, payload.labourCost, payload.notes, payload.serviceDate, payload.nextServiceDueDate, payload.nextServiceOdometer),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] })
      toast.success('Maintenance completed successfully')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to complete maintenance'))
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete asset'))
    }
  })
}
