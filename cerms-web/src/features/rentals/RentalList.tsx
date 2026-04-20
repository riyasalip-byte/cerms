import { useRentals } from '@/hooks/useRentals'
import { Link } from 'react-router-dom'

const statusClassMap: Record<number, string> = {
  0: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', // Draft
  1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', // Confirmed
  2: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', // Active
  3: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', // Closed
}

const statusTextMap: Record<number, string> = {
  0: 'Draft',
  1: 'Confirmed',
  2: 'Active',
  3: 'Closed',
}

export function RentalList() {
  const { data, isLoading, isError } = useRentals()
  const rentals = data?.items || []

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rentals</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Track and manage active and upcoming rentals.
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
          <div className="px-4 py-12 flex justify-center text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
              Loading rentals...
            </div>
          </div>
        )}
        {isError && (
          <div className="px-4 py-6 text-sm text-rose-600 dark:text-rose-400 text-center">
            Failed to load rentals. Please try again.
          </div>
        )}
        {!isLoading && !isError && (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Period</th>
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
                    {rental.customerName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {rental.assetName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {new Date(rental.startDate).toLocaleDateString()} -{' '}
                    {new Date(rental.expectedEndDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                        statusClassMap[rental.status] || 'bg-slate-100 text-slate-700',
                      ].join(' ')}
                    >
                      {statusTextMap[rental.status] || 'Unknown'}
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
                      {rental.status < 3 && ( // If not Closed
                        <Link
                          to={`/rentals/${rental.id}/edit`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Manage
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rentals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No rentals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
