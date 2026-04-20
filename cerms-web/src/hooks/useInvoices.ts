import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceService } from '@/api/services'
import { toast } from 'sonner'

export function useInvoices(params?: any) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceService.getAll(params)
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoiceService.getById(id),
    enabled: !!id
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => invoiceService.recordPayment(id, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] })
      toast.success('Payment recorded successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data || 'Failed to record payment')
    }
  })
}
