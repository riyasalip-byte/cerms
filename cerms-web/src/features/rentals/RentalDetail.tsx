import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getRentalById } from '@/api/services'
import { useCloseRental } from '@/hooks/useRentals'
import { toast } from 'sonner'
import { useState } from 'react'

const statusClassMap: Record<number, string> = {
  0: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', // Draft
  1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', // Confirmed
  2: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', // Active
  3: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', // Closed
}

function formatStatus(status: number) {
  const map: Record<number, string> = { 0: 'Draft', 1: 'Confirmed', 2: 'Active', 3: 'Closed' }
  return map[status] || 'Unknown'
}

export function RentalDetail() {
  const { id } = useParams()
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [actualEndDate, setActualEndDate] = useState(new Date().toISOString().split('T')[0])
  const [odometer, setOdometer] = useState('')

  const {
    data: rental,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['rentals', id],
    queryFn: () => getRentalById(id!),
    enabled: !!id,
  })

  const closeRental = useCloseRental()

  const handleClose = async () => {
    if (!odometer) {
      toast.error('Please enter the current odometer reading')
      return
    }

    try {
      await closeRental.mutateAsync({
        id: id!,
        actualEndDate,
        currentOdometer: Number(odometer),
      })
      setShowCloseForm(false)
    } catch (error) {
      // toast is handled in hook
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-300">
        Loading rental details...
      </div>
    )
  }

  if (isError || !rental) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h1 className="text-xl font-semibold text-rose-600 dark:text-rose-400">
          Rental not found
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No rental matches ID: {id}
        </p>
        <Link
          to="/rentals"
          className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Back to rentals
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{rental.id}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Rental details and assignment overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          {rental.status < 3 && !showCloseForm && (
            <button
              onClick={() => setShowCloseForm(true)}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Close & Bill
            </button>
          )}
          <Link
            to={`/rentals/new?rentalId=${rental.id}`}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Edit Rental
          </Link>
          <Link
            to="/rentals"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            Back to list
          </Link>
        </div>
      </div>

      {showCloseForm && (
        <article className="rounded-lg border-2 border-blue-500 bg-blue-50/50 p-6 shadow-sm dark:bg-blue-900/10">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-400">Close Rental & Generate Invoice</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Actual End Date</span>
              <input
                type="date"
                value={actualEndDate}
                onChange={(e) => setActualEndDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Final Odometer</span>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder={`Min: ${rental.currentOdometer || 0}`}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleClose}
              disabled={closeRental.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {closeRental.isPending ? 'Processing...' : 'Confirm & Bill'}
            </button>
            <button
              onClick={() => setShowCloseForm(false)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </article>
      )}

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Asset</p>
            <p className="mt-1 font-medium">
              {rental.assetName} ({rental.assetId})
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Customer</p>
            <p className="mt-1 font-medium">
              {rental.customerName} ({rental.customerId})
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Start Date</p>
            <p className="mt-1 font-medium">{rental.startDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">End Date</p>
            <p className="mt-1 font-medium">{rental.endDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Amount</p>
            <p className="mt-1 font-medium">${rental.totalAmount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
            <span
              className={[
                'mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                (statusClassMap as any)[rental.status],
              ].join(' ')}
            >
              {(formatStatus as any)(rental.status)}
            </span>
          </div>
        </div>
      </article>
    </section>
  )
}

