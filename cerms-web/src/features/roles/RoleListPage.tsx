import { Link } from "react-router-dom"
import { useRolesList } from "@/hooks/useRoleManagement"
import { usePermission } from "@/hooks/usePermission"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit3, Shield, Key } from "lucide-react"

export function RoleListPage() {
  const { data: roles, isLoading, error } = useRolesList()
  const { canCreateRole, canEditRole } = usePermission()

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Role Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure dynamic security roles and map fine-grained access control permissions.
          </p>
        </div>
        
        {canCreateRole && (
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-white font-bold transition-all duration-200 hover:scale-[1.02]">
            <Link to="/roles/new" className="flex items-center gap-2">
              <Plus className="size-4" />
              Create Role
            </Link>
          </Button>
        )}
      </div>

      <Card className="border-none shadow-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Key className="size-5 text-emerald-500" />
            <div>
              <CardTitle className="text-xl font-bold">System Roles</CardTitle>
              <CardDescription>
                System roles are built-in and protected, while custom roles can be defined to suit your branch or department requirements.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              Failed to load roles. Please try again later.
            </div>
          ) : roles && roles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No roles configured in the database.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Role Name</TableHead>
                  <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Description</TableHead>
                  <TableHead className="font-semibold text-slate-800 dark:text-slate-200 text-center">Status</TableHead>
                  <TableHead className="font-semibold text-slate-800 dark:text-slate-200 text-center">System Role</TableHead>
                  <TableHead className="font-semibold text-slate-800 dark:text-slate-200 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles?.map((role) => (
                  <TableRow key={role.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100 pl-6">
                      <div className="flex items-center gap-2">
                        {role.name}
                        {role.isSystemRole && (
                          <span title="System Reserved Role">
                            <Shield className="size-3.5 text-blue-500" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {role.description || <span className="italic text-slate-400">No description</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={role.isActive ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-none" : "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-none"}>
                        {role.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={role.isSystemRole ? "border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400" : "border-slate-200 text-slate-500"}>
                        {role.isSystemRole ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 space-x-2">
                      <Button asChild variant="ghost" size="sm" className="hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700">
                        <Link to={`/roles/${role.id}`} className="flex items-center gap-1.5">
                          <Eye className="size-3.5" />
                          View
                        </Link>
                      </Button>
                      {canEditRole && (
                        <Button asChild variant="ghost" size="sm" className="hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-700">
                          <Link to={`/roles/${role.id}/edit`} className="flex items-center gap-1.5">
                            <Edit3 className="size-3.5" />
                            Edit
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
