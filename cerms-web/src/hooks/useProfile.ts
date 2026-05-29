import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as profileApi from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'

export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: profileApi.getMyProfile,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  const login = useAuthStore((s) => s.login)
  const accessToken = useAuthStore((s) => s.accessToken)

  return useMutation({
    mutationFn: profileApi.updateMyProfile,
    onSuccess: (profile) => {
      qc.invalidateQueries({ queryKey: ['profile', 'me'] })
      if (accessToken) {
        login(
          {
            id: profile.userId,
            username: profile.username,
            email: profile.email,
            role: profile.role,
            companyId: useAuthStore.getState().user?.companyId ?? '',
            branchId: useAuthStore.getState().user?.branchId ?? '',
          },
          accessToken,
        )
      }
      toast.success('Profile updated')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to update profile')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => toast.success('Password changed successfully'),
    onError: (e: any) => {
      toast.error(e.response?.data?.errors?.[0] ?? 'Failed to change password')
    },
  })
}
