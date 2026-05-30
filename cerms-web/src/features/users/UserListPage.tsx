import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Edit2,
  KeyRound,
  Loader2,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { usePermission } from "@/hooks/usePermission"

import { DataTable } from "@/components/shared/DataTable"
import { ErrorState } from "@/components/shared/ErrorState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useResetPassword, useUsers } from "@/hooks/useUsers"
import type { UserDto } from "@/api/users"

export function UserListPage() {
  const navigate = useNavigate()
  const { canCreateUser, canEditUser, canResetPassword } = usePermission()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [resetUser, setResetUser] = React.useState<UserDto | null>(null)
  const [newPassword, setNewPassword] = React.useState("")

  const resetPassword = useResetPassword()

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const queryParams = React.useMemo(
    () => ({
      searchTerm: debouncedSearch || undefined,
      pageSize: 100,
    }),
    [debouncedSearch],
  )

  const { data, isLoading, isFetching, isError, refetch } = useUsers(queryParams)
  const users = React.useMemo(() => data?.items ?? [], [data])

  const handleResetPassword = async () => {
    if (!resetUser || !newPassword.trim()) return
    await resetPassword.mutateAsync({ id: resetUser.id, newPassword: newPassword.trim() })
    setResetUser(null)
    setNewPassword("")
  }

  const columns: ColumnDef<UserDto>[] = [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
            {row.original.username.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-semibold text-sm">{row.original.username}</span>
        </div>
      ),
    },
    {
      accessorKey: "staffName",
      header: "Staff Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium">{row.original.staffName}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="secondary" className="gap-1">
          <Shield className="size-3" />
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={[
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
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
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.lastLoginAt ? formatDateTime(row.original.lastLoginAt) : "Never"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          {canEditUser && (
            <Button variant="ghost" size="icon" className="size-8 hover:bg-primary/10" asChild>
              <Link
                to={`/settings/users/${row.original.id}/edit`}
                aria-label={`Edit ${row.original.username}`}
              >
                <Edit2 className="size-4 text-primary" />
              </Link>
            </Button>
          )}
          {canResetPassword && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-amber-100 dark:hover:bg-amber-900/20"
              onClick={() => {
                setResetUser(row.original)
                setNewPassword("")
              }}
              aria-label={`Reset password for ${row.original.username}`}
            >
              <KeyRound className="size-4 text-amber-600 dark:text-amber-400" />
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
        message="We encountered an issue loading user accounts."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage system user accounts, roles, and access permissions.
          </p>
        </div>
        {canCreateUser && (
          <Button
            onClick={() => navigate("/settings/users/new")}
            className="shadow-lg shadow-primary/20 bg-primary font-semibold"
          >
            <Plus className="mr-2 size-4" />
            New User
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-muted bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by username or staff name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9 h-10 transition-shadow focus:shadow-md border-muted focus-visible:ring-primary/20"
          />
        </div>
        {isFetching && !isLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>
        )}
      </div>

      <div className="rounded-xl border border-muted bg-card shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          tableId="users-table"
        />
      </div>

      <Dialog open={Boolean(resetUser)} onOpenChange={(open) => !open && setResetUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{resetUser?.username}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-10"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUser(null)} disabled={resetPassword.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPassword.isPending || !newPassword.trim()}
            >
              {resetPassword.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}
