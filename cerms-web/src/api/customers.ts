import { api } from '@/lib/axios'
import type { PaginatedList } from './services'

type ApiResponse<T> = {
  success: boolean
  data: T
  errors?: string[]
}

export type CustomerDto = {
  id: string
  customerCode: string
  name: string
  phone: string
  email?: string | null
  address?: string | null
  companyName?: string | null
  isActive: boolean
  company?: string | null
  status?: 'active' | 'inactive'
  joinedOn?: string | null
}

export type CustomerRentalSummaryDto = {
  rentalId: string
  assetName: string
  startDateTime: string
  status: number
  totalAmount?: number | null
}

export type CustomerDetailDto = CustomerDto & {
  totalRentalsCount: number
  totalRevenue: number
  rentalHistory: CustomerRentalSummaryDto[]
}

export type GetCustomersParams = {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  isActive?: boolean
}

export type CreateCustomerRequest = {
  name: string
  phone: string
  email?: string | null
  address?: string | null
  companyName?: string | null
}

export type UpdateCustomerRequest = {
  id: string
  name: string
  phone: string
  email?: string | null
  address?: string | null
  companyName?: string | null
  isActive: boolean
}

export const getCustomers = async (params?: GetCustomersParams) => {
  const { data } = await api.get<ApiResponse<PaginatedList<CustomerDto>>>('/customers', { params })
  return {
    ...data.data,
    items: data.data.items.map(normalizeCustomer)
  }
}

export const getCustomerById = async (id: string) => {
  const { data } = await api.get<ApiResponse<CustomerDetailDto>>(`/customers/${id}`)
  return normalizeCustomer(data.data)
}

export const createCustomer = async (customerData: CreateCustomerRequest) => {
  const { data } = await api.post<ApiResponse<CustomerDto>>('/customers', customerData)
  return normalizeCustomer(data.data)
}

export const updateCustomer = async (id: string, customerData: UpdateCustomerRequest) => {
  const { data } = await api.put<ApiResponse<CustomerDto>>(`/customers/${id}`, customerData)
  return normalizeCustomer(data.data)
}

export const deactivateCustomer = async (id: string) => {
  const { data } = await api.post<ApiResponse<unknown>>(`/customers/${id}/deactivate`)
  return data.data
}

function normalizeCustomer<T extends CustomerDto>(customer: T): T {
  return {
    ...customer,
    company: customer.companyName,
    status: customer.isActive ? 'active' : 'inactive'
  }
}
