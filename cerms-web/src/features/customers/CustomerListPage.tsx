import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit2, Eye, Plus, UserRound, Building, PhoneCall, DollarSign, Search, ShieldCheck, ShieldAlert } from "lucide-react"

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
import { usePermission } from "@/hooks/usePermission"
import type { CustomerDto } from "@/api/customers"

export function CustomerListPage() {
  const navigate = useNavigate()
  const { canCreateCustomer, canEditCustomer } = usePermission()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const queryParams = React.useMemo(
    () => ({
      searchTerm: debouncedSearch || undefined,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      customerType: typeFilter === "all" ? undefined : (typeFilter === "company" ? 1 : 0),
      pageSize: 100,
    }),
    [debouncedSearch, statusFilter, typeFilter]
  )

  const { data, isLoading, isFetching, isError, refetch } = useCustomers(queryParams)

  const customers = React.useMemo(() => {
    return data?.items ?? []
  }, [data])

  const columns: ColumnDef<CustomerDto>[] = [
    {
      accessorKey: "customerCode",
      header: "Customer Code",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200">
          {row.original.customerCode}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      cell: ({ row }) => {
        const isCompany = row.original.customerType === 1
        return (
          <div className="flex items-center gap-3">
            <div className={[
              "flex size-10 items-center justify-center rounded-xl border transition-colors",
              isCompany 
                ? "border-purple-100 bg-purple-50 text-purple-700 dark:border-purple-900/40 dark:bg-purple-900/20 dark:text-purple-300"
                : "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
            ].join(" ")}>
              {isCompany ? <Building className="size-5" /> : <UserRound className="size-5" />}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-bold text-foreground text-sm leading-tight">
                {row.original.customerName}
              </span>
              <span className="inline-flex mt-0.5 items-center gap-1.5">
                <span className={[
                  "inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  isCompany
                    ? "bg-purple-100/70 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                    : "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                ].join(" ")}>
                  {isCompany ? "Company" : "Individual"}
                </span>
                {row.original.gstOrTaxNumber && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    GST: {row.original.gstOrTaxNumber}
                  </span>
                )}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "mobileNo",
      header: "Mobile No",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm font-medium">
          <PhoneCall className="size-3.5 text-muted-foreground shrink-0" />
          <span>{row.original.mobileNo}</span>
        </div>
      )
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => row.original.city || <span className="text-muted-foreground font-light">-</span>,
    },
    {
      accessorKey: "outstandingBalance",
      header: "Outstanding Balance",
      cell: ({ row }) => {
        const balance = row.original.outstandingBalance
        const hasBalance = balance > 0
        return (
          <div className="flex items-center gap-1">
            {hasBalance ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                <DollarSign className="size-3.5" />
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            ) : (
              <span className="text-slate-500 font-medium text-xs dark:text-slate-400">
                $0.00
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={[
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all",
            row.original.isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          ].join(" ")}
        >
          {row.original.isActive ? (
            <>
              <ShieldCheck className="size-3.5" />
              Active
            </>
          ) : (
            <>
              <ShieldAlert className="size-3.5" />
              Inactive
            </>
          )}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 size-8" asChild>
            <Link to={`/customers/${row.original.id}`} aria-label={`View ${row.original.customerName}`}>
              <Eye className="size-4 text-slate-600 dark:text-slate-400" />
            </Link>
          </Button>
          {canEditCustomer && (
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 size-8" asChild>
              <Link to={`/customers/${row.original.id}/edit`} aria-label={`Edit ${row.original.customerName}`}>
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
        message="We encountered an issue loading customer records."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">Customers</h1>
          <p className="text-muted-foreground text-sm">
            Search, filter, and manage enterprise accounts and individual rental customer profiles.
          </p>
        </div>
        {canCreateCustomer && (
          <Button onClick={() => navigate("/customers/new")} className="shadow-lg shadow-primary/20 bg-primary font-semibold">
            <Plus className="mr-2 size-4" />
            Add Customer
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-muted bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, name, or mobile..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9 h-10 transition-shadow focus:shadow-md border-muted focus-visible:ring-primary/20"
          />
        </div>
        
        {isFetching && !isLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>
        )}

        <div className="flex flex-wrap gap-3 items-center ml-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-[160px]">
              <SelectValue placeholder="Customer Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[160px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-muted bg-card shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={customers}
          isLoading={isLoading}
          tableId="customers-table"
          onRowClick={(row) => navigate(`/customers/${row.id}`)}
        />
      </div>
    </div>
  )
}
