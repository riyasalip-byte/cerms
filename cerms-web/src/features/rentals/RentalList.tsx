import * as React from "react"
import { useRentals } from "@/hooks/useRentals"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Eye, Edit2, Calendar, User, Package } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { format } from "date-fns"

type RentalRecord = {
  id: string
  customerName: string
  assetName: string
  startDate: string
  expectedEndDate: string
  status: number
}

export function RentalList() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useRentals()
  const rentals = data?.items || []

  const columns: ColumnDef<RentalRecord>[] = [
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="size-4 text-primary" />
          </div>
          <span className="font-semibold">{row.original.customerName}</span>
        </div>
      ),
    },
    {
      accessorKey: "assetName",
      header: "Asset",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <span>{row.original.assetName}</span>
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Period",
      cell: ({ row }) => {
        const start = new Date(row.original.startDate)
        const end = new Date(row.original.expectedEndDate)
        return (
          <div className="flex flex-col text-xs font-medium">
            <div className="flex items-center gap-1">
              <Calendar className="size-3 text-muted-foreground" />
              {format(start, "MMM dd, yyyy")}
            </div>
            <div className="text-muted-foreground pl-4">to {format(end, "MMM dd, yyyy")}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} className="rental" />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/rentals/${row.original.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/rentals/${row.original.id}/edit`}>
              <Edit2 className="size-4 text-primary" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <ErrorState 
        onRetry={refetch} 
        message="We couldn't load the rental records at this time." 
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rentals</h1>
          <p className="text-muted-foreground">
            Manage your rental agreements and equipment assignments.
          </p>
        </div>
        <Button onClick={() => navigate("/rentals/new")} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 size-4" />
          New Rental
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={rentals} 
        isLoading={isLoading} 
        searchKey="customerName"
        tableId="rentals-table"
        onRowClick={(row) => navigate(`/rentals/${row.id}`)}
      />
    </div>
  )
}
