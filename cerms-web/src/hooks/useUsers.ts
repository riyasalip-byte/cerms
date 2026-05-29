import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as usersApi from '@/api/users'

export function useUsers(params?: usersApi.GetUsersParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getUsers(params),
    placeholderData: (prev) => prev,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  })
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: usersApi.getRoles,
    staleTime: 60_000,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['staff-without-user'] })
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('User account created')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to create user')
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: usersApi.UpdateUserPayload }) =>
      usersApi.updateUser(id, data),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['users', v.id] })
      toast.success('User updated')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to update user')
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersApi.resetUserPassword(id, newPassword),
    onSuccess: () => toast.success('Password reset successfully'),
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to reset password')
    },
  })
}
