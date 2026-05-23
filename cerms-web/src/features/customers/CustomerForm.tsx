import * as React from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, UserPlus, FileText, Phone, MapPin, Building2, CreditCard } from "lucide-react"

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
import { cn } from "@/lib/utils"
import {
  useCreateCustomer,
  useCustomer,
  useUpdateCustomer,
} from "@/hooks/useCustomers"

const customerFormSchema = z.object({
  customerType: z.enum(["0", "1"]),
  customerName: z.string().trim().min(1, "Customer Name is required.").max(200, "Name must not exceed 200 characters."),
  mobileNo: z.string().trim().min(1, "Mobile No is required.").max(50, "Mobile must not exceed 50 characters."),
  alternateMobileNo: z.string().trim().max(50, "Alternate mobile must not exceed 50 characters.").optional(),
  email: z.string().trim().max(200, "Email must not exceed 200 characters.")
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Invalid email address."
    }).optional(),
  whatsAppNo: z.string().trim().max(50, "WhatsApp number must not exceed 50 characters.").optional(),
  address: z.string().trim().max(500, "Address must not exceed 500 characters.").optional(),
  city: z.string().trim().max(100, "City must not exceed 100 characters.").optional(),
  state: z.string().trim().max(100, "State must not exceed 100 characters.").optional(),
  pincode: z.string().trim().max(20, "Pincode must not exceed 20 characters.").optional(),
  contactPersonName: z.string().trim().max(200, "Contact person name must not exceed 200 characters.").optional(),
  contactPersonMobileNo: z.string().trim().max(50, "Contact person mobile must not exceed 50 characters.").optional(),
  contactPersonAddress: z.string().trim().max(500, "Contact person address must not exceed 500 characters.").optional(),
  gstOrTaxNumber: z.string().trim().max(100, "GST/Tax number must not exceed 100 characters.").optional(),
  creditLimit: z.coerce.number().min(0, "Credit limit must be greater than or equal to 0."),
  notes: z.string().trim().max(1000, "Notes must not exceed 1000 characters.").optional(),
}).superRefine((data, ctx) => {
  if (data.customerType === "1") {
    if (!data.contactPersonName || data.contactPersonName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Contact person name is required for Company customers.",
        path: ["contactPersonName"]
      });
    }
    if (!data.contactPersonMobileNo || data.contactPersonMobileNo.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Contact person mobile is required for Company customers.",
        path: ["contactPersonMobileNo"]
      });
    }
  }
});

type CustomerFormValues = z.infer<typeof customerFormSchema>

const defaultValues: CustomerFormValues = {
  customerType: "0",
  customerName: "",
  mobileNo: "",
  alternateMobileNo: "",
  email: "",
  whatsAppNo: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  contactPersonName: "",
  contactPersonMobileNo: "",
  contactPersonAddress: "",
  gstOrTaxNumber: "",
  creditLimit: 0,
  notes: "",
}

export function CustomerForm() {
  const navigate = useNavigate()
  const { id: routeCustomerId } = useParams()
  const [searchParams] = useSearchParams()
  const queryCustomerId = searchParams.get("customerId")
  const customerId = routeCustomerId ?? queryCustomerId ?? ""
  const isEditMode = Boolean(customerId)

  const { data: existingCustomer, isLoading: isCustomerLoading } = useCustomer(customerId)
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema) as any,
    defaultValues,
    mode: "onChange",
  })

  const watchType = form.watch("customerType")

  React.useEffect(() => {
    if (!existingCustomer) return

    form.reset({
      customerType: String(existingCustomer.customerType) as "0" | "1",
      customerName: existingCustomer.customerName ?? "",
      mobileNo: existingCustomer.mobileNo ?? "",
      alternateMobileNo: existingCustomer.alternateMobileNo ?? "",
      email: existingCustomer.email ?? "",
      whatsAppNo: existingCustomer.whatsAppNo ?? "",
      address: existingCustomer.address ?? "",
      city: existingCustomer.city ?? "",
      state: existingCustomer.state ?? "",
      pincode: existingCustomer.pincode ?? "",
      contactPersonName: existingCustomer.contactPersonName ?? "",
      contactPersonMobileNo: existingCustomer.contactPersonMobileNo ?? "",
      contactPersonAddress: existingCustomer.contactPersonAddress ?? "",
      gstOrTaxNumber: existingCustomer.gstOrTaxNumber ?? "",
      creditLimit: existingCustomer.creditLimit ?? 0,
      notes: existingCustomer.notes ?? "",
    })
  }, [existingCustomer, form])

  const isSaving = createCustomer.isPending || updateCustomer.isPending

  async function onSubmit(values: CustomerFormValues) {
    const payload = {
      customerType: Number(values.customerType),
      customerName: values.customerName.trim(),
      mobileNo: values.mobileNo.trim(),
      alternateMobileNo: normalizeOptional(values.alternateMobileNo),
      email: normalizeOptional(values.email),
      whatsAppNo: normalizeOptional(values.whatsAppNo),
      address: normalizeOptional(values.address),
      city: normalizeOptional(values.city),
      state: normalizeOptional(values.state),
      pincode: normalizeOptional(values.pincode),
      contactPersonName: values.customerType === "1" ? normalizeOptional(values.contactPersonName) : null,
      contactPersonMobileNo: values.customerType === "1" ? normalizeOptional(values.contactPersonMobileNo) : null,
      contactPersonAddress: values.customerType === "1" ? normalizeOptional(values.contactPersonAddress) : null,
      gstOrTaxNumber: values.customerType === "1" ? normalizeOptional(values.gstOrTaxNumber) : null,
      creditLimit: values.creditLimit,
      notes: normalizeOptional(values.notes),
    }

    if (isEditMode) {
      await updateCustomer.mutateAsync({
        id: customerId,
        data: {
          id: customerId,
          ...payload,
          isActive: existingCustomer?.isActive ?? true,
        },
      })
    } else {
      await createCustomer.mutateAsync(payload)
    }

    navigate("/customers", { replace: true })
  }

  if (isEditMode && isCustomerLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            {isEditMode ? "Update Customer Profile" : "Create Customer Account"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditMode 
              ? `Refine credentials and corporate parameters for account ${existingCustomer?.customerCode}.`
              : "Register individual renters or company accounts, setting up rental eligibility and billing details."}
          </p>
        </div>
        <Button variant="outline" asChild className="font-semibold border-slate-200">
          <Link to="/customers">Back to Customers</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          
          {/* Section 1: Basic Info */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="size-5" />
                <CardTitle className="text-lg">Section 1: Basic Profile Information</CardTitle>
              </div>
              <CardDescription>Specify the customer classification and unique naming credentials.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-3">
              <FormField
                control={form.control as any}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Customer Type</FormLabel>
                    <Select 
                      disabled={isEditMode}
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 focus:ring-primary/20">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Individual</SelectItem>
                        <SelectItem value="1">Company / Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="font-bold text-muted-foreground">Customer Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Auto-generated (CUST-0001)" 
                    disabled 
                    value={existingCustomer?.customerCode ?? "CUST-XXXX (Auto)"} 
                    className="bg-slate-50 dark:bg-slate-900/50 font-mono font-bold"
                  />
                </FormControl>
                <FormDescription className="text-[10px]">Read-only unique reference.</FormDescription>
              </FormItem>

              <FormField
                control={form.control as any}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Customer / Entity Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe or Acme Corp" autoFocus {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 2: Contact Info */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Phone className="size-5" />
                <CardTitle className="text-lg">Section 2: Contact Details</CardTitle>
              </div>
              <CardDescription>Primary channels for rental notifications, scheduling, and billing invoices.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control as any}
                name="mobileNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="alternateMobileNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Alternate Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="Backup phone" {...field} className="h-10" />
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
                    <FormLabel className="font-bold">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="billing@example.com" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="whatsAppNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input placeholder="WhatsApp alerts" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control as any}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 lg:col-span-4">
                    <FormLabel className="font-bold">Street Address</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Suite, building number, street details..."
                        className={cn(
                          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
                          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          "disabled:cursor-not-allowed disabled:opacity-50 border-muted"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 3: Location details */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="size-5" />
                <CardTitle className="text-lg">Section 3: Location Details</CardTitle>
              </div>
              <CardDescription>Primary region coordinates for equipment dispatch.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-3">
              <FormField
                control={form.control as any}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">City</FormLabel>
                    <FormControl>
                      <Input placeholder="City Name" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Pincode / Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Pincode" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 4: Company Details (Conditionally Rendered) */}
          {watchType === "1" && (
            <Card className="shadow-sm border-purple-200 bg-purple-50/5 dark:bg-purple-950/5 border animate-in slide-in-from-top duration-300">
              <CardHeader className="bg-purple-100/20 border-b pb-4">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Building2 className="size-5" />
                  <CardTitle className="text-lg">Section 4: Corporate Registration & Contacts</CardTitle>
                </div>
                <CardDescription className="text-purple-900/60 dark:text-purple-400/60">
                  Mandatory information for tax compliance and commercial rental contracts.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 md:grid-cols-2">
                <FormField
                  control={form.control as any}
                  name="contactPersonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-purple-800 dark:text-purple-300">Contact Person Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Primary representative name" {...field} className="h-10 border-purple-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="contactPersonMobileNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-purple-800 dark:text-purple-300">Contact Person Mobile *</FormLabel>
                      <FormControl>
                        <Input placeholder="Direct mobile line" {...field} className="h-10 border-purple-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="gstOrTaxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-purple-800 dark:text-purple-300">GST / Tax Identification Number</FormLabel>
                      <FormControl>
                        <Input placeholder="GSTIN or regional tax ID" {...field} className="h-10 border-purple-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="contactPersonAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="font-bold text-purple-800 dark:text-purple-300">Contact Person Dispatch Address</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Contact person's full address if different..."
                          className={cn(
                            "flex min-h-[60px] w-full rounded-md border border-purple-200 bg-background px-3 py-2 text-sm shadow-sm transition-colors",
                            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Section 5: Financial */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <div className="flex items-center gap-2 text-primary">
                <CreditCard className="size-5" />
                <CardTitle className="text-lg">Section 5: Credit Management & Notes</CardTitle>
              </div>
              <CardDescription>Set parameters for rental deposits and overall credit limit bounds.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2">
              <FormField
                control={form.control as any}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Maximum Credit Limit ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 5000.00" {...field} className="h-10" />
                    </FormControl>
                    <FormDescription>Restrict booking creation if balance exceeds this limit.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold">Internal Account Notes</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Log any preferences, specific credit status, or relationship details..."
                        className={cn(
                          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
                          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border-muted"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/customers")}
              disabled={isSaving}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="font-bold bg-primary shadow-md">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving Details...
                </>
              ) : (
                <>
                  {isEditMode ? <Save className="mr-2 size-4" /> : <UserPlus className="mr-2 size-4" />}
                  {isEditMode ? "Save Changes" : "Create Account"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

function normalizeOptional(value?: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}
