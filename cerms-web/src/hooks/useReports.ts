import { useQuery } from '@tanstack/react-query'
import { reportService } from '@/api/services'

export function useRevenueReport(params: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: () => reportService.getRevenue(params)
  })
}

export function useUtilisationReport() {
  return useQuery({
    queryKey: ['reports', 'utilisation'],
    queryFn: () => reportService.getUtilisation()
  })
}

export function useMaintenanceCostReport() {
  return useQuery({
    queryKey: ['reports', 'maintenance-cost'],
    queryFn: () => reportService.getMaintenanceCost()
  })
}

export function usePayrollReport() {
  return useQuery({
    queryKey: ['reports', 'payroll'],
    queryFn: () => reportService.getPayroll()
  })
}
