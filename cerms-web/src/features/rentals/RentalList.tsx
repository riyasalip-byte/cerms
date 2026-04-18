import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getRentals } from '@/api/services'
import type { RentalStatus } from './mockRentals'

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

export function RentalList() {
  const {
    data: rentals = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['rentals'],
    queryFn: getRentals,
  })

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rentals</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Track rental lifecycle and customer assignments.
          </p>
        </div>
        <Link
          to="/rentals/new"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          New Rental
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        {isLoading && (
          <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-300">
            Loading rentals...
          </div>
        )}
        {isError && (
          <div className="px-4 py-6 text-sm text-rose-600 dark:text-rose-400">
            Failed to load rentals.
          </div>
        )}
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Rental</th>
              <th className="px-4 py-3 font-medium">Asset</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr
                key={rental.id}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
              >
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {rental.id}
                </td>
                <td className="px-4 py-3">{rental.assetName}</td>
                <td className="px-4 py-3">{rental.customerName}</td>
                <td className="px-4 py-3">
                  {rental.startDate} to {rental.endDate}
                </td>
                <td className="px-4 py-3">${rental.totalAmount}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                      statusClassMap[rental.status],
                    ].join(' ')}
                  >
                    {formatStatus(rental.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/rentals/${rental.id}`}
                      className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                    >
                      View
                    </Link>
                    <Link
                      to={`/rentals/new?rentalId=${rental.id}`}
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

