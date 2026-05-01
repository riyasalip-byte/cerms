import * as React from "react"
import { useAssets } from "@/hooks/useAssets"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Eye, Edit2, Package, Activity } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type AssetRecord = {
  id: string
  name: string
  assetCode: string
  assetType: string
  currentOdometer: number
  status: number
}

export function AssetList() {
  const navigate = useNavigate()
  
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  // Debounce search term to prevent excessive API calls
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data, isLoading, isError, refetch } = useAssets({
    searchTerm: debouncedSearch || undefined,
    status: statusFilter !== "all" ? Number(statusFilter) : undefined,
    pageSize: 100 // Fetch a larger set to let DataTable handle local pagination
  })
  
  const assets = React.useMemo(() => {
    if (!data) return [];
    return (data as any).items || (data as any).Items || [];
  }, [data])

  const columns: ColumnDef<AssetRecord>[] = [
    {
      accessorKey: "name",
      header: "Asset",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800">
            <Package className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{row.original.name}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
              {row.original.assetCode}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "assetType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium">
          {row.original.assetType}
        </Badge>
      ),
    },
    {
      accessorKey: "currentOdometer",
      header: "Odometer",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-mono text-sm">
          <Activity className="size-3.5 text-muted-foreground" />
          {row.original.currentOdometer.toLocaleString()} units
        </div>
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
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/assets/${row.original.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/assets/${row.original.id}/edit`}>
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Manage and monitor your equipment fleet in real-time.
          </p>
        </div>
        <Button 
          onClick={() => navigate("/assets/new")} 
          className="shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 size-4" />
          New Asset
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6 mt-4 p-4 bg-card rounded-xl border border-muted/60 shadow-sm">
        <Input
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm h-10 transition-shadow focus:shadow-md"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-10">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="1">Available</SelectItem>
            <SelectItem value="2">Rented</SelectItem>
            <SelectItem value="3">Maintenance</SelectItem>
            <SelectItem value="4">Decommissioned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable 
        columns={columns} 
        data={assets} 
        isLoading={isLoading} 
        tableId="assets-table"
        onRowClick={(row) => navigate(`/assets/${row.id}`)}
      />
    </div>
  )
}

function Badge({ className, variant = "default", ...props }: any) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-muted text-muted-foreground",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${variants[variant as keyof typeof variants]} ${className}`} {...props} />
  )
}
