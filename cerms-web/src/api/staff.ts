import { api } from '@/lib/axios'
import type { PaginatedList } from './services'

type ApiResponse<T> = {
  success: boolean
  data: T
  errors?: string[]
}

export type EmployeeCategory =
  | 'Operator'
  | 'OfficeStaff'
  | 'Manager'
  | 'Mechanic'
  | 'Helper'
  | 'Other'

export type EmploymentStatus = 'Active' | 'Inactive' | 'Suspended' | 'Resigned'

export const employeeCategoryValues = [
  'Operator',
  'OfficeStaff',
  'Manager',
  'Mechanic',
  'Helper',
  'Other',
] as const

export const employmentStatusValues = [
  'Active',
  'Inactive',
  'Suspended',
  'Resigned',
] as const

export type StaffDto = {
  id: string
  staffCode: string
  firstName: string
  lastName: string
  displayName: string
  employeeCategory: number
  mobileNo: string
  designation: string
  employmentStatus: number
  hasUserAccount: boolean
}

export type AssetClassDto = {
  id: string
  name: string
  description?: string | null
  isActive: boolean
}

export type StaffDetailDto = StaffDto & {
  gender: string
  dateOfBirth: string
  photoUrl?: string | null
  alternateMobileNo?: string | null
  email: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  pincode: string
  emergencyContactName: string
  emergencyContactNumber: string
  joiningDate: string
  relievingDate?: string | null
  department: string
  licenseNumber?: string | null
  licenseCategory?: string | null
  licenseExpiryDate?: string | null
  experienceYears?: number | null
  operatorGrade?: string | null
  dailyWage?: number | null
  salary?: number | null
  aadhaarNo?: string | null
  panNo?: string | null
  licenseDocumentUrl?: string | null
  idProofUrl?: string | null
  remarks?: string | null
  allowedAssetClasses: AssetClassDto[]
  linkedUserId?: string | null
}

export type StaffFormPayload = {
  firstName: string
  lastName: string
  displayName: string
  gender: string
  dateOfBirth: string
  mobileNo: string
  alternateMobileNo?: string | null
  email: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  pincode: string
  emergencyContactName: string
  emergencyContactNumber: string
  employeeCategory: number
  joiningDate: string
  relievingDate?: string | null
  employmentStatus: number
  designation: string
  department: string
  photoUrl?: string | null
  licenseNumber?: string | null
  licenseCategory?: string | null
  licenseExpiryDate?: string | null
  experienceYears?: number | null
  operatorGrade?: string | null
  dailyWage?: number | null
  salary?: number | null
  aadhaarNo?: string | null
  panNo?: string | null
  licenseDocumentUrl?: string | null
  idProofUrl?: string | null
  remarks?: string | null
  allowedAssetClassIds?: string[]
}

export type GetStaffParams = {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  employeeCategory?: number
  employmentStatus?: number
}

export type StaffLookupDto = {
  id: string
  staffCode: string
  displayName: string
  employeeCategory: number
}

export const getStaffs = async (params?: GetStaffParams) => {
  const { data } = await api.get<ApiResponse<PaginatedList<StaffDto>>>('/staffs', { params })
  return data.data
}

export const getStaffById = async (id: string) => {
  const { data } = await api.get<ApiResponse<StaffDetailDto>>(`/staffs/${id}`)
  return data.data
}

export const createStaff = async (payload: StaffFormPayload) => {
  const { data } = await api.post<ApiResponse<StaffDetailDto>>('/staffs', payload)
  return data.data
}

export const updateStaff = async (id: string, payload: StaffFormPayload & { id: string }) => {
  const { data } = await api.put<ApiResponse<StaffDetailDto>>(`/staffs/${id}`, payload)
  return data.data
}

export const deactivateStaff = async (id: string) => {
  const { data } = await api.post<ApiResponse<unknown>>(`/staffs/${id}/deactivate`)
  return data.data
}

export const getAssetClasses = async () => {
  const { data } = await api.get<ApiResponse<AssetClassDto[]>>('/staffs/asset-classes')
  return data.data
}

export const getStaffWithoutUser = async () => {
  const { data } = await api.get<ApiResponse<StaffLookupDto[]>>('/staffs/without-user')
  return data.data
}
