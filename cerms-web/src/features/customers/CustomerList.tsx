import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCustomers } from '@/api/services'

export function CustomerList() {
  const [query, setQuery] = useState('')
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  })

  const customers = data?.items || []

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers

    return customers.filter((customer: any) =>
      [customer.id, customer.name, customer.email, customer.company]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [customers, query])

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Search and manage customer records.
          </p>
        </div>
        <Link
          to="/customers/new"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          New Customer
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Search
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, ID, email, or company"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        {isLoading && (
          <div className="px-4 py-6 text-sm text-slate-600 dark:text-slate-300">
            Loading customers...
          </div>
        )}
        {isError && (
          <div className="px-4 py-6 text-sm text-rose-600 dark:text-rose-400">
            Failed to load customers.
          </div>
        )}
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {customer.customerName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {customer.id} - {customer.email}
                  </div>
                </td>
                <td className="px-4 py-3">{customer.company}</td>
                <td className="px-4 py-3">{customer.mobileNo}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                      customer.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                    ].join(' ')}
                  >
                    {customer.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/customers/${customer.id}`}
                      className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                    >
                      View
                    </Link>
                    <Link
                      to={`/customers/new?customerId=${customer.id}`}
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

