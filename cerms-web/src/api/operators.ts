import { api } from '@/lib/axios'

export type Operator = {
  id: string
  operatorCode: string
  fullName: string
  mobileNo: string
  licenseNumber: string
  dailyWage: number
  isActive: boolean
}

export type OperatorAssignment = {
  id: string
  rentalId: string
  customerName: string
  assetName: string
  assetCode: string
  siteName: string
  siteAddress: string
  startDateTime: string
  expectedEndDateTime: string
  actualEndDateTime?: string
  rateType?: number
  rateAmount?: number
  assignmentStatus: number // 0 = Assigned, 1 = Accepted, 2 = Started, 3 = Completed, 4 = Closed
  assignedAt: string
  actualStartDateTime?: string
  startMeterReading?: number
  endMeterReading?: number
  startRemarks?: string
  completionRemarks?: string
  isInvoiceGenerated: boolean
  invoiceGeneratedAt?: string
  pickupTransportCharge?: number
  returnTransportCharge?: number
  invoiceId?: string
}

export type StartRentalPayload = {
  startMeterReading: number
  remarks?: string
  actualStartDateTime?: string
}

export type CompleteRentalPayload = {
  endMeterReading: number
  remarks?: string
  actualEndDateTime?: string
}

export const getOperators = async (): Promise<Operator[]> => {
  const response = await api.get<Operator[]>('/assignments/operators')
  return response.data
}

export const assignOperator = async (rentalId: string, operatorId: string): Promise<{ id: string }> => {
  const response = await api.post<{ id: string }>(`/rentals/${rentalId}/assign-operator`, { operatorId })
  return response.data
}

export const getMyAssignments = async (): Promise<OperatorAssignment[]> => {
  const response = await api.get<OperatorAssignment[]>('/assignments/my-assignments')
  return response.data
}

export const acceptAssignment = async (id: string): Promise<{ id: string }> => {
  const response = await api.post<{ id: string }>(`/assignments/${id}/accept`)
  return response.data
}

export const startAssignment = async (id: string, payload: StartRentalPayload): Promise<{ id: string }> => {
  const response = await api.post<{ id: string }>(`/assignments/${id}/start`, payload)
  return response.data
}

export const completeAssignment = async (id: string, payload: CompleteRentalPayload): Promise<{ id: string }> => {
  const response = await api.post<{ id: string }>(`/assignments/${id}/complete`, payload)
  return response.data
}

export const generateAssignmentInvoice = async (id: string): Promise<{ id: string }> => {
  const response = await api.post<{ id: string }>(`/assignments/${id}/generate-invoice`)
  return response.data
}
