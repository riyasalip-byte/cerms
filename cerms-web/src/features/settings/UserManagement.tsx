import { useState, useMemo } from 'react'
import type { FormEvent } from 'react'
import { useUsers, useInviteUser } from '@/hooks/useUsers'
import { Loader2, UserPlus, Mail, Shield, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Map backend role numbers to human-readable labels
const ROLE_MAP: Record<number, string> = {
  0: 'Admin',
  1: 'Manager',
  2: 'Operator',
  3: 'Accountant',
}

const ROLE_VARIANTS: Record<number, any> = {
  0: 'destructive',
  1: 'warning',
  2: 'info',
  3: 'success',
}

export function UserManagement() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteUsername, setInviteUsername] = useState('')
  const [inviteRole, setInviteRole] = useState(2) // Default to Operator

  const { data, isLoading, isError, error } = useUsers()
  const inviteMutation = useInviteUser()

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await inviteMutation.mutateAsync({
      email: inviteEmail,
      username: inviteUsername,
      role: Number(inviteRole)
    })
    setInviteEmail('')
    setInviteUsername('')
  }

  const users = useMemo(() => {
    if (!data) return [];
    return (data as any).items || (data as any).Items || [];
  }, [data])

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Invite colleagues and manage system access permissions.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invite Form */}
        <article className="lg:col-span-1 h-fit rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Invite New User</h2>
          </div>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <div className="relative">
                <InputWithIcon 
                  icon={<UserPlus className="size-4" />}
                  placeholder="johndoe"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <InputWithIcon 
                  icon={<Mail className="size-4" />}
                  type="email"
                  placeholder="john@cerms.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">System Role</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <Shield className="size-4" />
                </div>
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(Number(event.target.value))}
                  className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={0}>Admin</option>
                  <option value={1}>Manager</option>
                  <option value={2}>Operator</option>
                  <option value={3}>Accountant</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </button>
          </form>
        </article>

        {/* Users Table */}
        <article className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-muted/30">
            <h2 className="text-lg font-semibold">Active Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground transition-colors">
                  <th className="px-4 py-3 font-medium">User Identification</th>
                  <th className="px-4 py-3 font-medium">Permissions</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-8 animate-spin text-primary" />
                        <span className="text-muted-foreground">Loading system users...</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-destructive">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="size-8" />
                        <span>{(error as any)?.response?.data || (error as any)?.message || "Failed to load users. Please check your connection."}</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                      No users found in this tenant.
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{user.username}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={ROLE_VARIANTS[user.role] || 'secondary'}>
                          {ROLE_MAP[user.role] || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-xs font-medium text-primary hover:underline">
                          Edit Permissions
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  )
}

function InputWithIcon({ icon, ...props }: any) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-3 text-muted-foreground">
        {icon}
      </div>
      <input
        {...props}
        className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  )
}
