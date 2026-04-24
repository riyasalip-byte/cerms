import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, UserPlus } from "lucide-react"
import { getCustomerById } from "@/api/services"

import {
  Form,
  FormControl,
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

const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  company: z.string().min(1, "Company name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(5, "Phone number is required."),
  status: z.enum(["active", "inactive"]),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

export function CustomerForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editCustomerId = searchParams.get("customerId")
  const isEditMode = Boolean(editCustomerId)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [pendingData, setPendingData] = React.useState<CustomerFormValues | null>(null)

  const { data: existingCustomer, isLoading } = useQuery({
    queryKey: ["customers", editCustomerId],
    queryFn: () => getCustomerById(editCustomerId!),
    enabled: !!editCustomerId,
  })

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      status: "active",
    },
  })

  React.useEffect(() => {
    if (existingCustomer) {
      form.reset({
        name: existingCustomer.name,
        company: existingCustomer.company || "",
        email: existingCustomer.email,
        phone: existingCustomer.phone,
        status: (existingCustomer.status as any) || "active",
      })
    }
  }, [existingCustomer, form])

  async function onSubmit(data: CustomerFormValues) {
    setPendingData(data)
    setShowConfirm(true)
  }

  async function handleConfirmSubmit() {
    if (!pendingData) return
    setShowConfirm(false)
    // In a real app, you would call a mutation here
    console.log("Submitting customer data:", pendingData)
    navigate("/customers", { replace: true })
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
            {isEditMode ? "Edit Customer" : "New Customer"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update customer contact details and status."
              : "Register a new customer or company."}
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/customers">Back to List</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>
                Provide the primary contact information for this customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" autoFocus {...field} />
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
                    <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
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
                    <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Status <span className="text-destructive">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/customers")}
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
                  {isEditMode ? <Save className="mr-2 size-4" /> : <UserPlus className="mr-2 size-4" />}
                  {isEditMode ? "Save Changes" : "Create Customer"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Customer Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {isEditMode ? "update this customer" : "create this new customer"}? 
              Please ensure the contact information is accurate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
