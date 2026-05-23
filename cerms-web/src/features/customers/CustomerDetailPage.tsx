import { Link, useNavigate, useParams } from "react-router-dom"
import { Copy, Edit2, ArrowLeft, Loader2, Mail, MapPin, Phone, Power, Sparkles, UserRound, Building, Wallet, Calendar, FileText, ArrowUpRight, MessageSquareCode, BadgeAlert, CheckCircle2, DollarSign } from "lucide-react"
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
  0: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  1: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  3: "bg-zinc-150 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400",
}

export function CustomerDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const { data: customer, isLoading, isError, refetch } = useCustomer(id)
  const deactivateCustomer = useDeactivateCustomer()

  const handleDeactivate = async () => {
    if (!id || !window.confirm("Are you sure you want to deactivate this customer account?")) return
    await deactivateCustomer.mutateAsync(id)
  }

  const copyToClipboard = async (label: string, value?: string | null) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copied to clipboard`)
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

  const isCompany = customer.customerType === 1
  const hasOutstanding = customer.outstandingBalance > 0
  const activeRentalsCount = customer.rentalHistory.filter(r => r.status === 2).length

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* 1. Customer Summary Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div className="flex items-start gap-4">
          <div className={[
            "flex size-14 items-center justify-center rounded-2xl border-2 transition-all shadow-md shrink-0",
            isCompany 
              ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-950 dark:bg-purple-950/30 dark:text-purple-400"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-400"
          ].join(" ")}>
            {isCompany ? <Building className="size-8" /> : <UserRound className="size-8" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {customer.customerName}
              </h1>
              <span className={[
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border transition-colors",
                isCompany 
                  ? "bg-purple-100/70 border-purple-200 text-purple-700 dark:bg-purple-900/40 dark:border-purple-800 dark:text-purple-300"
                  : "bg-emerald-100/70 border-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-300"
              ].join(" ")}>
                {isCompany ? "Company" : "Individual"}
              </span>
              {!customer.isActive && (
                <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-0.5">
              Code: <span className="font-bold text-slate-700 dark:text-slate-300">{customer.customerCode}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild className="font-semibold">
            <Link to="/customers">
              <ArrowLeft className="mr-2 size-4" />
              Back to List
            </Link>
          </Button>
          <Button variant="outline" asChild className="font-semibold">
            <Link to={`/customers/${customer.id}/edit`}>
              <Edit2 className="mr-2 size-4 text-primary" />
              Edit Customer
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeactivate}
            disabled={!customer.isActive || deactivateCustomer.isPending}
            className="font-semibold"
          >
            {deactivateCustomer.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Power className="mr-2 size-4" />
            )}
            Deactivate
          </Button>
        </div>
      </div>

      {/* Warning highlight card if outstanding balance exists */}
      {hasOutstanding && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-250 bg-rose-50/50 p-4 dark:border-rose-950/50 dark:bg-rose-950/10 animate-pulse">
          <BadgeAlert className="size-6 text-rose-600 dark:text-rose-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-rose-800 dark:text-rose-450 text-sm">Account Outstanding Balance Action Required</h4>
            <p className="text-xs text-rose-700 dark:text-rose-400/80 mt-0.5">
              This customer currently has an unpaid balance of <span className="font-extrabold">{formatCurrency(customer.outstandingBalance)}</span>. Review billing summary or rental lock details before continuing rental agreements.
            </p>
          </div>
        </div>
      )}

      {/* 2. Billing / Metrics Summary Dashboard Widgets */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          label="Total Rentals" 
          value={customer.totalRentalsCount.toLocaleString()} 
          icon={Calendar} 
          description="Aggregate bookings"
        />
        <MetricCard 
          label="Total Revenue" 
          value={formatCurrency(customer.totalRevenue)} 
          icon={Wallet}
          iconClass="text-emerald-600 dark:text-emerald-450"
          description="Total invoice billings"
        />
        <MetricCard 
          label="Outstanding Balance" 
          value={formatCurrency(customer.outstandingBalance)} 
          icon={DollarSign}
          iconClass={hasOutstanding ? "text-rose-600 dark:text-rose-450" : "text-slate-500"}
          valueClass={hasOutstanding ? "text-rose-600 dark:text-rose-400 font-extrabold" : undefined}
          description="Due for payments"
        />
        <MetricCard 
          label="Active Rentals" 
          value={activeRentalsCount.toString()} 
          icon={Sparkles}
          iconClass={activeRentalsCount > 0 ? "text-blue-600 dark:text-blue-450" : "text-slate-500"}
          description="Currently deployed"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        
        {/* 3. Basic & Contact Info Card */}
        <div className="space-y-6">
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>Primary communication records.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <ContactRow 
                icon={Phone} 
                label="Mobile No" 
                value={customer.mobileNo} 
                onCopy={() => copyToClipboard("Mobile No", customer.mobileNo)}
                action={
                  <Button variant="ghost" size="icon" className="size-8" asChild>
                    <a 
                      href={`https://wa.me/${(customer.whatsAppNo || customer.mobileNo).replace(/[^0-9]/g, "")}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Direct WhatsApp"
                    >
                      <MessageSquareCode className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                    </a>
                  </Button>
                }
              />

              {customer.alternateMobileNo && (
                <ContactRow 
                  icon={Phone} 
                  label="Alternate Mobile" 
                  value={customer.alternateMobileNo} 
                  onCopy={() => copyToClipboard("Alternate Mobile", customer.alternateMobileNo)}
                />
              )}

              <ContactRow 
                icon={Mail} 
                label="Email" 
                value={customer.email || "-"} 
                onCopy={customer.email ? () => copyToClipboard("Email", customer.email) : undefined}
              />

              {customer.whatsAppNo && (
                <ContactRow 
                  icon={MessageSquareCode} 
                  label="WhatsApp No" 
                  value={customer.whatsAppNo} 
                  onCopy={() => copyToClipboard("WhatsApp No", customer.whatsAppNo)}
                />
              )}

              <ContactRow 
                icon={MapPin} 
                label="Location Address" 
                value={
                  <div>
                    <p className="font-semibold">{customer.address || "-"}</p>
                    {(customer.city || customer.state || customer.pincode) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[customer.city, customer.state, customer.pincode].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                }
              />
            </CardContent>
          </Card>

          {/* 4. Company Specific Details (Visible only if Company customer type) */}
          {isCompany && (
            <Card className="shadow-sm border-purple-250 bg-purple-50/5 dark:bg-purple-950/5 border">
              <CardHeader className="bg-purple-100/20 border-b pb-4">
                <CardTitle className="text-lg text-purple-800 dark:text-purple-300">Company & Tax Identification</CardTitle>
                <CardDescription className="text-purple-900/60 dark:text-purple-400/60">Registered commercial contract profiles.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <DetailRow label="GST / Tax Registration" value={customer.gstOrTaxNumber || "-"} valueClass="font-mono font-bold text-slate-800 dark:text-slate-200" />
                <DetailRow label="Contact Person Name" value={customer.contactPersonName || "-"} />
                <DetailRow label="Contact Person Mobile" value={customer.contactPersonMobileNo || "-"} />
                <DetailRow label="Contact Person Dispatch Address" value={customer.contactPersonAddress || "-"} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* 5. Financial Summary & Credit details */}
        <div className="space-y-6">
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <CardTitle className="text-lg">Financial Overview</CardTitle>
              <CardDescription>Credit control parameters and accounting statements.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border bg-slate-50/40 p-4 dark:bg-slate-900/10">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Credit Limit</span>
                  <p className="text-2xl font-bold tracking-tight text-foreground mt-1">
                    {formatCurrency(customer.creditLimit)}
                  </p>
                </div>
                <div className={[
                  "rounded-xl border p-4",
                  hasOutstanding 
                    ? "border-rose-100 bg-rose-50/10 dark:border-rose-900/30 dark:bg-rose-950/5" 
                    : "bg-slate-50/40 dark:bg-slate-900/10"
                ].join(" ")}>
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Available Balance</span>
                  <p className={[
                    "text-2xl font-bold tracking-tight mt-1",
                    hasOutstanding ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                  ].join(" ")}>
                    {formatCurrency(customer.creditLimit - customer.outstandingBalance)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <DetailRow label="Notes & Directives" value={customer.notes || "No notes registered."} valueClass="italic text-sm" />
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Approved for commercial equipment rentals.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* 6. Rental History Table with Invoice visibility */}
      <Card className="shadow-sm border-muted">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
          <CardTitle className="text-lg">Rental History & Billing Logs</CardTitle>
          <CardDescription>Comprehensive audit log of recent equipment bookings, deployments, and linked invoices.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-slate-900/40">
                <TableRow>
                  <TableHead className="font-bold">Rental No</TableHead>
                  <TableHead className="font-bold">Asset Name</TableHead>
                  <TableHead className="font-bold">Rental Start</TableHead>
                  <TableHead className="font-bold">Rental End</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Total Bill</TableHead>
                  <TableHead className="text-right font-bold">Paid</TableHead>
                  <TableHead className="text-right font-bold">Balance</TableHead>
                  <TableHead className="text-center font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.rentalHistory && customer.rentalHistory.length > 0 ? (
                  customer.rentalHistory.map((rental) => {
                    const hasDues = rental.balanceAmount > 0
                    return (
                      <TableRow key={rental.rentalId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <TableCell className="font-mono font-bold text-xs">
                          {rental.rentalNo}
                        </TableCell>
                        <TableCell className="font-semibold text-sm max-w-[160px] truncate">
                          {rental.assetName}
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(rental.startDateTime)}</TableCell>
                        <TableCell className="text-xs">{formatDate(rental.endDateTime)}</TableCell>
                        <TableCell>
                          <span
                            className={[
                              "inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              rentalStatusClasses[rental.status] ?? rentalStatusClasses[0],
                            ].join(" ")}
                          >
                            {rentalStatusLabels[rental.status] ?? "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs font-semibold">
                          {formatCurrency(rental.totalBillAmount)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-emerald-600 font-semibold">
                          {formatCurrency(rental.paidAmount)}
                        </TableCell>
                        <TableCell className={[
                          "text-right text-xs font-extrabold",
                          hasDues ? "text-rose-600 dark:text-rose-450" : "text-slate-500"
                        ].join(" ")}>
                          {formatCurrency(rental.balanceAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1.5">
                            <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold px-2 hover:bg-slate-100" asChild>
                              <Link to={`/rentals/${rental.rentalId}`}>
                                View Rental
                              </Link>
                            </Button>
                            {rental.invoiceId ? (
                              <Button size="sm" variant="outline" className="h-7 text-xs font-bold px-2 text-primary border-primary/20 hover:bg-primary/5" asChild>
                                <Link to={`/invoices/${rental.invoiceId}`}>
                                  View Invoice
                                  <ArrowUpRight className="size-3 ml-1 shrink-0" />
                                </Link>
                              </Button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic px-2">
                                Uninvoiced
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground italic">
                      No customer rental history found. Click "Add Rental" in the Rentals panel to create a booking.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-6 flex justify-between items-center">
            <Button variant="outline" onClick={() => navigate("/customers")} className="font-semibold">
              Back to Customers List
            </Button>
            <Button asChild className="font-bold bg-primary shadow-sm">
              <Link to={`/rentals/new?customerId=${customer.id}`}>
                New Rental Booking
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  iconClass,
  valueClass,
  description
}: {
  label: string
  value: string
  icon: typeof Calendar
  iconClass?: string
  valueClass?: string
  description?: string
}) {
  return (
    <Card className="shadow-sm border-muted overflow-hidden">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={["text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate", valueClass].filter(Boolean).join(" ")}>
            {value}
          </p>
          {description && (
            <p className="text-[10px] text-muted-foreground font-light truncate">{description}</p>
          )}
        </div>
        <div className={[
          "flex size-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900/50 shrink-0",
          iconClass
        ].filter(Boolean).join(" ")}>
          <Icon className="size-5 shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
  onCopy,
  action,
}: {
  icon: typeof Phone
  label: string
  value: React.ReactNode
  onCopy?: () => void
  action?: React.ReactNode
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50/50 border border-slate-100 dark:bg-slate-900/10 dark:border-slate-900/40 p-4">
      <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900/60 text-muted-foreground shrink-0 mt-0.5">
        <Icon className="size-4 shrink-0" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="mt-1 font-semibold text-slate-800 dark:text-slate-200 break-words text-sm leading-snug">{value}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {action}
        {onCopy && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 hover:bg-slate-100"
            onClick={onCopy}
            aria-label={`Copy ${label.toLowerCase()}`}
          >
            <Copy className="size-4 text-slate-500" />
          </Button>
        )}
      </div>
    </div>
  )
}

function DetailRow({ 
  label, 
  value,
  valueClass 
}: { 
  label: string; 
  value: string;
  valueClass?: string 
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0 border-muted">
      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider shrink-0">{label}</span>
      <span className={["text-sm font-bold text-slate-900 dark:text-slate-100 text-right ml-4", valueClass].filter(Boolean).join(" ")}>{value}</span>
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
