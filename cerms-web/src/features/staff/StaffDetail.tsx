import { Link, useParams } from 'react-router-dom'
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

export function StaffDetail() {
  const { id } = useParams()
  const staff = mockStaff.find((item) => item.id === id)

  if (!staff) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h1 className="text-xl font-semibold">Staff not found</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No staff record matches ID: {id}
        </p>
        <Link
          to="/staff"
          className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Back to staff
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{staff.name}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Staff profile and assignment details
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/staff/new?staffId=${staff.id}`}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Edit Staff
          </Link>
          <Link
            to="/staff"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            Back to list
          </Link>
        </div>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Staff ID</p>
            <p className="mt-1 font-medium">{staff.id}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Role</p>
            <p className="mt-1 font-medium">{staff.role}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
            <p className="mt-1 font-medium">{staff.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
            <p className="mt-1 font-medium">{staff.phone}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
            <span
              className={[
                'mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                statusClassMap[staff.status],
              ].join(' ')}
            >
              {formatStatus(staff.status)}
            </span>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="text-lg font-semibold tracking-tight">License Info</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Type</p>
            <p className="mt-1 font-medium">{staff.licenseType}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Number</p>
            <p className="mt-1 font-medium">{staff.licenseNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Expiry</p>
            <p className="mt-1 font-medium">{staff.licenseExpiry}</p>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="text-lg font-semibold tracking-tight">Assignments</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Assignment timeline placeholder. Integrate with real dispatch records in a
          future iteration.
        </p>
      </article>
    </section>
  )
}

