import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useInvoice, useInvoicePdf } from '@/hooks/useInvoices'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Set up PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const statusClassMap: Record<number, string> = {
  2: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', // Paid
  3: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', // Partial
  1: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300', // Unpaid
  4: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', // Overdue
}

const statusTextMap: Record<number, string> = {
  1: 'Unpaid',
  2: 'Paid',
  3: 'Partial',
  4: 'Overdue',
}

export function InvoiceDetail() {
  const { id } = useParams()
  const { data: invoice, isLoading, isError } = useInvoice(id!)
  const { refetch: fetchPdf, isFetching: isPdfLoading } = useInvoicePdf(id!)
  
  const [showPreview, setShowPreview] = useState(false)
  const [numPages, setNumPages] = useState<number>()
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)

  const handleDownload = async () => {
    const { data: blob } = await fetchPdf()
    if (blob) {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Invoice-${invoice?.invoiceNumber || id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }
  }

  const handleView = async () => {
    if (showPreview) {
      setShowPreview(false)
      return
    }

    if (!pdfBlobUrl) {
      const { data: blob } = await fetchPdf()
      if (blob) {
        const url = window.URL.createObjectURL(blob)
        setPdfBlobUrl(url)
      }
    }
    setShowPreview(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (isError || !invoice) {
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

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{invoice.invoiceNumber}</h1>
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
            onClick={handleView}
            disabled={isPdfLoading}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {isPdfLoading ? 'Loading...' : showPreview ? 'Hide Preview' : 'View PDF'}
          </button>
          <button
            onClick={handleDownload}
            disabled={isPdfLoading}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Download PDF
          </button>
        </div>
      </div>

      {showPreview && pdfBlobUrl && (
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 flex flex-col items-center overflow-auto max-h-[800px]">
          <Document
            file={pdfBlobUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="p-10">Loading PDF...</div>}
          >
            {Array.from(new Array(numPages), (_, index) => (
              <Page 
                key={`page_${index + 1}`} 
                pageNumber={index + 1} 
                scale={1.2}
                className="mb-4 shadow-lg"
              />
            ))}
          </Document>
        </article>
      )}

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Issued Date</p>
            <p className="mt-1 font-medium">{new Date(invoice.issuedDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Amount</p>
            <p className="mt-1 font-medium">${invoice.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Paid Amount</p>
            <p className="mt-1 font-medium">${invoice.amountPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Balance</p>
            <p className="mt-1 font-medium text-rose-600 dark:text-rose-400">${invoice.balanceDue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
            <span
              className={[
                'mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                statusClassMap[invoice.status] || 'bg-slate-100 text-slate-700',
              ].join(' ')}
            >
              {statusTextMap[invoice.status] || 'Unknown'}
            </span>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-4 font-medium">Description</th>
                <th className="py-2 pr-4 font-medium text-center">Quantity</th>
                <th className="py-2 pr-4 font-medium text-right">Unit Price</th>
                <th className="py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, index) => (
                <tr key={index} className="border-b border-slate-100 last:border-0 dark:border-slate-800/70">
                  <td className="py-3 pr-4">{item.description}</td>
                  <td className="py-3 pr-4 text-center">{item.quantity}</td>
                  <td className="py-3 pr-4 text-right">${item.unitPrice.toLocaleString()}</td>
                  <td className="py-3 text-right">${item.totalPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

