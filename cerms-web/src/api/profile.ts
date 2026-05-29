import { api } from '@/lib/axios'

type ApiResponse<T> = {
  success: boolean
  data: T
  errors?: string[]
}

export type ProfileDto = {
  userId: string
  username: string
  email: string
  role: string
  staffId: string
  staffCode: string
  displayName: string
  firstName: string
  lastName: string
  mobileNo: string
  photoUrl?: string | null
  employeeCategory: number
  designation: string
  department: string
}

export type UpdateProfilePayload = {
  username: string
  email: string
  displayName: string
  mobileNo: string
  photoUrl?: string | null
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export const getMyProfile = async () => {
  const { data } = await api.get<ApiResponse<ProfileDto>>('/me')
  return data.data
}

export const updateMyProfile = async (payload: UpdateProfilePayload) => {
  const { data } = await api.put<ApiResponse<ProfileDto>>('/me', payload)
  return data.data
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const { data } = await api.post<ApiResponse<unknown>>('/me/change-password', payload)
  return data.data
}
