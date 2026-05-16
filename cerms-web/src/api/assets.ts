import { api } from '@/lib/axios'
import type { PaginatedList } from './services'

export type AssetDto = {
  id: string
  assetCode: string
  assetName: string
  assetCategoryId: string
  assetCategoryName: string
  purchaseDate?: string
  currentMeterReading: number
  makeYear?: number
  model?: string
  engineNo?: string
  chasisNo?: string
  placeOfRegistration?: string
  registerNo: string
  registerDate?: string
  fitnessExpiryDate: string
  insuranceCompany?: string
  insuranceNo?: string
  insuranceExpiryDate: string
  puccExpiryDate: string
  status: number
  lastServiceOdometer: number
  isActive: boolean
  maintenanceCost: number
  nextServiceDueDate?: string
  nextServiceOdometer?: number
  serviceIntervalKm: number
  isTransportationRequired: boolean
  transportationNotes?: string
}

export type AssetCategoryDto = {
  id: string
  name: string
  isTransportationRequiredByDefault: boolean
}

export type MaintenanceRecordDto = {
  id: string
  assetId: string
  description: string
  cost: number
  finalCost?: number
  serviceDate: string
  odometer: number
  nextServiceDueDate?: string
  nextServiceOdometer?: number
  status?: number | string
  completedAt?: string
}

export type AssetDetailDto = AssetDto & {
  maintenanceRecords: MaintenanceRecordDto[]
}

export type AssetExpiryAlertDto = {
  assetId: string
  assetCode: string
  assetName: string
  registerNo: string
  complianceType: string
  expiryDate: string
  daysUntilExpiry: number
  severity: 'critical' | 'warning' | string
  notificationKey: string
}

export type AssetQueryParams = {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: number
  assetCategoryId?: string
}

export type AssetPayload = {
  assetName: string
  assetCategoryId: string
  currentMeterReading: number
  registerNo: string
  fitnessExpiryDate?: string
  insuranceExpiryDate?: string
  puccExpiryDate?: string
  purchaseDate?: string
  makeYear?: number
  model?: string
  engineNo?: string
  chasisNo?: string
  placeOfRegistration?: string
  registerDate?: string
  insuranceCompany?: string
  insuranceNo?: string
  isTransportationRequired: boolean
  transportationNotes?: string
}

export type UpdateAssetPayload = AssetPayload & {
  id: string
  status: number
}

export type AddMaintenancePayload = {
  assetId: string
  description: string
  cost: number
  serviceDate: string
  odometer: number
  nextServiceDueDate?: string
  nextServiceOdometer?: number
}

// Backend ApiResponse wrapper
type ApiResponse<T> = {
  success: boolean
  data: T
  errors?: string[]
}

type AssetCategoriesResponse = AssetCategoryDto[] | ApiResponse<AssetCategoryDto[]>

export const getAssets = async (params?: AssetQueryParams) => {
  const { data } = await api.get<ApiResponse<PaginatedList<AssetDto>>>('/assets', { params })
  return data.data
}

export const getAssetById = async (id: string) => {
  const { data } = await api.get<ApiResponse<AssetDetailDto>>(`/assets/${id}`)
  return data.data
}

export const getExpiringAssets = async (days = 30) => {
  const { data } = await api.get<ApiResponse<AssetExpiryAlertDto[]>>('/assets/expiring', {
    params: { days },
  })
  return data.data
}

export const getAssetCategories = async () => {
  const { data } = await api.get<AssetCategoriesResponse>('/asset-categories')
  return Array.isArray(data) ? data : data.data
}

export const createAsset = async (assetData: AssetPayload) => {
  const { data } = await api.post<ApiResponse<AssetDto>>('/assets', assetData)
  return data.data
}

export const updateAsset = async (id: string, assetData: UpdateAssetPayload) => {
  const { data } = await api.put<ApiResponse<AssetDto>>(`/assets/${id}`, assetData)
  return data.data
}

export const addMaintenance = async (id: string, maintenanceData: AddMaintenancePayload) => {
  const { data } = await api.post<ApiResponse<string>>(`/assets/${id}/maintenance`, maintenanceData)
  return data.data
}

export const completeMaintenance = async (id: string, maintenanceId: string, finalCost: number, notes?: string, serviceDate?: string, nextServiceDueDate?: string, nextServiceOdometer?: number) => {
  const { data } = await api.post<ApiResponse<MaintenanceRecordDto>>(`/assets/${id}/maintenance/complete`, { maintenanceId, finalCost, notes, serviceDate, nextServiceDueDate, nextServiceOdometer })
  return data.data
}

export const deleteAsset = async (id: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/assets/${id}`)
  return data.data
}
