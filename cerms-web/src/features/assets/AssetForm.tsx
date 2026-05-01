import * as React from "react"
import { useAsset, useCreateAsset, useUpdateAsset } from "@/hooks/useAssets"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save } from "lucide-react"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const assetFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  assetType: z.string().min(1, "Asset type is required."),
  assetCode: z.string().min(1, "Asset code is required."),
  currentOdometer: z.coerce.number().min(0, "Odometer cannot be negative."),
  status: z.coerce.number(),
  purchaseDate: z.string().optional(),
})

type AssetFormValues = z.infer<typeof assetFormSchema>

export function AssetForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [pendingData, setPendingData] = React.useState<AssetFormValues | null>(null)

  const { data: existingAsset, isLoading } = useAsset(id!)
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      assetType: "",
      assetCode: "",
      currentOdometer: 0,
      status: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
    },
  })

  // Warn before leaving if form is dirty
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [form.formState.isDirty])

  React.useEffect(() => {
    if (existingAsset) {
      form.reset({
        name: existingAsset.name,
        assetType: existingAsset.assetType,
        assetCode: existingAsset.assetCode,
        currentOdometer: existingAsset.currentOdometer,
        status: existingAsset.status,
        purchaseDate: existingAsset.purchaseDate ? new Date(existingAsset.purchaseDate).toISOString().split('T')[0] : "",
      })
    }
  }, [existingAsset, form])

  async function onSubmit(data: AssetFormValues) {
    setPendingData(data)
    setShowConfirm(true)
  }

  async function handleConfirmSubmit() {
    if (!pendingData) return
    
    setShowConfirm(false)
    if (isEditMode) {
      await updateAsset.mutateAsync({
        id: id!,
        data: {
          id: id!,
          name: pendingData.name,
          assetType: pendingData.assetType,
          status: pendingData.status,
          currentOdometer: pendingData.currentOdometer,
        },
      })
    } else {
      await createAsset.mutateAsync({
        name: pendingData.name,
        assetType: pendingData.assetType,
        assetCode: pendingData.assetCode,
        currentOdometer: pendingData.currentOdometer,
        purchaseDate: pendingData.purchaseDate ? new Date(pendingData.purchaseDate).toISOString() : undefined,
      })
    }
    // Manually reset dirty state before navigating
    form.reset(pendingData)
    navigate("/assets")
  }

  if (isEditMode && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Asset" : "New Asset"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update asset details and operational status."
              : "Register a new piece of equipment in the system."}
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/assets">Back to List</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>Asset Information</CardTitle>
              <CardDescription>
                Basic identification and technical details of the equipment.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Caterpillar Excavator 320" 
                        autoFocus
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The common name used to identify this asset.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Code <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. CAT-EX-001" 
                        disabled={isEditMode}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for tracking and inventory.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Category <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Excavators, Generators" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentOdometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Odometer / Hours <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used for maintenance scheduling and billing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isEditMode} {...field} />
                    </FormControl>
                    <FormDescription>
                      Date when the asset was acquired.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditMode && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operational Status <span className="text-destructive">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Available</SelectItem>
                          <SelectItem value="1">Rented</SelectItem>
                          <SelectItem value="2">Maintenance</SelectItem>
                          <SelectItem value="3">Decommissioned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/assets")}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  {isEditMode ? "Update Asset" : "Create Asset"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {isEditMode ? "update this asset's details" : "create this new asset"}? 
              This action will update the system records immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Form</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Yes, Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
