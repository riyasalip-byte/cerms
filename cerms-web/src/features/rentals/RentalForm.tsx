import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { mockRentalAssets, mockRentalCustomers, mockRentals, type RentalStatus } from './mockRentals'

type RentalFormValues = {
  assetId: string
  customerId: string
  startDate: string
  endDate: string
  totalAmount: string
  status: RentalStatus
}

export function RentalForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editRentalId = searchParams.get('rentalId')

  const existingRental = useMemo(
    () => mockRentals.find((rental) => rental.id === editRentalId),
    [editRentalId],
  )

  const [formValues, setFormValues] = useState<RentalFormValues>({
    assetId: existingRental?.assetId ?? mockRentalAssets[0]?.id ?? '',
    customerId: existingRental?.customerId ?? mockRentalCustomers[0]?.id ?? '',
    startDate: existingRental?.startDate ?? '',
    endDate: existingRental?.endDate ?? '',
    totalAmount: existingRental ? String(existingRental.totalAmount) : '',
    status: existingRental?.status ?? 'pending',
  })

  const isEditMode = Boolean(existingRental)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/rentals', { replace: true })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditMode ? 'Edit Rental' : 'Create Rental'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Dummy form only. Submitted data is not persisted.
          </p>
        </div>
        <Link
          to="/rentals"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        >
          Back to rentals
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Asset</span>
            <select
              value={formValues.assetId}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, assetId: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            >
              {mockRentalAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.id})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Customer</span>
            <select
              value={formValues.customerId}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  customerId: event.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            >
              {mockRentalCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.id})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Start Date</span>
            <input
              type="date"
              value={formValues.startDate}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, startDate: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">End Date</span>
            <input
              type="date"
              value={formValues.endDate}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, endDate: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Total Amount</span>
            <input
              type="number"
              min="0"
              step="1"
              value={formValues.totalAmount}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  totalAmount: event.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
              placeholder="500"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              value={formValues.status}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  status: event.target.value as RentalStatus,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {isEditMode ? 'Save Changes' : 'Create Rental'}
          </button>
          <Link
            to="/rentals"
            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}

