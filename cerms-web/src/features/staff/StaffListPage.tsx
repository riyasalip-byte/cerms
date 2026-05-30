import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Edit2,
  Eye,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Wrench,
  Briefcase,
  HardHat,
  Users,
} from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { ErrorState } from "@/components/shared/ErrorState"
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
import { useStaffList } from "@/hooks/useStaff"
import type { StaffDto } from "@/api/staff"

const employeeCategoryLabels: Record<string | number, string> = {
  0: "Operator",
  1: "Office Staff",
  2: "Manager",
  3: "Mechanic",
  4: "Helper",
  5: "Other",
  "0": "Operator",
  "1": "Office Staff",
  "2": "Manager",
  "3": "Mechanic",
  "4": "Helper",
  "5": "Other",
  "Operator": "Operator",
  "OfficeStaff": "Office Staff",
  "Office Staff": "Office Staff",
  "Manager": "Manager",
  "Mechanic": "Mechanic",
  "Helper": "Helper",
  "Other": "Other",
}

const employmentStatusLabels: Record<string | number, string> = {
  0: "Active",
  1: "Inactive",
  2: "Suspended",
  3: "Resigned",
  "0": "Active",
  "1": "Inactive",
  "2": "Suspended",
  "3": "Resigned",
  "Active": "Active",
  "Inactive": "Inactive",
  "Suspended": "Suspended",
  "Resigned": "Resigned",
}

const categoryIcons: Record<string | number, typeof UserRound> = {
  0: HardHat,
  1: Briefcase,
  2: Users,
  3: Wrench,
  4: UserRound,
  5: UserRound,
  "0": HardHat,
  "1": Briefcase,
  "2": Users,
  "3": Wrench,
  "4": UserRound,
  "5": UserRound,
  "Operator": HardHat,
  "OfficeStaff": Briefcase,
  "Office Staff": Briefcase,
  "Manager": Users,
  "Mechanic": Wrench,
  "Helper": UserRound,
  "Other": UserRound,
}

const statusClasses: Record<string | number, string> = {
  0: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50",
  1: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50",
  3: "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50",
  "0": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50",
  "1": "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "2": "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50",
  "3": "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50",
  "Active": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50",
  "Inactive": "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "Suspended": "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50",
  "Resigned": "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50",
}

export function StaffListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const queryParams = React.useMemo(
    () => ({
      searchTerm: debouncedSearch || undefined,
      employeeCategory: categoryFilter === "all" ? undefined : Number(categoryFilter),
      employmentStatus: statusFilter === "all" ? undefined : Number(statusFilter),
      pageSize: 100,
    }),
    [debouncedSearch, categoryFilter, statusFilter],
  )

  const { data, isLoading, isFetching, isError, refetch } = useStaffList(queryParams)
  const staff = React.useMemo(() => data?.items ?? [], [data])

  const columns: ColumnDef<StaffDto>[] = [
    {
      accessorKey: "staffCode",
      header: "Staff Code",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200">
          {row.original.staffCode}
        </span>
      ),
    },
    {
      accessorKey: "displayName",
      header: "Name",
      cell: ({ row }) => {
        const category = row.original.employeeCategory
        const Icon = categoryIcons[category] ?? UserRound
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
              <Icon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-bold text-sm leading-tight text-foreground">
                {row.original.displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.original.firstName} {row.original.lastName}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "employeeCategory",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {employeeCategoryLabels[row.original.employeeCategory] ?? "Unknown"}
        </Badge>
      ),
    },
    {
      accessorKey: "mobileNo",
      header: "Mobile",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.mobileNo}</span>
      ),
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) => row.original.designation || (
        <span className="text-muted-foreground font-light">-</span>
      ),
    },
    {
      accessorKey: "employmentStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.employmentStatus
        const isActive = status === 0 || status === "0" || status === "Active"
        return (
          <span
            className={[
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
              statusClasses[status] ?? statusClasses[1],
            ].join(" ")}
          >
            {isActive ? (
              <ShieldCheck className="size-3.5" />
            ) : (
              <ShieldAlert className="size-3.5" />
            )}
            {employmentStatusLabels[status] ?? "Unknown"}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="icon" className="size-8 hover:bg-slate-100 dark:hover:bg-slate-800" asChild>
            <Link to={`/staff/${row.original.id}`} aria-label={`View ${row.original.displayName}`}>
              <Eye className="size-4 text-slate-600 dark:text-slate-400" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="size-8 hover:bg-primary/10" asChild>
            <Link to={`/staff/${row.original.id}/edit`} aria-label={`Edit ${row.original.displayName}`}>
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
        message="We encountered an issue loading staff records."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Staff
          </h1>
          <p className="text-muted-foreground text-sm">
            Search, filter, and manage staff profiles, licenses, and employment records.
          </p>
        </div>
        <Button
          onClick={() => navigate("/staff/new")}
          className="shadow-lg shadow-primary/20 bg-primary font-semibold"
        >
          <Plus className="mr-2 size-4" />
          New Staff
        </Button>
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(employeeCategoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(employmentStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-muted bg-card shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={staff}
          isLoading={isLoading}
          tableId="staff-table"
          onRowClick={(row) => navigate(`/staff/${row.id}`)}
        />
      </div>
    </div>
  )
}
