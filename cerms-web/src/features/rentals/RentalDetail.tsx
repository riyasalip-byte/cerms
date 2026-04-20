import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getRentalById } from '@/api/services'
import { type RentalStatus } from './mockRentals'

const statusClassMap: Record<RentalStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

function formatStatus(status: RentalStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function RentalDetail() {
  const { id } = useParams()
  
  const {
    data: rental,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['rentals', id],
    queryFn: () => getRentalById(id!),
    enabled: !!id,
  })

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
                statusClassMap[rental.status],
              ].join(' ')}
            >
              {formatStatus(rental.status)}
            </span>
          </div>
        </div>
      </article>
    </section>
  )
}

