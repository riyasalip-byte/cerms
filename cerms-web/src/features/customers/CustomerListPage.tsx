import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit2, Eye, Plus, UserRound } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { ErrorState } from "@/components/shared/ErrorState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCustomers } from "@/hooks/useCustomers"
import type { CustomerDto } from "@/api/customers"

export function CustomerListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const queryParams = React.useMemo(
    () => ({
      searchTerm: debouncedSearch || undefined,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      pageSize: 100,
    }),
    [debouncedSearch, statusFilter]
  )

  const { data, isLoading, isFetching, isError, refetch } = useCustomers(queryParams)

  const customers = React.useMemo(() => {
    const items = data?.items ?? []
    const term = searchTerm.trim().toLowerCase()

    if (!term) return items

    return items.filter((customer) =>
      [customer.name, customer.phone, customer.customerCode]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    )
  }, [data, searchTerm])

  const columns: ColumnDef<CustomerDto>[] = [
    {
      accessorKey: "customerCode",
      header: "Customer Code",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold text-muted-foreground">
          {row.original.customerCode}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
            <UserRound className="size-5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-bold text-foreground">{row.original.name}</span>
            {row.original.companyName && (
              <span className="truncate text-xs font-medium text-muted-foreground">
                {row.original.companyName}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={[
            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
            row.original.isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          ].join(" ")}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/customers/${row.original.id}`} aria-label={`View ${row.original.name}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/customers/${row.original.id}/edit`} aria-label={`Edit ${row.original.name}`}>
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
        message="We encountered an issue loading customer records."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Search and manage customer records.
          </p>
        </div>
        <Button onClick={() => navigate("/customers/new")} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 size-4" />
          Add Customer
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-muted/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name, phone, or customer code..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-10 max-w-sm transition-shadow focus:shadow-md"
        />
        {isFetching && !isLoading && (
          <span className="text-sm text-muted-foreground">Updating results...</span>
        )}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        tableId="customers-table"
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
      />
    </div>
  )
}
