import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { mockCustomers } from './mockCustomers'

type CustomerFormValues = {
  name: string
  email: string
  phone: string
  company: string
  status: 'active' | 'inactive'
}

export function CustomerForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editCustomerId = searchParams.get('customerId')

  const existingCustomer = useMemo(
    () => mockCustomers.find((customer) => customer.id === editCustomerId),
    [editCustomerId],
  )

  const [formValues, setFormValues] = useState<CustomerFormValues>({
    name: existingCustomer?.name ?? '',
    email: existingCustomer?.email ?? '',
    phone: existingCustomer?.phone ?? '',
    company: existingCustomer?.company ?? '',
    status: existingCustomer?.status ?? 'active',
  })

  const isEditMode = Boolean(existingCustomer)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/customers', { replace: true })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditMode ? 'Edit Customer' : 'Create Customer'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Dummy form only. Submitted data is not persisted.
          </p>
        </div>
        <Link
          to="/customers"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        >
          Back to customers
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
              placeholder="John Smith"
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
              placeholder="john@company.com"
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
            <span className="text-sm font-medium">Company</span>
            <input
              required
              value={formValues.company}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, company: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="Acme Inc."
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              value={formValues.status}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  status: event.target.value as 'active' | 'inactive',
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {isEditMode ? 'Save Changes' : 'Create Customer'}
          </button>
          <Link
            to="/customers"
            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}

