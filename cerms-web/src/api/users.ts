import { api } from '@/lib/axios'
import type { PaginatedList } from './services'

type ApiResponse<T> = {
  success: boolean
  data: T
  errors?: string[]
}

export type UserDto = {
  id: string
  username: string
  email: string
  staffId: string
  staffName: string
  roleId: string
  role: string
  isActive: boolean
  lastLoginAt?: string | null
  companyId: string
  branchId: string
}

export type RoleDto = {
  id: string
  name: string
  description?: string | null
  isSystemRole: boolean
  isActive?: boolean
}

export type CreateUserPayload = {
  staffId: string
  username: string
  email: string
  password: string
  roleId: string
}

export type UpdateUserPayload = {
  id: string
  username: string
  email: string
  roleId: string
  isActive: boolean
}

export type GetUsersParams = {
  pageNumber?: number
  pageSize?: number
  roleName?: string
  searchTerm?: string
}

export const getUsers = async (params?: GetUsersParams) => {
  const { data } = await api.get<ApiResponse<PaginatedList<UserDto>>>('/users', { params })
  return data.data
}

export const getUserById = async (id: string) => {
  const { data } = await api.get<ApiResponse<UserDto>>(`/users/${id}`)
  return data.data
}

export const createUser = async (payload: CreateUserPayload) => {
  const { data } = await api.post<ApiResponse<string>>('/users', payload)
  return data.data
}

export const updateUser = async (id: string, payload: UpdateUserPayload) => {
  const { data } = await api.put<ApiResponse<UserDto>>(`/users/${id}`, payload)
  return data.data
}

export const resetUserPassword = async (id: string, newPassword: string) => {
  const { data } = await api.post<ApiResponse<unknown>>(`/users/${id}/reset-password`, {
    newPassword,
  })
  return data.data
}

export const getRoles = async () => {
  const { data } = await api.get<ApiResponse<RoleDto[]>>('/roles')
  return data.data
}
