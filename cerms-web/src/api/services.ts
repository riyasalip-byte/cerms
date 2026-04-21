import { api } from '@/lib/axios'
import type { User } from '@/stores/authStore'

export type AuthResponse = {
  accessToken: string
  user: User
}

export type PaginatedList<T> = {
  items: T[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// Asset types
export type Asset = {
  id: string
  assetCode: string
  name: string
  assetType: string
  category?: string
  serialNumber?: string
  location?: string
  dailyRate?: number
  status: number
  currentOdometer: number
}

// Rental types
export type Rental = {
  id: string
  assetId: string
  assetName: string
  customerId: string
  customerName: string
  startDate: string
  expectedEndDate: string
  endDate?: string
  actualEndDate?: string
  status: number
  rentalRate: number
  rateType: number
  totalAmount?: number
  currentOdometer?: number
}

// Invoice types
export type Invoice = {
  id: string
  bookingId: string
  invoiceNumber: string
  subtotal: number
  tax: number
  total: number
  amountPaid: number
  balanceDue: number
  status: number
  issuedDate: string
  lineItems: InvoiceLineItem[]
}

export type InvoiceLineItem = {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export type ChartDataDto = {
  label: string
  value: number
}

// Customer types
export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  joinedOn?: string
  status?: string
}

export const customerService = {
  getAll: (params?: any) => api.get<PaginatedList<Customer>>('/customers', { params }).then(r => r.data),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`).then(r => r.data)
}

export const assetService = {
  getAll: (params: any) => api.get<PaginatedList<Asset>>('/assets', { params }).then(r => r.data),
  getById: (id: string) => api.get<Asset>(`/assets/${id}`).then(r => r.data),
  create: (data: any) => api.post<string>('/assets', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/assets/${id}`, data),
  delete: (id: string) => api.delete(`/assets/${id}`)
}

export const rentalService = {
  getAll: (params: any) => api.get<PaginatedList<Rental>>('/rentals', { params }).then(r => r.data),
  getById: (id: string) => api.get<Rental>(`/rentals/${id}`).then(r => r.data),
  create: (data: any) => api.post<string>('/rentals', data).then(r => r.data),
  updateStatus: (id: string, status: number) => api.put(`/rentals/${id}/status`, status),
  close: (id: string, data: { actualEndDate: string; currentOdometer: number }) => api.post<{ invoiceId: string }>(`/rentals/${id}/close`, data).then(r => r.data),
  extend: (id: string, newExpectedEndDate: string) => api.post(`/rentals/${id}/extend`, newExpectedEndDate)
}

export const invoiceService = {
  getAll: (params: any) => api.get<PaginatedList<Invoice>>('/invoices', { params }).then(r => r.data),
  getById: (id: string) => api.get<Invoice>(`/invoices/${id}`).then(r => r.data),
  getPdf: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }).then(r => r.data),
  recordPayment: (id: string, amount: number) => api.post(`/invoices/${id}/payments`, amount)
}

export const reportService = {
  getRevenue: (params: { startDate?: string; endDate?: string }) => api.get<any>('/reports/revenue', { params }).then(r => r.data),
  getUtilisation: () => api.get<ChartDataDto[]>('/reports/utilisation').then(r => r.data),
  getMaintenanceCost: () => api.get<ChartDataDto[]>('/reports/maintenance-cost').then(r => r.data),
  getPayroll: () => api.get<ChartDataDto[]>('/reports/payroll').then(r => r.data)
}

export const authService = {
  login: (credentials: any) => api.post<AuthResponse>('/auth/login', credentials).then(r => r.data),
  refresh: () => api.post<AuthResponse>('/auth/refresh').then(r => r.data),
  logout: () => api.post('/auth/logout')
}

// Compatibility exports
export const getAssetById = assetService.getById;
export const getCustomerById = customerService.getById;
export const getCustomers = customerService.getAll;
export const getRentalById = rentalService.getById;
export const login = authService.login;
export const refresh = authService.refresh;
