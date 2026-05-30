import * as React from "react"
import { useRentals } from "@/hooks/useRentals"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Eye, Edit2, Calendar, User, Package } from "lucide-react"
import { usePermission } from "@/hooks/usePermission"

import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { format } from "date-fns"

type RentalRecord = {
  id: string
  assetName: string
  customerName: string
  startDateTime: string
  expectedEndDateTime: string
  status: number
  siteName?: string
  advanceAmount?: number
  fuelResponsibilityType?: string | number
  assignedOperatorName?: string
}

const formatFuelResponsibility = (type?: string | number) => {
  if (type === 0 || type === "0" || type === "Customer") return "Customer"
  if (type === 1 || type === "1" || type === "Company") return "Company"
  if (type === 2 || type === "2" || type === "Shared") return "Shared"
  return String(type || "Customer")
}

export function RentalList() {
  const navigate = useNavigate()
  const { canCreateRental, canEditRental } = usePermission()
  
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [fuelFilter, setFuelFilter] = React.useState<string>("all")
  const [dateFrom, setDateFrom] = React.useState<string>("")
  const [dateTo, setDateTo] = React.useState<string>("")

  const { data, isLoading, isError, refetch } = useRentals({
    status: statusFilter !== "all" ? statusFilter : undefined,
    fuelResponsibilityType: fuelFilter !== "all" ? fuelFilter : undefined,
    startDate: dateFrom || undefined,
    endDate: dateTo || undefined
  })
  
  const rentals = data?.items || []

  const columns: ColumnDef<RentalRecord>[] = [
    {
      accessorKey: "assetName",
      header: "Asset",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <span className="font-semibold">{row.original.assetName}</span>
        </div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="size-3 text-primary" />
          </div>
          <span>{row.original.customerName}</span>
        </div>
      ),
    },
    {
      accessorKey: "assignedOperatorName",
      header: "Operator",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.assignedOperatorName ? (
            <>
              <div className="size-6 rounded bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center font-bold text-[10px]">
                {row.original.assignedOperatorName.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-medium text-slate-900 dark:text-slate-100">{row.original.assignedOperatorName}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-xs italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} className="rental" />
      ),
    },
    {
      accessorKey: "siteName",
      header: "Site Name",
      cell: ({ row }) => (
        <span className="font-medium text-slate-700 dark:text-slate-350">{row.original.siteName || "-"}</span>
      ),
    },
    {
      accessorKey: "advanceAmount",
      header: "Advance",
      cell: ({ row }) => (
        <span className="font-mono text-slate-600 dark:text-slate-400">
          {row.original.advanceAmount !== undefined && row.original.advanceAmount !== null
            ? `$${Number(row.original.advanceAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            : "-"}
        </span>
      ),
    },
    {
      accessorKey: "fuelResponsibilityType",
      header: "Fuel Responsibility",
      cell: ({ row }) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
          {formatFuelResponsibility(row.original.fuelResponsibilityType)}
        </span>
      ),
    },
    {
      accessorKey: "startDateTime",
      header: "Start Date",
      cell: ({ row }) => {
        const start = new Date(row.original.startDateTime)
        return (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="size-3 text-muted-foreground" />
            {format(start, "MMM dd, yyyy")}
          </div>
        )
      },
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
          {canEditRental && (
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/rentals/${row.original.id}/edit`}>
                <Edit2 className="size-4 text-primary" />
              </Link>
            </Button>
          )}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rentals</h1>
          <p className="text-muted-foreground">
            Manage your rental agreements and equipment assignments.
          </p>
        </div>
        {canCreateRental && (
          <Button onClick={() => navigate("/rentals/new")} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 size-4" />
            Create Rental
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="0">Draft</SelectItem>
              <SelectItem value="1">Confirmed</SelectItem>
              <SelectItem value="2">Dispatched</SelectItem>
              <SelectItem value="3">Active</SelectItem>
              <SelectItem value="4">Completed</SelectItem>
              <SelectItem value="5">Closed</SelectItem>
              <SelectItem value="6">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fuel Responsibility</label>
          <Select value={fuelFilter} onValueChange={setFuelFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              <SelectItem value="0">Customer</SelectItem>
              <SelectItem value="1">Company</SelectItem>
              <SelectItem value="2">Shared</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From Date</label>
          <Input 
            type="date" 
            value={dateFrom} 
            onChange={(e) => setDateFrom(e.target.value)} 
          />
        </div>
        
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Date</label>
          <Input 
            type="date" 
            value={dateTo} 
            onChange={(e) => setDateTo(e.target.value)} 
          />
        </div>

        <Button 
          variant="outline" 
          onClick={() => {
            setStatusFilter("all")
            setFuelFilter("all")
            setDateFrom("")
            setDateTo("")
          }}
          className="shrink-0"
        >
          Clear Filters
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={rentals} 
        isLoading={isLoading} 
        searchKey="assetName"
        tableId="rentals-table"
        onRowClick={(row) => navigate(`/rentals/${row.id}`)}
      />
    </div>
  )
}
