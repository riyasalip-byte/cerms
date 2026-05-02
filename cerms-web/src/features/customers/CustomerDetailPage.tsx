import { Link, useNavigate, useParams } from "react-router-dom"
import { Copy, Edit2, Loader2, Mail, MapPin, Phone, Power, Sparkles, UserRound } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ErrorState } from "@/components/shared/ErrorState"
import { useCustomer, useDeactivateCustomer } from "@/hooks/useCustomers"

const rentalStatusLabels: Record<number, string> = {
  0: "Draft",
  1: "Confirmed",
  2: "Active",
  3: "Closed",
}

const rentalStatusClasses: Record<number, string> = {
  0: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  1: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  3: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
}

export function CustomerDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const { data: customer, isLoading, isError, refetch } = useCustomer(id)
  const deactivateCustomer = useDeactivateCustomer()

  const handleDeactivate = async () => {
    if (!id || !window.confirm("Deactivate this customer?")) return
    await deactivateCustomer.mutateAsync(id)
  }

  const copyToClipboard = async (label: string, value?: string | null) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copied`)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <ErrorState
        onRetry={refetch}
        message="We encountered an issue loading this customer record."
      />
    )
  }

  const isFrequentCustomer = customer.totalRentalsCount >= 5

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            {isFrequentCustomer && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                <Sparkles className="mr-1.5 size-3.5" />
                Frequent Customer
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {customer.customerCode} - Customer profile and rental activity
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild>
            <Link to={`/customers/${customer.id}/edit`}>
              <Edit2 className="mr-2 size-4" />
              Edit Customer
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeactivate}
            disabled={!customer.isActive || deactivateCustomer.isPending}
          >
            {deactivateCustomer.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Power className="mr-2 size-4" />
            )}
            Deactivate Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Customer Info</CardTitle>
            <CardDescription>Basic customer profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
                <UserRound className="size-6 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div>
                <p className="font-semibold">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.companyName || "Individual customer"}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <DetailItem label="Customer Code" value={customer.customerCode} />
              <DetailItem
                label="Status"
                value={customer.isActive ? "Active" : "Inactive"}
                valueClassName={customer.isActive ? "text-emerald-700 dark:text-emerald-300" : undefined}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="Total Rentals" value={customer.totalRentalsCount.toLocaleString()} />
              <MetricCard label="Total Revenue" value={formatCurrency(customer.totalRevenue)} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>Primary contact information for rentals and billing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <ContactItem
              icon={Phone}
              label="Phone"
              value={customer.phone}
              onCopy={() => copyToClipboard("Phone", customer.phone)}
            />
            <ContactItem
              icon={Mail}
              label="Email"
              value={customer.email || "-"}
              onCopy={customer.email ? () => copyToClipboard("Email", customer.email) : undefined}
            />
            <ContactItem
              icon={MapPin}
              label="Address"
              value={customer.address || "-"}
              className="md:col-span-2"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Rental History</CardTitle>
          <CardDescription>Most recent rentals for this customer.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.rentalHistory.length > 0 ? (
                  customer.rentalHistory.map((rental) => (
                    <TableRow key={rental.rentalId}>
                      <TableCell className="font-medium">{rental.assetName}</TableCell>
                      <TableCell>{formatDate(rental.startDateTime)}</TableCell>
                      <TableCell>
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                            rentalStatusClasses[rental.status] ?? rentalStatusClasses[0],
                          ].join(" ")}
                        >
                          {rentalStatusLabels[rental.status] ?? "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(rental.totalAmount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                      No rentals yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => navigate("/customers")}>
              Back to Customers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailItem({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className={["mt-1 font-semibold", valueClassName].filter(Boolean).join(" ")}>{value}</p>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  )
}

function ContactItem({
  icon: Icon,
  label,
  value,
  onCopy,
  className,
}: {
  icon: typeof Phone
  label: string
  value: string
  onCopy?: () => void
  className?: string
}) {
  return (
    <div className={["flex gap-3 rounded-lg bg-muted/30 p-4", className].filter(Boolean).join(" ")}>
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 break-words font-medium">{value}</p>
      </div>
      {onCopy && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={onCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          <Copy className="size-4" />
        </Button>
      )}
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value))
}

function formatCurrency(value?: number | null) {
  if (value == null) return "-"
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(value)
}
