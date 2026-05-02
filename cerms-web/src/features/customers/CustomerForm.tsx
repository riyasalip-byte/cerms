import * as React from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, UserPlus } from "lucide-react"

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
import { cn } from "@/lib/utils"
import {
  useCreateCustomer,
  useCustomer,
  useUpdateCustomer,
} from "@/hooks/useCustomers"

const optionalEmailSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().email().safeParse(value).success, {
    message: "Invalid email address.",
  })

const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200, "Name must not exceed 200 characters."),
  phone: z.string().trim().min(1, "Phone is required.").max(50, "Phone must not exceed 50 characters."),
  email: optionalEmailSchema,
  address: z.string().trim().max(500, "Address must not exceed 500 characters."),
  companyName: z.string().trim().max(200, "Company name must not exceed 200 characters."),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

const defaultValues: CustomerFormValues = {
  name: "",
  phone: "",
  email: "",
  address: "",
  companyName: "",
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
    resolver: zodResolver(customerFormSchema),
    defaultValues,
    mode: "onChange",
  })

  React.useEffect(() => {
    if (!existingCustomer) return

    form.reset({
      name: existingCustomer.name ?? "",
      phone: existingCustomer.phone ?? "",
      email: existingCustomer.email ?? "",
      address: existingCustomer.address ?? "",
      companyName: existingCustomer.companyName ?? "",
    })
  }, [existingCustomer, form])

  const isSaving = createCustomer.isPending || updateCustomer.isPending

  async function onSubmit(values: CustomerFormValues) {
    const payload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: normalizeOptional(values.email),
      address: normalizeOptional(values.address),
      companyName: normalizeOptional(values.companyName),
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Customer" : "Add Customer"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update customer profile and contact information." : "Create a customer profile for rentals and billing."}
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/customers">Back to Customers</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>
                Keep contact and company details accurate for rental records.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Street, city, state, ZIP"
                        className={cn(
                          "flex min-h-[112px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
                          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          "disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/customers")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {isEditMode ? <Save className="mr-2 size-4" /> : <UserPlus className="mr-2 size-4" />}
                  {isEditMode ? "Save Changes" : "Create Customer"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

function normalizeOptional(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}
