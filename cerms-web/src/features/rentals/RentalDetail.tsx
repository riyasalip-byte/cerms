import * as React from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { 
  useRental, 
  useConfirmRental, 
  useStartRental, 
  useCompleteRental, 
  useCloseRental, 
  useDispatchRental, 
  useCancelRental 
} from "@/hooks/useRentals"
import { useOperators, useAssignOperator } from "@/hooks/useOperators"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/StatusBadge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CloseRentalDialog } from "./CloseRentalDialog"
import { 
  Loader2, 
  AlertCircle,
  ArrowLeft, 
  CheckCircle, 
  Play, 
  Square, 
  FileText, 
  User, 
  Package, 
  Calendar, 
  MapPin, 
  Truck, 
  Fuel, 
  DollarSign, 
  Ban, 
  ArrowUpRight, 
  ExternalLink 
} from "lucide-react"
import { format } from "date-fns"

export function RentalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: rental, isLoading, isError, refetch } = useRental(id!)
  const confirmRental = useConfirmRental()
  const startRental = useStartRental()
  const dispatchRental = useDispatchRental()
  const cancelRental = useCancelRental()
  const closeRental = useCloseRental()

  // Operators hooks and state
  const { data: operators, isLoading: isLoadingOperators } = useOperators()
  const assignOperatorMutation = useAssignOperator()
  const [selectedOperatorId, setSelectedOperatorId] = React.useState("")

  const [startOdometer, setStartOdometer] = React.useState("")
  const [showStartForm, setShowStartForm] = React.useState(false)
  const [showCompleteForm, setShowCompleteForm] = React.useState(false)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !rental) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <FileText className="size-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Rental Agreement Not Found</h2>
          <p className="text-muted-foreground">The requested rental agreement does not exist or you don't have access.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/rentals")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Rentals
        </Button>
      </div>
    )
  }

  const handleConfirm = async () => {
    await confirmRental.mutateAsync(rental.id)
    refetch()
  }

  const handleDispatch = async () => {
    await dispatchRental.mutateAsync(rental.id)
    refetch()
  }

  const handleCancel = async () => {
    await cancelRental.mutateAsync(rental.id)
    refetch()
  }

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    await startRental.mutateAsync({ id: rental.id, startOdometer: Number(startOdometer) })
    setShowStartForm(false)
    refetch()
  }

  const getRentalStatusValue = (status: any): number => {
    if (typeof status === "number") return status;
    if (!status) return 0;
    const map: Record<string, number> = {
      draft: 0,
      confirmed: 1,
      dispatched: 2,
      active: 3,
      completed: 4,
      closed: 5,
      cancelled: 6
    };
    return map[String(status).toLowerCase()] ?? 0;
  }

  const statusVal = getRentalStatusValue(rental.status)

  const handleClose = async () => {
    await closeRental.mutateAsync(rental.id)
    refetch()
  }

  const handleAssignOperator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOperatorId) return
    await assignOperatorMutation.mutateAsync({
      rentalId: rental.id,
      operatorId: selectedOperatorId
    })
    setSelectedOperatorId("")
    refetch()
  }

  const formatRateType = (type?: number | string) => {
    if (type === undefined || type === null || type === "") return 'Not decided'
    if (typeof type === 'string') {
      const str = type.toLowerCase()
      if (str === 'hourly' || str === '0') return 'Hourly'
      if (str === 'daily' || str === '1') return 'Daily'
      if (str === 'weekly' || str === '2') return 'Weekly'
      if (str === 'monthly' || str === '3') return 'Monthly'
      return type
    }
    const map: Record<number, string> = { 0: 'Hourly', 1: 'Daily', 2: 'Weekly', 3: 'Monthly' }
    return map[type] || 'Unknown'
  }

  const formatFuelResponsibility = (type?: string | number) => {
    if (type === 0 || type === "0" || type === "Customer") return "Customer (Refill on return)"
    if (type === 1 || type === "1" || type === "Company") return "Company (Fuel included)"
    if (type === 2 || type === "2" || type === "Shared") return "Shared proportional billing"
    return String(type || "Customer")
  }

  const isAnyLoading = 
    confirmRental.isPending || 
    dispatchRental.isPending || 
    cancelRental.isPending || 
    startRental.isPending || 
    closeRental.isPending

  const pickup = Number(rental.pickupTransportCharge || 0)
  const returnFee = Number(rental.returnTransportCharge || 0)
  const totalTransport = pickup + returnFee

  // Sleek Timeline Steps Mapping
  const timelineSteps = [
    { label: "Draft", statusVal: 0 },
    { label: "Confirmed", statusVal: 1 },
    { label: "Dispatched", statusVal: 2 },
    { label: "Active", statusVal: 3 },
    { label: "Completed", statusVal: 4 },
    { label: "Closed", statusVal: 5 }
  ]

  const isCancelled = statusVal === 6

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/rentals")}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
              Rental Contract
              <span className="font-mono text-sm text-muted-foreground font-normal">#{rental.id.slice(0, 8)}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Client: <span className="font-semibold text-slate-700 dark:text-slate-350">{rental.customerName}</span> | Equipment: <span className="font-semibold text-slate-700 dark:text-slate-350">{rental.assetName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={rental.status} className="rental text-sm px-3 py-1 font-bold" />
        </div>
      </div>

      {/* VISUAL TIMELINE COMPONENT */}
      {!isCancelled ? (
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="relative flex items-center justify-between w-full">
              {/* Connector line behind circles */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 z-0" />
              
              {/* Dynamic colored progress indicator */}
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 z-0" 
                style={{ 
                  width: `${(Math.min(statusVal, 5) / 5) * 100}%` 
                }} 
              />

              {timelineSteps.map((step) => {
                const isStepCompleted = step.statusVal < statusVal
                const isStepCurrent = step.statusVal === statusVal
                
                return (
                  <div key={step.label} className="relative z-10 flex flex-col items-center group">
                    <div className={[
                      "flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-md",
                      isStepCompleted 
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isStepCurrent
                          ? "bg-white border-emerald-500 text-emerald-600 dark:bg-slate-900 animate-pulse scale-110 ring-4 ring-emerald-500/20"
                          : "bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-950 dark:border-slate-800"
                    ].join(" ")}>
                      {isStepCompleted ? (
                        <CheckCircle className="size-5" />
                      ) : (
                        <span className="text-xs font-bold">{step.statusVal + 1}</span>
                      )}
                    </div>
                    <span className={[
                      "text-xs font-semibold mt-2.5 transition-colors hidden sm:block",
                      isStepCurrent ? "text-emerald-600 dark:text-emerald-450 font-bold" : "text-muted-foreground"
                    ].join(" ")}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-rose-250 bg-rose-50/50 p-4 dark:border-rose-950/50 dark:bg-rose-950/15">
          <Ban className="size-6 text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <h4 className="font-bold text-rose-800 dark:text-rose-450 text-sm">Agreement Cancelled</h4>
            <p className="text-xs text-rose-700 dark:text-rose-400/80 mt-0.5">
              This rental deployment agreement has been marked as Cancelled. Equipment reservation was freed back to Available.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* WORKFLOW ACTION PANEL (Left column) */}
        <div className="space-y-6">
          <Card className="border-emerald-100 dark:border-emerald-950/20 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader className="bg-emerald-50/40 dark:bg-emerald-950/10 pb-4 border-b">
              <CardTitle className="text-base font-bold">Contract Lifecycle Actions</CardTitle>
              <CardDescription>Manage the heavy equipment dispatch flow.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {/* Draft Status (0) */}
              {statusVal === 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-xs text-muted-foreground">This lease contract is a Draft. Verify site details and billing rates to confirm the order.</p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full h-10 font-semibold" disabled={isAnyLoading}>
                        Confirm Booking
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Rental Agreement?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Confirming reserves this wide-load equipment. It will transition to Confirmed status awaiting transport dispatch coordination.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} disabled={confirmRental.isPending}>
                          Yes, Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50" onClick={handleCancel} disabled={isAnyLoading}>
                    Cancel Agreement
                  </Button>
                </div>
              )}

              {/* Confirmed Status (1) */}
              {statusVal === 1 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-xs text-muted-foreground">The agreement is Confirmed. Coordinate Wide-Load Flatbed dispatch logistics to send the asset to the site.</p>
                  
                  <Button className="w-full h-10 font-semibold" onClick={handleDispatch} disabled={isAnyLoading}>
                    {dispatchRental.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Truck className="mr-2 size-4" />}
                    Dispatch Equipment
                  </Button>

                  <Button variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50" onClick={handleCancel} disabled={isAnyLoading}>
                    Cancel Agreement
                  </Button>
                </div>
              )}

              {/* Dispatched Status (2) */}
              {statusVal === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-xs text-muted-foreground">Equipment has been Dispatched. Upon arrival at the work site, input the hand-over start odometer to activate the billing cycle.</p>
                  
                  {!showStartForm ? (
                    <Button className="w-full h-10 font-semibold" onClick={() => setShowStartForm(true)} disabled={isAnyLoading}>
                      <Play className="mr-2 size-4" />
                      Start Lease (Activate)
                    </Button>
                  ) : (
                    <form onSubmit={handleStart} className="space-y-3 rounded-xl border p-4 bg-muted/20 animate-in slide-in-from-top-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Hand-over Start Odometer</label>
                        <Input 
                          type="number" 
                          placeholder="Current machine meter" 
                          value={startOdometer}
                          onChange={(e) => setStartOdometer(e.target.value)}
                          disabled={isAnyLoading}
                          required
                          className="h-10 text-base"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 font-semibold" disabled={isAnyLoading || !startOdometer}>
                          {startRental.isPending ? <Loader2 className="size-4 animate-spin" /> : "Activate"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowStartForm(false)} disabled={isAnyLoading}>Cancel</Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Active Status (3) */}
              {statusVal === 3 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-xs text-muted-foreground">Equipment is currently Active on-site. When work is completed and the machine is returned, trigger complete to compute calculations.</p>
                  
                  <Button variant="destructive" className="w-full h-10 font-semibold" onClick={() => setShowCompleteForm(true)} disabled={isAnyLoading}>
                    <Square className="mr-2 size-4" />
                    Complete Rental
                  </Button>

                  <CloseRentalDialog 
                    rentalId={rental.id}
                    startOdometer={rental.startOdometer}
                    isOpen={showCompleteForm}
                    onOpenChange={setShowCompleteForm}
                    onSuccess={refetch}
                  />
                </div>
              )}

              {/* Completed Status (4) */}
              {statusVal === 4 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-xs text-muted-foreground">Equipment is returned and billing calculations are complete. Close the contract to archive the lease.</p>
                  
                  <Button className="w-full h-10 font-semibold" onClick={handleClose} disabled={isAnyLoading}>
                    {closeRental.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : "Close Agreement"}
                  </Button>
                </div>
              )}

              {/* Closed Status (5) */}
              {statusVal === 5 && (
                <div className="flex flex-col items-center justify-center py-4 space-y-2 text-center text-muted-foreground animate-in zoom-in-95">
                  <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                    <CheckCircle className="size-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="font-bold text-sm text-foreground">Agreement Closed & Archived</p>
                  <p className="text-xs text-slate-500">Lease cycle is fully finalized, invoiced, and archived.</p>
                </div>
              )}

              {/* Cancelled Status (6) */}
              {statusVal === 6 && (
                <div className="text-center py-3 text-rose-600 font-bold text-sm animate-in zoom-in-95">
                  This lease agreement has been Cancelled.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* DETAILS SECTION (Right columns) */}
        <div className="md:col-span-3 lg:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Section 2 - Site Details */}
            <Card className="bg-card/60 backdrop-blur-sm border-none shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <MapPin className="size-4 text-emerald-600 dark:text-emerald-450" /> Site Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm pt-4">
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Site Name:</span>
                  <span className="font-semibold text-right">{rental.siteName || "-"}</span>
                </div>
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-medium text-right">{rental.siteAddress || "-"}</span>
                </div>
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Landmark:</span>
                  <span className="font-medium text-right">{rental.siteLandmark || "-"}</span>
                </div>
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Site Contact:</span>
                  <span className="font-semibold text-right text-emerald-700 dark:text-emerald-400">{rental.siteContactPerson || "-"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Contact Phone:</span>
                  <span className="font-mono text-right">{rental.siteContactNumber || "-"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Section 4 - Financial & Billing */}
            <Card className="bg-card/60 backdrop-blur-sm border-none shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <DollarSign className="size-4 text-emerald-600 dark:text-emerald-450" /> Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm pt-4">
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Base Rate:</span>
                  <span className="font-semibold text-right">
                    {rental.rateAmount ? `$${Number(rental.rateAmount).toLocaleString()}` : "Pending"} / {formatRateType(rental.rateType)}
                  </span>
                </div>
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Advance Deposited:</span>
                  <span className="font-semibold text-right text-emerald-600 dark:text-emerald-400">
                    {rental.advanceAmount ? `$${Number(rental.advanceAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                  </span>
                </div>
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Security Deposit:</span>
                  <span className="font-semibold text-right text-emerald-600 dark:text-emerald-400">
                    {rental.securityDepositAmount ? `$${Number(rental.securityDepositAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="grid grid-cols-2 items-center">
                    <span className="text-muted-foreground font-bold">Total Amount Due:</span>
                    <span className="text-xl font-extrabold text-primary text-right tracking-tight">
                      {rental.totalAmount ? `$${Number(rental.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "Calculating"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5 - Transportation */}
            <Card className="bg-card/60 backdrop-blur-sm border-none shadow-sm sm:col-span-2">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Truck className="size-4 text-emerald-600 dark:text-emerald-450" /> Transportation & Logistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-muted-foreground">Pickup Charge:</span>
                      <span className="font-semibold">{rental.pickupTransportCharge ? `$${Number(rental.pickupTransportCharge).toFixed(2)}` : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Return Charge:</span>
                      <span className="font-semibold">{rental.returnTransportCharge ? `$${Number(rental.returnTransportCharge).toFixed(2)}` : "-"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-muted-foreground font-bold">Total Logistics Fee:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-450">
                        ${totalTransport.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs font-semibold">Logistics Notes:</span>
                      <span className="text-xs text-slate-500 font-medium mt-0.5">{rental.transportNotes || "No special logistics notes logged."}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operator Assignment Card */}
            <Card className="bg-card/60 backdrop-blur-sm border-none shadow-sm sm:col-span-2 overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <User className="size-4 text-emerald-600 dark:text-emerald-450" /> Operator Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                {rental.assignedOperatorName ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center font-bold text-sm shrink-0">
                        {rental.assignedOperatorName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Assigned Operator</span>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{rental.assignedOperatorName}</h4>
                        <span className="text-xs text-slate-500 block font-mono mt-0.5">Code: {rental.assignedOperatorCode || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {statusVal >= 4 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-805 border border-slate-200 dark:border-slate-700">
                          ● Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded-full bg-emerald-100/40 border border-emerald-550/20">
                          ● Assigned & Dispatched
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-dashed border-amber-250 bg-amber-500/5 p-4 text-xs flex gap-2">
                      <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-850 dark:text-amber-450">No Operator Assigned</span>
                        <p className="text-slate-500 mt-1">An operator is required to accept field dispatches, log odometer readings, and coordinate return/handover logistics via the operator app portal.</p>
                      </div>
                    </div>
                    
                    {/* Select Form */}
                    {statusVal < 4 ? (
                      <form onSubmit={handleAssignOperator} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                        <div className="flex-1 w-full space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Select Active Operator</label>
                          <select
                            value={selectedOperatorId}
                            onChange={(e) => setSelectedOperatorId(e.target.value)}
                            disabled={isLoadingOperators || assignOperatorMutation.isPending}
                            className="w-full h-10 rounded-xl border border-slate-200 bg-background/50 pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          >
                            <option value="">-- Select Operator --</option>
                            {operators?.filter((op: any) => op.isActive).map((op: any) => (
                              <option key={op.id} value={op.id}>
                                {op.fullName} ({op.operatorCode})
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={!selectedOperatorId || assignOperatorMutation.isPending}
                          className="h-10 px-5 font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-1.5"
                        >
                          {assignOperatorMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                          Assign to Contract
                        </Button>
                      </form>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Operator assignment is closed for this completed/cancelled booking.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 6 - Fuel & Assets info */}
            <Card className="bg-card/60 backdrop-blur-sm border-none shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Fuel className="size-4 text-emerald-600 dark:text-emerald-450" /> Fuel Clause Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm pt-4">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Assigned Fuel Clause:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1">{formatFuelResponsibility(rental.fuelResponsibilityType)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Date Handover Summary */}
            <Card className="bg-card/60 backdrop-blur-sm border-none shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Calendar className="size-4 text-emerald-600 dark:text-emerald-450" /> Handover Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm pt-4">
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium text-right">{format(new Date(rental.startDateTime), "PPP")}</span>
                </div>
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Expected End:</span>
                  <span className="font-medium text-right">{format(new Date(rental.expectedEndDateTime), "PPP")}</span>
                </div>
                {rental.actualStartDateTime && (
                  <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Actual Start:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-450 text-right">
                      {format(new Date(rental.actualStartDateTime), "PPP p")}
                    </span>
                  </div>
                )}
                {rental.actualEndDateTime && (
                  <div className="grid grid-cols-2">
                    <span className="text-muted-foreground">Actual End:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-450 text-right">
                      {format(new Date(rental.actualEndDateTime), "PPP p")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Asset and Customer Profile links */}
            <Card className="bg-card/60 backdrop-blur-sm border-none shadow-sm sm:col-span-2">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-6 items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Package className="size-5 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground">Assigned Asset profile:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{rental.assetName}</p>
                    </div>
                    <Button variant="link" size="sm" asChild className="p-0 h-auto ml-2">
                      <Link to={`/assets/${rental.assetId}`} className="flex items-center gap-1">
                        View Profile <ExternalLink className="size-3" />
                      </Link>
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="size-5 text-muted-foreground" />
                    <div>
                      <span className="text-xs text-muted-foreground">Assigned Customer profile:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{rental.customerName}</p>
                    </div>
                    <Button variant="link" size="sm" asChild className="p-0 h-auto ml-2">
                      <Link to={`/customers/${rental.customerId}`} className="flex items-center gap-1">
                        View Profile <ExternalLink className="size-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  )
}
