import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as staffApi from '@/api/staff'

export function useStaffList(params?: staffApi.GetStaffParams) {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: () => staffApi.getStaffs(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useStaff(id: string) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffApi.getStaffById(id),
    enabled: !!id,
  })
}

export function useAssetClasses() {
  return useQuery({
    queryKey: ['asset-classes'],
    queryFn: staffApi.getAssetClasses,
    staleTime: 60_000,
  })
}

export function useStaffWithoutUser() {
  return useQuery({
    queryKey: ['staff-without-user'],
    queryFn: staffApi.getStaffWithoutUser,
  })
}

export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: staffApi.createStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Staff created successfully')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to create staff')
    },
  })
}

export function useUpdateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: staffApi.StaffFormPayload & { id: string } }) =>
      staffApi.updateStaff(id, data),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      qc.invalidateQueries({ queryKey: ['staff', v.id] })
      toast.success('Staff updated successfully')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to update staff')
    },
  })
}

export function useDeactivateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: staffApi.deactivateStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Staff deactivated')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to deactivate staff')
    },
  })
}
