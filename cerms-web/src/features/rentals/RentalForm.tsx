import * as React from "react"
import { useRental, useCreateRental, useUpdateRental } from "@/hooks/useRentals"
import { useAssets } from "@/hooks/useAssets"
import { useCustomers } from "@/hooks/useCustomers"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Loader2, 
  Save, 
  Key, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Truck, 
  Fuel, 
  FileText, 
  User, 
  Activity,
  ArrowLeft
} from "lucide-react"

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"

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
  siteName: z.string().min(1, "Site Name is required."),
  siteAddress: z.string().min(1, "Site Address is required."),
  siteLandmark: z.string().optional().nullable(),
  siteContactPerson: z.string().optional().nullable(),
  siteContactNumber: z.string().optional().nullable(),
  pickupTransportCharge: optionalNumber,
  returnTransportCharge: optionalNumber,
  transportNotes: z.string().optional().nullable(),
  advanceAmount: optionalNumber,
  securityDepositAmount: optionalNumber,
  fuelResponsibilityType: z.string().default("0"),
  internalRemarks: z.string().optional().nullable(),
}).refine(
  (data) => !data.startDateTime || !data.expectedEndDateTime || data.expectedEndDateTime >= data.startDateTime,
  {
    message: "End date should be greater than or equal to start date.",
    path: ["expectedEndDateTime"],
  }
)

type RentalFormInput = z.input<typeof rentalFormSchema>
type RentalFormValues = z.output<typeof rentalFormSchema>
function normalizeRateType(value: any): string {
  if (value === undefined || value === null) return "";
  const str = String(value).toLowerCase();
  if (str === "0" || str === "hourly") return "0";
  if (str === "1" || str === "daily") return "1";
  if (str === "2" || str === "weekly") return "2";
  if (str === "3" || str === "monthly") return "3";
  return "";
}

function normalizeFuelResponsibility(value: any): string {
  if (value === undefined || value === null) return "0";
  const str = String(value).toLowerCase();
  if (str === "0" || str === "customer") return "0";
  if (str === "1" || str === "company") return "1";
  if (str === "2" || str === "shared") return "2";
  return "0";
}

function isAssetAvailable(status: any): boolean {
  if (status === 0) return true;
  if (typeof status === "string") {
    return status.toLowerCase() === "available";
  }
  return false;
}

export function RentalForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const { data: rentalData, isLoading: isRentalLoading } = useRental(id!)
  const { data: assetsData } = useAssets({ pageSize: 100 })
  const { data: customersData } = useCustomers({ pageSize: 100 })
  
  const createRental = useCreateRental()
  const updateRental = useUpdateRental()

  const form = useForm<RentalFormInput, undefined, RentalFormValues>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: {
      assetId: "",
      customerId: "",
      startDateTime: "",
      expectedEndDateTime: "",
      rateAmount: "",
      rateType: "",
      siteName: "",
      siteAddress: "",
      siteLandmark: "",
      siteContactPerson: "",
      siteContactNumber: "",
      pickupTransportCharge: "",
      returnTransportCharge: "",
      transportNotes: "",
      advanceAmount: "",
      securityDepositAmount: "",
      fuelResponsibilityType: "0",
      internalRemarks: "",
    },
  })

  const startDateTime = form.watch("startDateTime")
  const watchedAssetId = form.watch("assetId")
  const pickupCharge = form.watch("pickupTransportCharge")
  const returnCharge = form.watch("returnTransportCharge")

  // Dynamic transport section display
  const selectedAsset = assetsData?.items.find(a => a.id === watchedAssetId)
  const isTransportRequired = selectedAsset?.isTransportationRequired ?? false

  // Live transport charge preview calculation
  const calculatedPickup = Number(pickupCharge || 0)
  const calculatedReturn = Number(returnCharge || 0)
  const totalTransportCharges = calculatedPickup + calculatedReturn

  React.useEffect(() => {
    if (rentalData) {
      form.reset({
        assetId: rentalData.assetId,
        customerId: rentalData.customerId,
        startDateTime: rentalData.startDateTime?.split("T")[0] || "",
        expectedEndDateTime: rentalData.expectedEndDateTime?.split("T")[0] || "",
        rateAmount: rentalData.rateAmount ?? "",
        rateType: normalizeRateType(rentalData.rateType),
        siteName: rentalData.siteName || "",
        siteAddress: rentalData.siteAddress || "",
        siteLandmark: rentalData.siteLandmark || "",
        siteContactPerson: rentalData.siteContactPerson || "",
        siteContactNumber: rentalData.siteContactNumber || "",
        pickupTransportCharge: rentalData.pickupTransportCharge ?? "",
        returnTransportCharge: rentalData.returnTransportCharge ?? "",
        transportNotes: rentalData.transportNotes || "",
        advanceAmount: rentalData.advanceAmount ?? "",
        securityDepositAmount: rentalData.securityDepositAmount ?? "",
        fuelResponsibilityType: normalizeFuelResponsibility(rentalData.fuelResponsibilityType),
        internalRemarks: "",
      })
    }
  }, [rentalData, form])

  async function onSubmit(data: RentalFormValues) {
    const payload = {
      ...data,
      startDateTime: new Date(data.startDateTime).toISOString(),
      expectedEndDateTime: new Date(data.expectedEndDateTime).toISOString(),
      fuelResponsibilityType: Number(data.fuelResponsibilityType),
      // Clean transport charges if not required
      pickupTransportCharge: isTransportRequired ? (data.pickupTransportCharge ?? null) : null,
      returnTransportCharge: isTransportRequired ? (data.returnTransportCharge ?? null) : null,
      transportNotes: isTransportRequired ? (data.transportNotes ?? null) : null,
    }

    if (isEditMode) {
      await updateRental.mutateAsync({ id: id!, data: payload })
    } else {
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

  const isEditable = !isEditMode || 
    rentalData?.status === 0 || 
    rentalData?.status === 1 || 
    String(rentalData?.status).toLowerCase() === "draft" || 
    String(rentalData?.status).toLowerCase() === "confirmed"

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/rentals">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {isEditMode ? `Edit Agreement: ${rentalData?.id.slice(0, 8)}` : "New Rental Agreement"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEditMode ? "Update heavy equipment lease details and site operations." : "Create a structured, heavy equipment deployment contract."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && <StatusBadge status={rentalData!.status} className="rental text-sm px-2.5" />}
          <Button variant="outline" asChild className="hidden md:flex">
            <Link to="/rentals">Cancel</Link>
          </Button>
        </div>
      </div>

      {!isEditable && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/10">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            Agreement Details cannot be modified once the rental booking has been dispatched or activated.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* SECTION 1 - AGREEMENT DETAILS */}
          <Card className="border-none shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
            <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                <Key className="size-5 text-emerald-600 dark:text-emerald-400" />
                Section 1 — Agreement Partners
              </CardTitle>
              <CardDescription>Select the active lease equipment and client profile.</CardDescription>
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
                      disabled={isEditMode || !isEditable}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select equipment asset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assetsData?.items.map((asset) => {
                          const available = isAssetAvailable(asset.status);
                          return (
                            <SelectItem key={asset.id} value={asset.id} disabled={!available && asset.id !== rentalData?.assetId}>
                              {asset.assetName} ({asset.assetCode}) {!available && asset.id !== rentalData?.assetId ? "- Unavailable" : ""}
                            </SelectItem>
                          );
                        })}
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
                      disabled={isEditMode || !isEditable}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select lessee profile" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customersData?.items.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.customerName} ({customer.customerCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SECTION 2 - SITE DETAILS */}
          <Card className="border-none shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
            <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                <MapPin className="size-5 text-emerald-600 dark:text-emerald-400" />
                Section 2 — Delivery & Site Details
              </CardTitle>
              <CardDescription>Coordinate operational tracking and shipping references.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Site Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Metro Line Extension - Phase 3" disabled={!isEditable} className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteAddress"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Site Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Plot 104, Industrial Area Road" disabled={!isEditable} className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteLandmark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Landmark</FormLabel>
                    <FormControl>
                      <Input placeholder="Opposite State Transit Yard" disabled={!isEditable} className="h-11" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteContactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Project Manager Name" disabled={!isEditable} className="h-11" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteContactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="98765xxxxx" disabled={!isEditable} className="h-11" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SECTION 3 - RENTAL PERIOD */}
          <Card className="border-none shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
            <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                <Calendar className="size-5 text-emerald-600 dark:text-emerald-400" />
                Section 3 — Rental Period
              </CardTitle>
              <CardDescription>Contractual start and expected handover timestamps.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        disabled={isEditMode || !isEditable} 
                        className="h-11 text-base"
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
                        disabled={isEditMode || !isEditable} 
                        className="h-11 text-base"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SECTION 4 - BILLING */}
          <Card className="border-none shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
            <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                <DollarSign className="size-5 text-emerald-600 dark:text-emerald-400" />
                Section 4 — Financial & Billing Terms
              </CardTitle>
              <CardDescription>Structure rate metrics, upfront collections, and security deposits.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="rateAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rental Rate ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 size-5 text-muted-foreground" />
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01"
                          disabled={!isEditable} 
                          className="h-11 pl-10 text-base"
                          placeholder="Rate amount"
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
                    <FormLabel>Rate Cycle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString() ?? "null"}
                      disabled={!isEditable}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select cycle terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Not Decided</SelectItem>
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

              <FormField
                control={form.control}
                name="advanceAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advance Payment ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 size-5 text-muted-foreground" />
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01"
                          disabled={!isEditable} 
                          className="h-11 pl-10 text-base"
                          placeholder="Upfront payment"
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
                name="securityDepositAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Deposit ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 size-5 text-muted-foreground" />
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01"
                          disabled={!isEditable} 
                          className="h-11 pl-10 text-base"
                          placeholder="Refundable deposit"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SECTION 5 - TRANSPORTATION */}
          {isTransportRequired && (
            <Card className="border-none shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-4">
              <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                  <Truck className="size-5 text-emerald-600 dark:text-emerald-400" />
                  Section 5 — Transportation Logistics
                </CardTitle>
                <CardDescription>Setup pickup/return shipping details for heavy equipment transport vehicles.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="pickupTransportCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Transport Charge ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 size-5 text-muted-foreground" />
                          <Input 
                            type="number" 
                            min="0"
                            step="0.01"
                            disabled={!isEditable} 
                            className="h-11 pl-10 text-base"
                            placeholder="Delivery cost"
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
                  name="returnTransportCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Transport Charge ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 size-5 text-muted-foreground" />
                          <Input 
                            type="number" 
                            min="0"
                            step="0.01"
                            disabled={!isEditable} 
                            className="h-11 pl-10 text-base"
                            placeholder="Return shipping cost"
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
                  name="transportNotes"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Transportation Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Flatbed details, wide load permissions, etc." disabled={!isEditable} className="h-11" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="sm:col-span-2 bg-emerald-50/70 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-950/30 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="size-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Auto-Calculated Transport Logistics Preview:</span>
                  </div>
                  <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
                    ${totalTransportCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTION 6 - FUEL RESPONSIBILITY */}
          <Card className="border-none shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
            <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                <Fuel className="size-5 text-emerald-600 dark:text-emerald-400" />
                Section 6 — Fuel Responsibility
              </CardTitle>
              <CardDescription>Establish fuel refill guidelines and pricing terms.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="fuelResponsibilityType"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel>Fuel Clause Terms <span className="text-destructive">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isEditable}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Establish fuel responsibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Customer (Refill on return)</SelectItem>
                        <SelectItem value="1">Company (Included in rate)</SelectItem>
                        <SelectItem value="2">Shared (Billed proportionally)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select terms designating fuel refueling guidelines.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SECTION 7 - REMARKS */}
          <Card className="border-none shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
            <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                <FileText className="size-5 text-emerald-600 dark:text-emerald-400" />
                Section 7 — Internal Remarks
              </CardTitle>
              <CardDescription>Log special operating directives or internal notes.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="internalRemarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Directives</FormLabel>
                    <FormControl>
                      <Input placeholder="Operator details, extra attachments requirements, VIP notes..." disabled={!isEditable} className="h-11" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Bottom actions */}
          {isEditable && (
            <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/80 p-4 backdrop-blur md:static md:bg-transparent md:p-0">
              <div className="mx-auto max-w-lg md:max-w-none flex justify-end gap-3">
                <Button variant="outline" type="button" asChild className="hidden md:flex h-12 px-6">
                  <Link to="/rentals">Cancel</Link>
                </Button>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-bold shadow-lg md:w-auto md:px-8"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 size-5 animate-spin" />
                  ) : (
                    <Save className="mr-2 size-5" />
                  )}
                  {isEditMode ? "Save Changes" : "Create Agreement"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
