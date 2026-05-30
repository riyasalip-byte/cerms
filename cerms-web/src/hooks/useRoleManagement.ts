import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as rolesApi from '@/api/roles'

export function useRolesList(onlyActive?: boolean) {
  return useQuery({
    queryKey: ['roles-list', onlyActive],
    queryFn: () => rolesApi.getRoles(onlyActive),
  })
}

export function useRoleDetails(id: string) {
  return useQuery({
    queryKey: ['roles-details', id],
    queryFn: () => rolesApi.getRoleById(id),
    enabled: !!id,
  })
}

export function usePermissionsList() {
  return useQuery({
    queryKey: ['permissions-list'],
    queryFn: rolesApi.getPermissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rolesApi.createRole,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles-list'] })
      qc.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role created successfully')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to create role')
    },
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rolesApi.updateRole,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['roles-list'] })
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['roles-details', variables.id] })
      toast.success('Role updated successfully')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to update role')
    },
  })
}

export function useAssignPermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rolesApi.assignPermissions,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['roles-details', variables.roleId] })
      qc.invalidateQueries({ queryKey: ['profile', 'me'] }) // Refresh current user permissions in case they edited their own role
      toast.success('Permissions assigned successfully')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to assign permissions')
    },
  })
}
