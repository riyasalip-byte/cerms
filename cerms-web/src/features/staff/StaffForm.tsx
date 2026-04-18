import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { mockStaff, type StaffStatus } from './mockStaff'

type StaffFormValues = {
  name: string
  email: string
  phone: string
  role: string
  status: StaffStatus
  licenseType: string
  licenseNumber: string
  licenseExpiry: string
}

export function StaffForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editStaffId = searchParams.get('staffId')

  const existingStaff = useMemo(
    () => mockStaff.find((staff) => staff.id === editStaffId),
    [editStaffId],
  )

  const [formValues, setFormValues] = useState<StaffFormValues>({
    name: existingStaff?.name ?? '',
    email: existingStaff?.email ?? '',
    phone: existingStaff?.phone ?? '',
    role: existingStaff?.role ?? '',
    status: existingStaff?.status ?? 'active',
    licenseType: existingStaff?.licenseType ?? '',
    licenseNumber: existingStaff?.licenseNumber ?? '',
    licenseExpiry: existingStaff?.licenseExpiry ?? '',
  })

  const isEditMode = Boolean(existingStaff)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/staff', { replace: true })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditMode ? 'Edit Staff' : 'Create Staff'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Dummy form only. Submitted data is not persisted.
          </p>
        </div>
        <Link
          to="/staff"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        >
          Back to staff
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Name</span>
            <input
              required
              value={formValues.name}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="Alex Morgan"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input
              required
              type="email"
              value={formValues.email}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, email: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="alex@cerms.com"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Phone</span>
            <input
              required
              value={formValues.phone}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, phone: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="+1 (555) 123-4567"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Role</span>
            <input
              required
              value={formValues.role}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, role: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="Field Technician"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              value={formValues.status}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  status: event.target.value as StaffStatus,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">License Type</span>
            <input
              required
              value={formValues.licenseType}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  licenseType: event.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="Heavy Equipment Operator"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">License Number</span>
            <input
              required
              value={formValues.licenseNumber}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  licenseNumber: event.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="LIC-ABC-1234"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">License Expiry</span>
            <input
              required
              type="date"
              value={formValues.licenseExpiry}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  licenseExpiry: event.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {isEditMode ? 'Save Changes' : 'Create Staff'}
          </button>
          <Link
            to="/staff"
            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}

