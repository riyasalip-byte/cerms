import { useParams, Link } from "react-router-dom"
import { useRoleDetails } from "@/hooks/useRoleManagement"
import { usePermission } from "@/hooks/usePermission"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Edit3,
  Shield,
  Key,
  CheckCircle,
  AlertTriangle,
  FileCheck
} from "lucide-react"

export function RoleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: role, isLoading, error } = useRoleDetails(id || "")
  const { canEditRole } = usePermission()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
      </div>
    )
  }

  if (error || !role) {
    return (
      <div className="space-y-4 p-6 max-w-3xl mx-auto text-center">
        <div className="text-destructive font-bold text-lg">Error Loading Role Details</div>
        <p className="text-muted-foreground">The requested role could not be located in the database.</p>
        <Button asChild variant="outline">
          <Link to="/roles">Back to Roles List</Link>
        </Button>
      </div>
    )
  }

  // Group role permissions by Module
  const groupedPermissions = role.permissions?.reduce((groups, perm) => {
    const mod = perm.module || "General"
    if (!groups[mod]) {
      groups[mod] = []
    }
    groups[mod].push(perm)
    return groups
  }, {} as Record<string, typeof role.permissions>) || {}

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-slate-100">
            <Link to="/roles">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {role.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Role overview and access control mappings.
            </p>
          </div>
        </div>

        {canEditRole && (
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 text-white font-bold transition-all duration-200">
            <Link to={`/roles/${role.id}/edit`} className="flex items-center gap-2">
              <Edit3 className="size-4" />
              Edit Role Settings
            </Link>
          </Button>
        )}
      </div>

      {/* Grid containing Overview and summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Role Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold">Role Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Description</span>
                <p className="text-sm mt-1 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {role.description || <span className="italic text-slate-400">No description provided</span>}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Status</span>
                <div className="mt-1.5">
                  <Badge className={role.isActive ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-none" : "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-none"}>
                    {role.isActive ? "Active State" : "Inactive State"}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Identity Classification</span>
                <div className="mt-1.5">
                  <Badge variant="outline" className={role.isSystemRole ? "border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400" : "border-slate-200 text-slate-500"}>
                    {role.isSystemRole ? "System Reserved Identity" : "Custom Configuration"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {role.isSystemRole && (
            <Card className="border-none shadow-xl bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-950/10 dark:to-transparent border-l-4 border-amber-500">
              <CardContent className="p-4 flex gap-3 text-amber-800 dark:text-amber-300 text-xs leading-relaxed font-medium">
                <AlertTriangle className="size-5 shrink-0 text-amber-600" />
                <div>
                  System Roles are integrated with initial data structures and are safeguarded from modification of their name identifiers.
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Permissions View */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="size-5 text-emerald-500" />
                <div>
                  <CardTitle className="text-lg font-bold">Assigned Permissions</CardTitle>
                  <CardDescription>
                    This role has been granted {role.permissions?.length || 0} permissions.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No active permissions are assigned to this role.
                </div>
              ) : (
                Object.keys(groupedPermissions).map((moduleName) => {
                  const perms = groupedPermissions[moduleName] || []
                  return (
                    <div key={moduleName} className="space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                        <FileCheck className="size-4 text-emerald-600" />
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 capitalize">
                          {moduleName} Module
                        </h3>
                        <Badge variant="secondary" className="text-[10px] py-0 px-2 font-bold bg-slate-100 dark:bg-slate-800 rounded-full">
                          {perms.length} Granted
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {perms.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-900"
                          >
                            <CheckCircle className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                            <div className="space-y-0.5">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">{perm.permissionName}</span>
                              <span className="text-[10px] text-muted-foreground block leading-relaxed">{perm.description || perm.permissionCode}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
