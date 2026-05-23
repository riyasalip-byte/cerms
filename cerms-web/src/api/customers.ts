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
  customerType: number // 0 = Individual, 1 = Company
  customerName: string
  mobileNo: string
  alternateMobileNo?: string | null
  email?: string | null
  whatsAppNo?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  contactPersonName?: string | null
  contactPersonMobileNo?: string | null
  contactPersonAddress?: string | null
  gstOrTaxNumber?: string | null
  creditLimit: number
  outstandingBalance: number
  notes?: string | null
  isActive: boolean
  company?: string | null // compatibility field
  status?: 'active' | 'inactive'
}

export type CustomerRentalSummaryDto = {
  rentalId: string
  invoiceId?: string | null
  rentalNo: string
  assetName: string
  startDateTime: string
  endDateTime: string
  status: number
  totalBillAmount: number
  paidAmount: number
  balanceAmount: number
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
  customerType?: number
}

export type CreateCustomerRequest = {
  customerType: number
  customerName: string
  mobileNo: string
  address?: string | null
  alternateMobileNo?: string | null
  email?: string | null
  whatsAppNo?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  contactPersonName?: string | null
  contactPersonMobileNo?: string | null
  contactPersonAddress?: string | null
  gstOrTaxNumber?: string | null
  creditLimit: number
  notes?: string | null
}

export type UpdateCustomerRequest = {
  id: string
  customerType: number
  customerName: string
  mobileNo: string
  address?: string | null
  alternateMobileNo?: string | null
  email?: string | null
  whatsAppNo?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  contactPersonName?: string | null
  contactPersonMobileNo?: string | null
  contactPersonAddress?: string | null
  gstOrTaxNumber?: string | null
  creditLimit: number
  notes?: string | null
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
    company: customer.customerType === 1 ? customer.customerName : null,
    status: customer.isActive ? 'active' : 'inactive'
  }
}
