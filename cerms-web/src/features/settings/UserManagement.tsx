import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type UserRole = 'admin' | 'manager' | 'viewer'
type UserStatus = 'active' | 'invited' | 'disabled'

type UserRecord = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

const dummyUsers: UserRecord[] = [
  {
    id: 'USR-001',
    name: 'Jane Doe',
    email: 'jane.doe@cerms.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'USR-002',
    name: 'David Smith',
    email: 'david.smith@cerms.com',
    role: 'manager',
    status: 'active',
  },
  {
    id: 'USR-003',
    name: 'Olivia Lee',
    email: 'olivia.lee@cerms.com',
    role: 'viewer',
    status: 'invited',
  },
]

const statusClassMap: Record<UserStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  invited: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  disabled: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export function UserManagement() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer')
  const [invited, setInvited] = useState(false)

  const users = useMemo(() => dummyUsers, [])

  const handleInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setInvited(true)
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Manage access roles and invite new users.
        </p>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="text-lg font-semibold tracking-tight">Invite User</h2>
        <form onSubmit={handleInvite} className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="new.user@cerms.com"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Role</span>
            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as UserRole)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>

          <div className="sm:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Send Invite
            </button>
            {invited && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                Invite sent (dummy).
              </span>
            )}
          </div>
        </form>
      </article>

      <article className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize',
                      statusClassMap[user.status],
                    ].join(' ')}
                  >
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}

