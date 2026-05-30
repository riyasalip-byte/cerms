import { api } from '@/lib/axios'

type ApiResponse<T> = {
  success: boolean
  data: T
  errors?: string[]
}

export type PermissionDto = {
  id: string
  module: string
  permissionCode: string
  permissionName: string
  description?: string
  isSystemPermission: boolean
}

export type RoleDto = {
  id: string
  name: string
  description?: string
  isSystemRole: boolean
  isActive: boolean
}

export type RoleDetailDto = RoleDto & {
  permissions: PermissionDto[]
}

export type CreateRolePayload = {
  name: string
  description?: string
  isActive: boolean
}

export type UpdateRolePayload = {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export type AssignPermissionsPayload = {
  roleId: string
  permissionIds: string[]
}

export const getRoles = async (onlyActive?: boolean) => {
  const { data } = await api.get<ApiResponse<RoleDto[]>>('/roles', {
    params: { onlyActive }
  })
  return data.data
}

export const getRoleById = async (id: string) => {
  const { data } = await api.get<ApiResponse<RoleDetailDto>>(`/roles/${id}`)
  return data.data
}

export const createRole = async (payload: CreateRolePayload) => {
  const { data } = await api.post<ApiResponse<string>>('/roles', payload)
  return data.data
}

export const updateRole = async (payload: UpdateRolePayload) => {
  const { data } = await api.put<ApiResponse<string>>(`/roles/${payload.id}`, payload)
  return data.data
}

export const assignPermissions = async ({ roleId, permissionIds }: AssignPermissionsPayload) => {
  const { data } = await api.post<ApiResponse<boolean>>(`/roles/${roleId}/permissions`, {
    permissionIds
  })
  return data.data
}

export const getPermissions = async () => {
  const { data } = await api.get<ApiResponse<PermissionDto[]>>('/permissions')
  return data.data
}
