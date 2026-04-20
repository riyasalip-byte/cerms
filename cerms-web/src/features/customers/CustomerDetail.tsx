import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getCustomerById } from '@/api/services'
import { mockRentalHistoryByCustomer, type RentalHistoryItem } from './mockCustomers'

const rentalStatusClassMap: Record<RentalHistoryItem['status'], string> = {
  completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  ongoing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

export function CustomerDetail() {
  const { id } = useParams()
  
  const {
    data: customer,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['customers', id],
    queryFn: () => getCustomerById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-300">
        Loading customer details...
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h1 className="text-xl font-semibold text-rose-600 dark:text-rose-400">
          Customer not found
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No customer record matches ID: {id}
        </p>
        <Link
          to="/customers"
          className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Back to customers
        </Link>
      </section>
    )
  }

  const rentalHistory = mockRentalHistoryByCustomer[customer.id] ?? []

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Customer profile and rental activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/customers/new?customerId=${customer.id}`}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Edit Profile
          </Link>
          <Link
            to="/customers"
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
            <p className="text-xs text-slate-500 dark:text-slate-400">Customer ID</p>
            <p className="mt-1 font-medium">{customer.id}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Company</p>
            <p className="mt-1 font-medium">{customer.company}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
            <p className="mt-1 font-medium">{customer.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
            <p className="mt-1 font-medium">{customer.phone}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Joined On</p>
            <p className="mt-1 font-medium">{customer.joinedOn}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
            <p className="mt-1 font-medium">
              {customer.status === 'active' ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="text-lg font-semibold tracking-tight">Rental History</h2>
        {rentalHistory.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            No rentals found for this customer.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-4 font-medium">Rental</th>
                  <th className="py-2 pr-4 font-medium">Asset</th>
                  <th className="py-2 pr-4 font-medium">Start</th>
                  <th className="py-2 pr-4 font-medium">End</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rentalHistory.map((item) => (
                  <tr
                    key={item.rentalId}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">
                      {item.rentalId}
                    </td>
                    <td className="py-3 pr-4">{item.assetName}</td>
                    <td className="py-3 pr-4">{item.startDate}</td>
                    <td className="py-3 pr-4">{item.endDate}</td>
                    <td className="py-3 pr-4">${item.amount}</td>
                    <td className="py-3">
                      <span
                        className={[
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                          rentalStatusClassMap[item.status],
                        ].join(' ')}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  )
}

