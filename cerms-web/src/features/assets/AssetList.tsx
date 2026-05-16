import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Activity, Edit2, Eye, Plus, Truck } from "lucide-react"

import type { AssetDto } from "@/api/assets"
import { DataTable } from "@/components/shared/DataTable"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAssets } from "@/hooks/useAssets"
import { cn } from "@/lib/utils"

const assetCategoryLabels = [
  "Excavator",
  "Mini Excavator",
  "Backhoe Loader",
  "Light / Medium Duty Tipper",
  "Heavy Duty Tipper",
] as const

const defaultAssetColumnVisibility = {
  currentMeterReading: false,
  fitnessExpiryDate: false,
  insuranceExpiryDate: false,
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function getCategoryLabel(category: AssetDto["assetCategory"]) {
  if (typeof category === "number") {
    return assetCategoryLabels[category] ?? `Category ${category}`
  }

  return String(category)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
}

function formatDate(value?: string) {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return dateFormatter.format(date)
}

function getExpiryState(value?: string) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const daysUntilExpiry = Math.ceil((date.getTime() - today.getTime()) / 86_400_000)

  if (daysUntilExpiry < 0) return "expired"
  if (daysUntilExpiry <= 30) return "expiring"

  return null
}

function ExpiryCell({ value }: { value?: string }) {
  const state = getExpiryState(value)

  return (
    <div className="flex min-w-[150px] flex-col gap-1">
      <span className="font-medium text-foreground">{formatDate(value)}</span>
      {state && (
        <Badge
          variant="outline"
          className={cn(
            "w-fit border px-2 py-0.5 text-xs font-bold",
            state === "expired"
              ? "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20"
              : "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
          )}
        >
          {state === "expired" ? "Expired" : "Expiring in 30 days"}
        </Badge>
      )}
    </div>
  )
}

export function AssetList() {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [transportFilter, setTransportFilter] = React.useState<"all" | "required" | "not_required">("all")

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const queryParams = React.useMemo(
    () => ({
      searchTerm: debouncedSearch || undefined,
      status: statusFilter === "all" ? undefined : Number(statusFilter),
      category: categoryFilter === "all" ? undefined : Number(categoryFilter),
      pageSize: 100,
    }),
    [categoryFilter, debouncedSearch, statusFilter]
  )

  const { data, isLoading, isFetching, isError, refetch } = useAssets(queryParams)

  const assets = React.useMemo(() => {
    let items = data?.items ?? []
    
    if (transportFilter === "required") {
      items = items.filter((a) => a.isTransportationRequired)
    } else if (transportFilter === "not_required") {
      items = items.filter((a) => !a.isTransportationRequired)
    }

    const term = searchTerm.trim().toLowerCase()

    if (!term) return items

    return items.filter((asset) =>
      [
        asset.assetCode,
        asset.assetName,
        asset.registerNo,
        getCategoryLabel(asset.assetCategory),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    )
  }, [data, searchTerm, transportFilter])

  const columns: ColumnDef<AssetDto>[] = [
    {
      accessorKey: "assetCode",
      header: "Asset Code",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold text-muted-foreground">
          {row.original.assetCode}
        </span>
      ),
    },
    {
      accessorKey: "assetName",
      header: "Asset Name",
      cell: ({ row }) => (
        <span className="block min-w-[180px] max-w-[280px] truncate font-bold text-foreground">
          {row.original.assetName}
        </span>
      ),
    },
    {
      accessorKey: "assetCategory",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-semibold">
          {getCategoryLabel(row.original.assetCategory)}
        </Badge>
      ),
    },
    {
      accessorKey: "registerNo",
      header: "Register No",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.registerNo || "-"}
        </span>
      ),
    },
    {
      accessorKey: "currentMeterReading",
      header: "Current Meter Reading",
      cell: ({ row }) => (
        <div className="flex min-w-[150px] items-center gap-2 font-mono text-sm">
          <Activity className="size-3.5 shrink-0 text-muted-foreground" />
          <span>{row.original.currentMeterReading.toLocaleString()} units</span>
        </div>
      ),
    },
    {
      accessorKey: "fitnessExpiryDate",
      header: "Fitness Expiry",
      cell: ({ row }) => <ExpiryCell value={row.original.fitnessExpiryDate} />,
    },
    {
      accessorKey: "insuranceExpiryDate",
      header: "Insurance Expiry",
      cell: ({ row }) => <ExpiryCell value={row.original.insuranceExpiryDate} />,
    },
    {
      accessorKey: "isTransportationRequired",
      header: "Transport",
      cell: ({ row }) => (
        <Badge
          variant={row.original.isTransportationRequired ? "default" : "secondary"}
          className="flex w-fit items-center gap-1 font-semibold"
        >
          {row.original.isTransportationRequired ? (
            <>
              <Truck className="size-3" /> Yes
            </>
          ) : (
            "No"
          )}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} className="asset" />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/assets/${row.original.id}`} aria-label={`View ${row.original.assetName}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/assets/${row.original.id}/edit`} aria-label={`Edit ${row.original.assetName}`}>
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
        message="We encountered an issue loading your fleet records."
      />
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Search, filter, and monitor fleet documents from one view.
          </p>
        </div>
        <Button onClick={() => navigate("/assets/new")} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 size-4" />
          New Asset
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-muted/60 bg-card p-4 shadow-sm lg:flex-row lg:items-center">
        <Input
          placeholder="Search by code, name, register no, or category..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-10 w-full transition-shadow focus:shadow-md lg:max-w-md"
        />
        {isFetching && !isLoading && (
          <span className="text-sm text-muted-foreground">Updating results...</span>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="0">Available</SelectItem>
              <SelectItem value="1">Rented</SelectItem>
              <SelectItem value="2">Maintenance</SelectItem>
              <SelectItem value="3">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[240px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {assetCategoryLabels.map((label, index) => (
                <SelectItem key={label} value={String(index)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={transportFilter} onValueChange={(val: any) => setTransportFilter(val)}>
            <SelectTrigger className="h-10 w-full sm:w-[220px]">
              <SelectValue placeholder="Transport required?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Transport</SelectItem>
              <SelectItem value="required">Required Only</SelectItem>
              <SelectItem value="not_required">Not Required</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={assets}
        isLoading={isLoading}
        tableId="assets-table"
        defaultColumnVisibility={defaultAssetColumnVisibility}
        onRowClick={(row) => navigate(`/assets/${row.id}`)}
      />
    </div>
  )
}
