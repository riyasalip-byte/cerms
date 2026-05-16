import * as React from "react"
import { useRental, useCreateRental } from "@/hooks/useRentals"
import { useAssets } from "@/hooks/useAssets"
import { useCustomers } from "@/hooks/useCustomers"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, Key, DollarSign } from "lucide-react"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const optionalNumber = z.union([
  z.literal("").transform(() => undefined),
  z.literal("null").transform(() => undefined),
  z.number(),
  z.string().trim().regex(/^-?\d+(\.\d+)?$/, "Enter a valid number.").transform(Number),
]).optional()

const rentalFormSchema = z.object({
  assetId: z.string().min(1, "Asset is required."),
  customerId: z.string().min(1, "Customer is required."),
  startDateTime: z.string().min(1, "Start date is required."),
  expectedEndDateTime: z.string().min(1, "End date is required."),
  rateAmount: optionalNumber,
  rateType: optionalNumber,
}).refine(
  (data) => !data.startDateTime || !data.expectedEndDateTime || data.expectedEndDateTime >= data.startDateTime,
  {
    message: "End date should be greater than or equal to start date.",
    path: ["expectedEndDateTime"],
  }
)

type RentalFormInput = z.input<typeof rentalFormSchema>
type RentalFormValues = z.output<typeof rentalFormSchema>

export function RentalForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const { data: rentalData, isLoading: isRentalLoading } = useRental(id!)
  const { data: assetsData } = useAssets({ pageSize: 100 })
  const { data: customersData } = useCustomers({ pageSize: 100 })
  
  const createRental = useCreateRental()

  const form = useForm<RentalFormInput, undefined, RentalFormValues>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: {
      assetId: "",
      customerId: "",
      startDateTime: "",
      expectedEndDateTime: "",
      rateAmount: "",
      rateType: "",
    },
  })
  const startDateTime = form.watch("startDateTime")

  React.useEffect(() => {
    if (rentalData) {
      form.reset({
        assetId: rentalData.assetId,
        customerId: rentalData.customerId,
        startDateTime: rentalData.startDateTime?.split("T")[0] || "",
        expectedEndDateTime: rentalData.expectedEndDateTime?.split("T")[0] || "",
        rateAmount: rentalData.rateAmount ?? "",
        rateType: rentalData.rateType ?? "",
      })
    }
  }, [rentalData, form])

  async function onSubmit(data: RentalFormValues) {
    if (isEditMode) {
      console.warn("Edit mode submit not implemented for base details.")
    } else {
      const payload = {
        ...data,
        startDateTime: new Date(data.startDateTime).toISOString(),
        expectedEndDateTime: new Date(data.expectedEndDateTime).toISOString()
      }
      await createRental.mutateAsync(payload)
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
            {isEditMode ? "View Rental" : "New Rental"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Rental agreement details." : "Start a new equipment rental agreement."}
          </p>
        </div>
        <Button variant="ghost" className="hidden md:flex" asChild>
          <Link to="/rentals">Cancel</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden bg-card/60 backdrop-blur-sm">
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
                            {asset.assetName} ({asset.assetCode}) {asset.status !== 0 ? "- Unavailable" : ""}
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
                name="startDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        disabled={isEditMode} 
                        className="h-12 text-base"
                        {...field}
                        onChange={(event) => {
                          field.onChange(event)
                          if (form.getValues("expectedEndDateTime")) {
                            form.trigger("expectedEndDateTime")
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedEndDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected End Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        min={startDateTime || undefined}
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
                name="rateAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Rental Rate <span className="text-muted-foreground font-normal">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3.5 size-5 text-muted-foreground" />
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01"
                          disabled={isEditMode} 
                          className="h-12 pl-10 text-base"
                          placeholder="Leave blank if rate is not final"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      You can calculate or update rate when closing rental.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Rate Cycle <span className="text-muted-foreground font-normal">(Optional)</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString() ?? "null"}
                      disabled={isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Choose when rate is known" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Not decided yet</SelectItem>
                        <SelectItem value="0">Hourly</SelectItem>
                        <SelectItem value="1">Daily</SelectItem>
                        <SelectItem value="2">Weekly</SelectItem>
                        <SelectItem value="3">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Leave blank if billing will be finalized at rental close.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sticky Bottom Bar for Mobile */}
          {!isEditMode && (
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
                  Create Rental Agreement
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
