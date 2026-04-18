import { Link } from 'react-router-dom'
import { mockStaff, type StaffStatus } from './mockStaff'

const statusClassMap: Record<StaffStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  on_leave: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  inactive: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

function formatStatus(status: StaffStatus) {
  if (status === 'on_leave') return 'On Leave'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function StaffList() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Manage staff records and license compliance.
          </p>
        </div>
        <Link
          to="/staff/new"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          New Staff
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Staff</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">License</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockStaff.map((member) => (
              <tr
                key={member.id}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {member.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {member.id} - {member.email}
                  </div>
                </td>
                <td className="px-4 py-3">{member.role}</td>
                <td className="px-4 py-3">
                  <div className="text-sm">{member.licenseType}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {member.licenseNumber}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                      statusClassMap[member.status],
                    ].join(' ')}
                  >
                    {formatStatus(member.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/staff/${member.id}`}
                      className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                    >
                      View
                    </Link>
                    <Link
                      to={`/staff/new?staffId=${member.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

