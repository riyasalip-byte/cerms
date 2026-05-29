import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Camera, KeyRound, Loader2, Save, UserRound } from "lucide-react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorState } from "@/components/shared/ErrorState"
import { useChangePassword, useMyProfile, useUpdateProfile } from "@/hooks/useProfile"

const profileSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters."),
  email: z.string().trim().email("Invalid email address."),
  displayName: z.string().trim().min(1, "Display name is required."),
  mobileNo: z.string().trim().min(1, "Mobile number is required."),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export function MyProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      username: "",
      email: "",
      displayName: "",
      mobileNo: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema) as any,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  React.useEffect(() => {
    if (!profile) return

    profileForm.reset({
      username: profile.username,
      email: profile.email,
      displayName: profile.displayName,
      mobileNo: profile.mobileNo,
    })
  }, [profile, profileForm])

  async function onProfileSubmit(values: ProfileFormValues) {
    await updateProfile.mutateAsync({
      username: values.username.trim(),
      email: values.email.trim(),
      displayName: values.displayName.trim(),
      mobileNo: values.mobileNo.trim(),
      photoUrl: profile?.photoUrl ?? null,
    })
  }

  async function onPasswordSubmit(values: PasswordFormValues) {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
    passwordForm.reset()
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <ErrorState
        onRetry={refetch}
        message="We encountered an issue loading your profile."
      />
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="border-b pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings, password, and profile photo.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant="secondary">{profile.staffCode}</Badge>
          <Badge variant="outline">{profile.role}</Badge>
          <span className="text-xs text-muted-foreground">
            {profile.designation} · {profile.department}
          </span>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="profile" className="gap-1.5">
            <UserRound className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-1.5">
            <KeyRound className="size-4" />
            Change Password
          </TabsTrigger>
          <TabsTrigger value="photo" className="gap-1.5">
            <Camera className="size-4" />
            Photo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>Update your display name and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit as any)}
                  className="grid gap-6 sm:grid-cols-2"
                >
                  <FormField
                    control={profileForm.control as any}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Username</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control as any}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control as any}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control as any}
                    name="mobileNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Mobile No</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="sm:col-span-2 flex justify-end pt-2">
                    <Button type="submit" disabled={updateProfile.isPending} className="font-bold">
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 size-4" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>Update your login password.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit as any)}
                  className="grid gap-6 max-w-md"
                >
                  <FormField
                    control={passwordForm.control as any}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control as any}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control as any}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={changePassword.isPending} className="font-bold w-fit">
                    {changePassword.isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <KeyRound className="mr-2 size-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photo">
          <Card className="shadow-sm border-muted border-dashed">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <CardTitle className="text-lg">Profile Photo</CardTitle>
              <CardDescription>Photo upload will be available in a future release.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex size-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-muted">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={profile.displayName}
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <UserRound className="size-10 text-muted-foreground" />
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium">{profile.displayName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a profile photo to personalize your account.
                  </p>
                  <Button variant="outline" disabled className="mt-3">
                    <Camera className="mr-2 size-4" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
