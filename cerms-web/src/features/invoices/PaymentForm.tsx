import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { mockInvoices, type PaymentMethod } from './mockInvoices'

type PaymentFormValues = {
  amount: string
  date: string
  method: PaymentMethod
  reference: string
}

export function PaymentForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const invoice = useMemo(() => mockInvoices.find((item) => item.id === id), [id])

  const [formValues, setFormValues] = useState<PaymentFormValues>({
    amount: '',
    date: '',
    method: 'bank_transfer',
    reference: '',
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(`/invoices/${id}`, { replace: true })
  }

  if (!invoice) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h1 className="text-xl font-semibold">Invoice not found</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Cannot add payment. Invalid invoice ID: {id}
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
          <h1 className="text-2xl font-semibold tracking-tight">Record Payment</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Invoice {invoice.id} - balance ${balance}
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
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Amount</span>
            <input
              type="number"
              min="0"
              step="1"
              value={formValues.amount}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, amount: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
              placeholder="250"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Payment Date</span>
            <input
              type="date"
              value={formValues.date}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, date: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Method</span>
            <select
              value={formValues.method}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  method: event.target.value as PaymentMethod,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Reference</span>
            <input
              value={formValues.reference}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  reference: event.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
              placeholder="TXN-REF-001"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Record Payment
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

