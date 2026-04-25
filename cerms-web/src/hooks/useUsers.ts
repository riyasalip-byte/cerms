import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/api/services'
import { toast } from 'sonner'

export function useUsers(params?: any) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAll(params),
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => userService.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User invited successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data || error.message || 'Failed to invite user'
      toast.error(message)
    }
  })
}
