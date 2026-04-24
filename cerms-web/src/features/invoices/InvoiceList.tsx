import * as React from "react"
import { useInvoices } from "@/hooks/useInvoices"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, FileText, Calendar, ArrowUpRight } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { format } from "date-fns"

type InvoiceRecord = {
  id: string
  invoiceNumber: string
  issuedDate: string
  total: number
  balanceDue: number
  status: number
}

export function InvoiceList() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useInvoices()
  const invoices = data?.items || []

  const columns: ColumnDef<InvoiceRecord>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <span className="font-bold">{row.original.invoiceNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: "issuedDate",
      header: "Issued Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-3.5" />
          {format(new Date(row.original.issuedDate), "MMM dd, yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <div className="font-bold text-foreground">
          ${row.original.total.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "balanceDue",
      header: "Balance Due",
      cell: ({ row }) => (
        <div className={cn(
          "font-bold",
          row.original.balanceDue > 0 ? "text-destructive" : "text-emerald-600"
        )}>
          ${row.original.balanceDue.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} className="invoice" />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/invoices/${row.original.id}`}>
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      ),
    },
  ]

  if (isError) {
    return (
      <ErrorState 
        onRetry={refetch} 
        message="Failed to load billing information. Please check your connection." 
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Track and manage customer billing and payment statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download All</Button>
          <Button>Process Payments</Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={invoices} 
        isLoading={isLoading} 
        searchKey="invoiceNumber"
        tableId="invoices-table"
        onRowClick={(row) => navigate(`/invoices/${row.id}`)}
      />
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
