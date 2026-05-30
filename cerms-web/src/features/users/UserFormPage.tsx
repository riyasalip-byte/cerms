import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, Shield, UserPlus } from "lucide-react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStaffWithoutUser } from "@/hooks/useStaff"
import { useCreateUser, useRoles, useUpdateUser, useUser } from "@/hooks/useUsers"

const createUserSchema = z.object({
  staffId: z.string().min(1, "Staff member is required."),
  username: z.string().trim().min(3, "Username must be at least 3 characters."),
  email: z.string().trim().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  roleId: z.string().min(1, "Role is required."),
  isActive: z.enum(["true", "false"]),
})

const updateUserSchema = z.object({
  staffId: z.string().optional(),
  username: z.string().trim().min(3, "Username must be at least 3 characters."),
  email: z.string().trim().email("Invalid email address."),
  password: z.string().optional(),
  roleId: z.string().min(1, "Role is required."),
  isActive: z.enum(["true", "false"]),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>
type UpdateUserFormValues = z.infer<typeof updateUserSchema>
type UserFormValues = CreateUserFormValues | UpdateUserFormValues

const defaultValues: CreateUserFormValues = {
  staffId: "",
  username: "",
  email: "",
  password: "",
  roleId: "",
  isActive: "true",
}

export function UserFormPage() {
  const navigate = useNavigate()
  const { id: userId = "" } = useParams()
  const isEditMode = Boolean(userId)

  const { data: existingUser, isLoading: isUserLoading } = useUser(userId)
  const { data: staffWithoutUser = [] } = useStaffWithoutUser()
  const { data: roles = [] } = useRoles()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema) as any,
    defaultValues,
    mode: "onChange",
  })

  React.useEffect(() => {
    if (!existingUser) return

    form.reset({
      staffId: existingUser.staffId,
      username: existingUser.username,
      email: existingUser.email,
      password: "",
      roleId: existingUser.roleId,
      isActive: existingUser.isActive ? "true" : "false",
    })
  }, [existingUser, form])

  const isSaving = createUser.isPending || updateUser.isPending

  async function onSubmit(values: UserFormValues) {
    if (isEditMode) {
      await updateUser.mutateAsync({
        id: userId,
        data: {
          id: userId,
          username: values.username.trim(),
          email: values.email.trim(),
          roleId: values.roleId,
          isActive: values.isActive === "true",
        },
      })
    } else {
      const createValues = values as CreateUserFormValues
      await createUser.mutateAsync({
        staffId: createValues.staffId,
        username: createValues.username.trim(),
        email: createValues.email.trim(),
        password: createValues.password,
        roleId: createValues.roleId,
      })
    }

    navigate("/settings/users", { replace: true })
  }

  if (isEditMode && isUserLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            {isEditMode ? "Edit User" : "New User"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditMode
              ? `Update account settings for ${existingUser?.username ?? "user"}.`
              : "Create a system login for a staff member without an existing account."}
          </p>
        </div>
        <Button variant="outline" asChild className="font-semibold">
          <Link to="/settings/users">Back to Users</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="size-5" />
                <CardTitle className="text-lg">Account Details</CardTitle>
              </div>
              <CardDescription>Link a staff member and configure login credentials.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
              {!isEditMode ? (
                <FormField
                  control={form.control as any}
                  name="staffId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Staff Member</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select staff without user account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {staffWithoutUser.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.displayName} ({staff.staffCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {staffWithoutUser.length === 0 && (
                        <FormDescription className="text-amber-600">
                          No staff members available without a user account.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormItem>
                  <FormLabel className="font-bold text-muted-foreground">Linked Staff</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      value={existingUser?.staffName ?? ""}
                      className="h-10 bg-slate-50 dark:bg-slate-900/50"
                    />
                  </FormControl>
                </FormItem>
              )}

              <FormField
                control={form.control as any}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditMode && (
                <FormField
                  control={form.control as any}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Minimum 6 characters" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control as any}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles
                          .filter((role) => role.isActive !== false || (isEditMode && role.id === existingUser?.roleId))
                          .map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                              {role.description && (
                                <span className="text-muted-foreground"> — {role.description}</span>
                              )}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditMode && (
                <FormField
                  control={form.control as any}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Account Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/settings/users")}
              disabled={isSaving}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="font-bold bg-primary shadow-md">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {isEditMode ? <Save className="mr-2 size-4" /> : <UserPlus className="mr-2 size-4" />}
                  {isEditMode ? "Save Changes" : "Create User"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
