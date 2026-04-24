import * as React from "react"
import { useAssets } from "@/hooks/useAssets"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Eye, Edit2, Package, Activity } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatusBadge } from "@/components/shared/StatusBadge"

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
  const { data, isLoading, isError, refetch } = useAssets()
  const assets = data?.items || []

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Manage and monitor your equipment fleet in real-time.
          </p>
        </div>
        <Button 
          onClick={() => {
            console.log("[AssetList] New Asset button clicked")
            navigate("/assets/new")
          }} 
          className="shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 size-4" />
          New Asset
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={assets} 
        isLoading={isLoading} 
        searchKey="name"
        tableId="assets-table"
        onRowClick={(row) => {
          console.log(`[AssetList] Row clicked: ${row.id}`)
          navigate(`/assets/${row.id}`)
        }}
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
