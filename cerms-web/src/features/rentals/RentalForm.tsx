import { useRental, useCreateRental, useUpdateRentalStatus } from '@/hooks/useRentals'
import { useAssets } from '@/hooks/useAssets'
import { useCustomers } from '@/hooks/useCustomers'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

type RentalFormValues = {
  assetId: string
  customerId: string
  startDate: string
  expectedEndDate: string
  rentalRate: number
  rateType: number
  status: number
}

export function RentalForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const { data: rentalData, isLoading: isRentalLoading } = useRental(id!)
  const { data: assetsData } = useAssets({ pageSize: 100 })
  const { data: customersData } = useCustomers({ pageSize: 100 })
  
  const createRental = useCreateRental()
  const updateStatus = useUpdateRentalStatus()

  const [formValues, setFormValues] = useState<RentalFormValues>({
    assetId: '',
    customerId: '',
    startDate: '',
    expectedEndDate: '',
    rentalRate: 0,
    rateType: 0,
    status: 0,
  })

  useEffect(() => {
    if (rentalData) {
      setFormValues({
        assetId: rentalData.assetId,
        customerId: rentalData.customerId,
        startDate: rentalData.startDate.split('T')[0],
        expectedEndDate: rentalData.expectedEndDate.split('T')[0],
        rentalRate: rentalData.rentalRate,
        rateType: rentalData.rateType,
        status: rentalData.status,
      })
    }
  }, [rentalData])

  if (isEditMode && isRentalLoading) {
    return (
      <div className="px-4 py-12 flex justify-center text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
          Loading rental data...
        </div>
      </div>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (isEditMode) {
      await updateStatus.mutateAsync({ id: id!, status: formValues.status })
    } else {
      await createRental.mutateAsync(formValues)
    }
    
    navigate('/rentals')
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditMode ? 'Manage Rental' : 'Create Rental'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {isEditMode ? 'Update rental status or record extensions.' : 'Setup a new rental agreement.'}
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
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Asset</span>
            <select
              disabled={isEditMode}
              value={formValues.assetId}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, assetId: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800/50"
              required
            >
               <option value="">Select an asset</option>
               {assetsData?.items.map((asset) => (
                 <option key={asset.id} value={asset.id}>
                   {asset.name} ({asset.assetCode})
                 </option>
               ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Customer</span>
            <select
              disabled={isEditMode}
              value={formValues.customerId}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  customerId: event.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800/50"
              required
            >
               <option value="">Select a customer</option>
               {customersData?.items.map((customer) => (
                 <option key={customer.id} value={customer.id}>
                   {customer.name}
                 </option>
               ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</span>
            <input
              disabled={isEditMode}
              type="date"
              value={formValues.startDate}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, startDate: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800/50"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Expected End Date</span>
            <input
              disabled={isEditMode}
              type="date"
              value={formValues.expectedEndDate}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, expectedEndDate: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800/50"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rental Rate</span>
            <input
              disabled={isEditMode}
              type="number"
              min="0"
              value={formValues.rentalRate}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  rentalRate: Number(event.target.value),
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800/50"
              required
              placeholder="500"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate Type</span>
            <select
              disabled={isEditMode}
              value={formValues.rateType}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  rateType: Number(event.target.value),
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800/50"
            >
              <option value={0}>Hourly</option>
              <option value={1}>Daily</option>
              <option value={2}>Weekly</option>
              <option value={3}>Monthly</option>
            </select>
          </label>

          {isEditMode && (
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
              <select
                value={formValues.status}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    status: Number(event.target.value),
                  }))
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <option value={0}>Draft</option>
                <option value={1}>Confirmed</option>
                <option value={2}>Active</option>
                <option value={3}>Closed</option>
              </select>
            </label>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={createRental.isPending || updateStatus.isPending}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {(createRental.isPending || updateStatus.isPending) ? 'Saving...' : isEditMode ? 'Update Status' : 'Create Rental'}
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

