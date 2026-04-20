import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetService } from '@/api/services'
import { toast } from 'sonner'

export function useAssets(params?: any) {
  return useQuery({
    queryKey: ['assets', params],
    queryFn: () => assetService.getAll(params)
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetService.getById(id),
    enabled: !!id
  })
}

export function useCreateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assetService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Asset created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to create asset')
    }
  })
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assetService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] })
      toast.success('Asset updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to update asset')
    }
  })
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assetService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Asset deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to delete asset')
    }
  })
}
