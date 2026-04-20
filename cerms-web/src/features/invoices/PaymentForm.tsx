import { useInvoice, useRecordPayment } from '@/hooks/useInvoices'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export function PaymentForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const { data: invoice, isLoading } = useInvoice(id!)
  const recordPayment = useRecordPayment()

  const [amount, setAmount] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await recordPayment.mutateAsync({ id: id!, amount: Number(amount) })
    navigate(`/invoices/${id}`)
  }

  if (isLoading) {
    return (
      <div className="px-4 py-12 flex justify-center text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
          Loading invoice data...
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 text-center">
        <h1 className="text-xl font-semibold">Invoice not found</h1>
        <Link to="/invoices" className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to invoices
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Record Payment</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Invoice {invoice.invoiceNumber} - balance ${invoice.balanceDue.toLocaleString()}
          </p>
        </div>
        <Link
          to={`/invoices/${invoice.id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        >
          Back to invoice
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
      >
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount to Pay</span>
            <input
              type="number"
              min="0.01"
              max={invoice.balanceDue}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
              placeholder={String(invoice.balanceDue)}
            />
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={recordPayment.isPending}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {recordPayment.isPending ? 'Processing...' : 'Record Payment'}
          </button>
          <Link
            to={`/invoices/${invoice.id}`}
            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}

