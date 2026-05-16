import { api } from '@/lib/axios'
import type { PaginatedList } from './services'

export type AssetDto = {
  id: string
  assetCode: string
  assetName: string
  assetCategory: number
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
  serviceIntervalKm: number
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
  status?: number
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

// Backend ApiResponse wrapper
type ApiResponse<T> = {
  success: boolean
  data: T
  errors?: string[]
}

export const getAssets = async (params?: any) => {
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

export const createAsset = async (assetData: any) => {
  const { data } = await api.post<ApiResponse<AssetDto>>('/assets', assetData)
  return data.data
}

export const updateAsset = async (id: string, assetData: any) => {
  const { data } = await api.put<ApiResponse<AssetDto>>(`/assets/${id}`, assetData)
  return data.data
}

export const addMaintenance = async (id: string, maintenanceData: any) => {
  const { data } = await api.post<ApiResponse<string>>(`/assets/${id}/maintenance`, maintenanceData)
  return data.data
}

export const completeMaintenance = async (id: string, maintenanceId: string, finalCost: number, notes?: string, serviceDate?: string) => {
  const { data } = await api.post<ApiResponse<any>>(`/assets/${id}/maintenance/complete`, { maintenanceId, finalCost, notes, serviceDate })
  return data.data
}

export const deleteAsset = async (id: string) => {
  const { data } = await api.delete<ApiResponse<any>>(`/assets/${id}`)
  return data.data
}
