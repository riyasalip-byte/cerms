import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import {
  useRoleDetails,
  usePermissionsList,
  useCreateRole,
  useUpdateRole,
  useAssignPermissions
} from "@/hooks/useRoleManagement"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Save,
  Shield,
  ShieldAlert,
  CheckSquare,
  Square,
  Sparkles
} from "lucide-react"

export function RoleFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  // API Hooks
  const { data: roleDetails, isLoading: isRoleLoading } = useRoleDetails(id || "")
  const { data: allPermissions, isLoading: isPermsLoading } = usePermissionsList()
  const createRoleMutation = useCreateRole()
  const updateRoleMutation = useUpdateRole()
  const assignPermsMutation = useAssignPermissions()

  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isSystemRole, setIsSystemRole] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({})
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  // Populate data in edit mode
  useEffect(() => {
    if (isEdit && roleDetails) {
      setName(roleDetails.name)
      setDescription(roleDetails.description || "")
      setIsActive(roleDetails.isActive)
      setIsSystemRole(roleDetails.isSystemRole)

      // Map assigned permission IDs
      const mappedPerms: Record<string, boolean> = {}
      roleDetails.permissions.forEach((p) => {
        mappedPerms[p.id] = true
      })
      setSelectedPermissions(mappedPerms)
    }
  }, [isEdit, roleDetails])

  // Group permissions by Module
  const groupedPermissions = allPermissions?.reduce((groups, perm) => {
    const mod = perm.module || "General"
    if (!groups[mod]) {
      groups[mod] = []
    }
    groups[mod].push(perm)
    return groups
  }, {} as Record<string, typeof allPermissions>) || {}

  // Automatically expand all modules on load
  useEffect(() => {
    if (allPermissions) {
      const initialExpanded: Record<string, boolean> = {}
      allPermissions.forEach((p) => {
        initialExpanded[p.module] = true
      })
      setExpandedModules(initialExpanded)
    }
  }, [allPermissions])

  const toggleModule = (module: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }))
  }

  const handlePermissionChange = (permId: string, checked: boolean) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [permId]: checked,
    }))
  }

  const handleSelectAllGlobal = () => {
    if (!allPermissions) return
    const updated: Record<string, boolean> = {}
    allPermissions.forEach((p) => {
      updated[p.id] = true
    })
    setSelectedPermissions(updated)
  }

  const handleDeselectAllGlobal = () => {
    setSelectedPermissions({})
  }

  const handleSelectModule = (moduleName: string, select: boolean) => {
    const modulePerms = groupedPermissions[moduleName] || []
    setSelectedPermissions((prev) => {
      const updated = { ...prev }
      modulePerms.forEach((p) => {
        if (select) {
          updated[p.id] = true
        } else {
          delete updated[p.id]
        }
      })
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const selectedIds = Object.keys(selectedPermissions).filter((id) => selectedPermissions[id])

    try {
      if (isEdit && id) {
        // 1. Update Role
        await updateRoleMutation.mutateAsync({
          id,
          name: name.trim(),
          description: description.trim(),
          isActive
        })
        // 2. Assign permissions
        await assignPermsMutation.mutateAsync({
          roleId: id,
          permissionIds: selectedIds
        })
      } else {
        // 1. Create Role
        const newRoleId = await createRoleMutation.mutateAsync({
          name: name.trim(),
          description: description.trim(),
          isActive
        })
        // 2. Assign permissions
        await assignPermsMutation.mutateAsync({
          roleId: newRoleId,
          permissionIds: selectedIds
        })
      }
      navigate("/roles")
    } catch (err) {
      console.error("Submission failed", err)
    }
  }

  const isLoading = isRoleLoading || isPermsLoading
  const isSaving = createRoleMutation.isPending || updateRoleMutation.isPending || assignPermsMutation.isPending

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-slate-100">
          <Link to="/roles">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            {isEdit ? "Edit Role" : "Create Security Role"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit
              ? "Modify role attributes and fine-tune security permissions mapping."
              : "Define a custom security role and associate access control permissions."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Role Information Card */}
        <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-emerald-500" />
              <CardTitle className="text-xl font-bold">Role Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {isSystemRole && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 text-sm text-amber-800 dark:text-amber-300">
                <ShieldAlert className="size-5 shrink-0 text-amber-600" />
                <div>
                  <span className="font-bold">System Reserved Role: </span>
                  Editing permissions is allowed, but core system identities (Admin, Operator) are protected by database validation.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleName" className="font-bold">Role Name</Label>
                <Input
                  id="roleName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSystemRole}
                  placeholder="e.g. Workshop Technician"
                  required
                  className="h-11 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-6 h-full pt-8 pl-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(!!checked)}
                    disabled={isSystemRole && name === "Admin"}
                    className="data-[state=checked]:bg-emerald-600 border-slate-300"
                  />
                  <Label htmlFor="isActive" className="font-semibold cursor-pointer">Active State</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a description explaining what responsibilities this role holds..."
                rows={3}
                className="focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions Accordion Card */}
        <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-emerald-500" />
                <div>
                  <CardTitle className="text-xl font-bold">Permissions Mapping</CardTitle>
                  <CardDescription>Grant precise functional codes by expanding each application module.</CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllGlobal}
                  className="flex items-center gap-1 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <CheckSquare className="size-3.5" />
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAllGlobal}
                  className="flex items-center gap-1 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Square className="size-3.5" />
                  Deselect All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {Object.keys(groupedPermissions).map((moduleName) => {
              const isExpanded = !!expandedModules[moduleName]
              const modulePerms = groupedPermissions[moduleName] || []
              const selectedInModule = modulePerms.filter((p) => selectedPermissions[p.id])
              const allSelected = selectedInModule.length === modulePerms.length
              const someSelected = selectedInModule.length > 0 && !allSelected

              return (
                <div key={moduleName} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white/40 dark:bg-slate-950/20 backdrop-blur-sm">
                  {/* Accordion Header */}
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => toggleModule(moduleName)}
                      className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200 text-left hover:text-emerald-600 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-emerald-500" />
                      ) : (
                        <ChevronDown className="size-4 text-emerald-500" />
                      )}
                      <span className="capitalize">{moduleName} Module</span>
                      <span className="text-xs bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                        {selectedInModule.length} of {modulePerms.length} active
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleSelectModule(moduleName, !allSelected)}
                        className="text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700 px-2 py-1 h-auto"
                      >
                        {allSelected ? "Clear All" : "Select Module"}
                      </Button>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white/10 dark:bg-transparent">
                      {modulePerms.map((perm) => (
                        <div
                          key={perm.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                            selectedPermissions[perm.id]
                              ? "bg-emerald-50/20 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900"
                              : "border-slate-100 hover:border-slate-200 bg-white/20 dark:border-slate-900 dark:hover:border-slate-800"
                          }`}
                        >
                          <Checkbox
                            id={perm.id}
                            checked={!!selectedPermissions[perm.id]}
                            onCheckedChange={(checked) => handlePermissionChange(perm.id, !!checked)}
                            className="mt-0.5 data-[state=checked]:bg-emerald-600 border-slate-300"
                          />
                          <div className="space-y-0.5 cursor-pointer" onClick={() => handlePermissionChange(perm.id, !selectedPermissions[perm.id])}>
                            <Label htmlFor={perm.id} className="font-bold block cursor-pointer">{perm.permissionName}</Label>
                            <span className="text-xs text-muted-foreground block leading-relaxed">{perm.description || perm.permissionCode}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button asChild variant="outline" className="h-11 px-6 shadow-sm">
            <Link to="/roles">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-white font-bold transition-all hover:scale-[1.01]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving Security Settings...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="size-4" />
                {isEdit ? "Update Role" : "Create Security Role"}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
