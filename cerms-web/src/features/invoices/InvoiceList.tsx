import { Link } from 'react-router-dom'
import { mockInvoices, type InvoiceStatus } from './mockInvoices'

const statusClassMap: Record<InvoiceStatus, string> = {
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  unpaid: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

function formatStatus(status: InvoiceStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function InvoiceList() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Review invoice status and payment progress.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Paid</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
              >
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {invoice.id}
                </td>
                <td className="px-4 py-3">{invoice.customerName}</td>
                <td className="px-4 py-3">{invoice.issuedDate}</td>
                <td className="px-4 py-3">{invoice.dueDate}</td>
                <td className="px-4 py-3">${invoice.totalAmount}</td>
                <td className="px-4 py-3">${invoice.paidAmount}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                      statusClassMap[invoice.status],
                    ].join(' ')}
                  >
                    {formatStatus(invoice.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/invoices/${invoice.id}`}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

