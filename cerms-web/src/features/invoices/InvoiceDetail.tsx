import { Link, useParams } from 'react-router-dom'
import { mockInvoices, type InvoiceStatus, type PaymentMethod } from './mockInvoices'

const statusClassMap: Record<InvoiceStatus, string> = {
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  unpaid: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

const paymentMethodLabelMap: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  card: 'Card',
  cash: 'Cash',
}

function formatStatus(status: InvoiceStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function InvoiceDetail() {
  const { id } = useParams()
  const invoice = mockInvoices.find((item) => item.id === id)

  if (!invoice) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h1 className="text-xl font-semibold">Invoice not found</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No invoice matches ID: {id}
        </p>
        <Link
          to="/invoices"
          className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Back to invoices
        </Link>
      </section>
    )
  }

  const balance = Math.max(invoice.totalAmount - invoice.paidAmount, 0)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{invoice.id}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Invoice details and payment history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/invoices/${invoice.id}/payment`}
            className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Add Payment
          </Link>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Download PDF
          </button>
        </div>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Customer</p>
            <p className="mt-1 font-medium">
              {invoice.customerName} ({invoice.customerId})
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rental</p>
            <p className="mt-1 font-medium">{invoice.rentalId}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Issued Date</p>
            <p className="mt-1 font-medium">{invoice.issuedDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Due Date</p>
            <p className="mt-1 font-medium">{invoice.dueDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Amount</p>
            <p className="mt-1 font-medium">${invoice.totalAmount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Paid Amount</p>
            <p className="mt-1 font-medium">${invoice.paidAmount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Balance</p>
            <p className="mt-1 font-medium">${balance}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
            <span
              className={[
                'mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                statusClassMap[invoice.status],
              ].join(' ')}
            >
              {formatStatus(invoice.status)}
            </span>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Payment History</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {invoice.payments.length} payments
          </span>
        </div>

        {invoice.payments.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No payment records yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-4 font-medium">Payment ID</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Method</th>
                  <th className="py-2 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">
                      {payment.id}
                    </td>
                    <td className="py-3 pr-4">{payment.date}</td>
                    <td className="py-3 pr-4">${payment.amount}</td>
                    <td className="py-3 pr-4">
                      {paymentMethodLabelMap[payment.method]}
                    </td>
                    <td className="py-3">{payment.reference}</td>
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

