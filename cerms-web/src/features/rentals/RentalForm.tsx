import * as React from "react"
import { useRental, useCreateRental, useUpdateRentalStatus } from "@/hooks/useRentals"
import { useAssets } from "@/hooks/useAssets"
import { useCustomers } from "@/hooks/useCustomers"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, Calendar as CalendarIcon, Key, User, DollarSign } from "lucide-react"

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
import { cn } from "@/lib/utils"

const rentalFormSchema = z.object({
  assetId: z.string().min(1, "Asset is required."),
  customerId: z.string().min(1, "Customer is required."),
  startDate: z.string().min(1, "Start date is required."),
  expectedEndDate: z.string().min(1, "End date is required."),
  rentalRate: z.coerce.number().min(0),
  rateType: z.coerce.number(),
  status: z.coerce.number(),
})

type RentalFormValues = z.infer<typeof rentalFormSchema>

export function RentalForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const { data: rentalData, isLoading: isRentalLoading } = useRental(id!)
  const { data: assetsData } = useAssets({ pageSize: 100 })
  const { data: customersData } = useCustomers({ pageSize: 100 })
  
  const createRental = useCreateRental()
  const updateStatus = useUpdateRentalStatus()

  const form = useForm<RentalFormValues>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: {
      assetId: "",
      customerId: "",
      startDate: "",
      expectedEndDate: "",
      rentalRate: 0,
      rateType: 0,
      status: 0,
    },
  })

  React.useEffect(() => {
    if (rentalData) {
      form.reset({
        assetId: rentalData.assetId,
        customerId: rentalData.customerId,
        startDate: rentalData.startDate.split("T")[0],
        expectedEndDate: rentalData.expectedEndDate.split("T")[0],
        rentalRate: rentalData.rentalRate,
        rateType: rentalData.rateType,
        status: rentalData.status,
      })
    }
  }, [rentalData, form])

  async function onSubmit(data: RentalFormValues) {
    if (isEditMode) {
      await updateStatus.mutateAsync({ id: id!, status: data.status })
    } else {
      await createRental.mutateAsync(data)
    }
    navigate("/rentals")
  }

  if (isEditMode && isRentalLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative pb-24 md:pb-0">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Manage Rental" : "New Rental"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update agreement terms and status." : "Start a new equipment rental agreement."}
          </p>
        </div>
        <Button variant="ghost" className="hidden md:flex" asChild>
          <Link to="/rentals">Cancel</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Key className="size-5 text-primary" />
                Agreement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment <span className="text-destructive">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select an asset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assetsData?.items.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id} disabled={asset.status !== 0}>
                            {asset.name} ({asset.assetCode}) {asset.status !== 0 ? "- Unavailable" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer <span className="text-destructive">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customersData?.items.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        disabled={isEditMode} 
                        className="h-12 text-base"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected End Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        disabled={isEditMode} 
                        className="h-12 text-base"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rentalRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rental Rate <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3.5 size-5 text-muted-foreground" />
                        <Input 
                          type="number" 
                          disabled={isEditMode} 
                          className="h-12 pl-10 text-base"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Cycle <span className="text-destructive">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value.toString()}
                      disabled={isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Hourly</SelectItem>
                        <SelectItem value="1">Daily</SelectItem>
                        <SelectItem value="2">Weekly</SelectItem>
                        <SelectItem value="3">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditMode && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Current Status <span className="text-destructive">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="h-14 text-lg font-semibold border-primary/50 bg-primary/5">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Draft</SelectItem>
                          <SelectItem value="1">Confirmed</SelectItem>
                          <SelectItem value="2">Active / In Field</SelectItem>
                          <SelectItem value="3">Closed / Returned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Changing status may trigger billing or asset state updates.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Sticky Bottom Bar for Mobile */}
          <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/80 p-4 backdrop-blur md:static md:bg-transparent md:p-0">
            <div className="mx-auto max-w-lg md:max-w-none">
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold shadow-lg md:w-auto md:px-12"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 size-5 animate-spin" />
                ) : (
                  <Save className="mr-2 size-5" />
                )}
                {isEditMode ? "Update Rental" : "Confirm Agreement"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
