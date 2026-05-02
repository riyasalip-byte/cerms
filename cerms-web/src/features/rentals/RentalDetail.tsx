import * as React from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useRental, useConfirmRental, useStartRental, useCloseRental } from "@/hooks/useRentals"
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
import { Loader2, ArrowLeft, CheckCircle, Play, Square, FileText, User, Package, Calendar } from "lucide-react"
import { format } from "date-fns"

export function RentalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: rental, isLoading, isError } = useRental(id!)
  const confirmRental = useConfirmRental()
  const startRental = useStartRental()
  const closeRental = useCloseRental()

  const [startOdometer, setStartOdometer] = React.useState("")
  const [endOdometer, setEndOdometer] = React.useState("")
  const [actualEndDate, setActualEndDate] = React.useState(new Date().toISOString().split("T")[0])

  const [showStartForm, setShowStartForm] = React.useState(false)
  const [showCloseForm, setShowCloseForm] = React.useState(false)

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
          <h2 className="text-xl font-bold">Rental Not Found</h2>
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
  }

  const handleStart = async (e: React.MouseEvent) => {
    e.preventDefault()
    await startRental.mutateAsync({ id: rental.id, startOdometer: Number(startOdometer) })
    setShowStartForm(false)
  }

  const handleClose = async (e: React.MouseEvent) => {
    e.preventDefault()
    await closeRental.mutateAsync({ id: rental.id, actualEndDateTime: actualEndDate, endOdometer: Number(endOdometer) })
    setShowCloseForm(false)
  }

  const formatRateType = (type: number) => {
    const map: Record<number, string> = { 0: 'Hourly', 1: 'Daily', 2: 'Weekly', 3: 'Monthly' }
    return map[type] || 'Unknown'
  }

  const isAnyLoading = confirmRental.isPending || startRental.isPending || closeRental.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/rentals")}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rental Agreement</h1>
            <p className="text-muted-foreground">ID: {rental.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={rental.status} className="rental text-base px-3 py-1" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Actions / Status Panel (Left/Top) */}
        <div className="md:col-span-3 lg:col-span-1 space-y-6">
          <Card className="border-primary/20 shadow-md bg-card/60 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle>Workflow Actions</CardTitle>
              <CardDescription>Manage the lifecycle of this rental</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {rental.status === 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm text-muted-foreground">This rental is currently a draft. Review the details and confirm the booking.</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" disabled={isAnyLoading}>
                        {confirmRental.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle className="mr-2 size-4" />}
                        Confirm Booking
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Rental Booking?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will lock in the details of the rental and transition the asset's state. You will not be able to change core details once confirmed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} disabled={confirmRental.isPending}>
                          Yes, Confirm Booking
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              {rental.status === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm text-muted-foreground">The booking is confirmed. When the equipment is handed over, log the starting details to begin.</p>
                  {!showStartForm ? (
                    <Button className="w-full" onClick={() => setShowStartForm(true)} disabled={isAnyLoading}>
                      <Play className="mr-2 size-4" />
                      Start Rental
                    </Button>
                  ) : (
                    <div className="space-y-3 rounded-lg border p-4 bg-background shadow-inner animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Start Odometer</label>
                        <Input 
                          type="number" 
                          placeholder="Current reading" 
                          value={startOdometer}
                          onChange={(e) => setStartOdometer(e.target.value)}
                          disabled={isAnyLoading}
                        />
                      </div>
                      <div className="flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="flex-1" disabled={isAnyLoading || !startOdometer}>
                              {startRental.isPending ? <Loader2 className="size-4 animate-spin" /> : "Start"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Start Rental Agreement?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will mark the asset as officially rented and out in the field. Are you sure the start odometer reading of {startOdometer} is correct?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleStart} disabled={startRental.isPending}>
                                Yes, Start Rental
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" onClick={() => setShowStartForm(false)} disabled={isAnyLoading}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {rental.status === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm text-muted-foreground">The asset is currently out in the field. When it is returned, close the rental to generate the invoice.</p>
                  <Button variant="destructive" className="w-full" onClick={() => setShowCloseForm(true)} disabled={isAnyLoading}>
                    <Square className="mr-2 size-4" />
                    Close Rental
                  </Button>

                  <CloseRentalDialog 
                    rentalId={rental.id}
                    startOdometer={rental.startOdometer}
                    isOpen={showCloseForm}
                    onOpenChange={setShowCloseForm}
                  />
                </div>
              )}

              {rental.status === 3 && (
                <div className="flex flex-col items-center justify-center py-4 space-y-2 text-center text-muted-foreground animate-in zoom-in-95">
                  <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                    <CheckCircle className="size-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="font-medium text-foreground">Rental Completed</p>
                  <p className="text-sm">This rental is closed and fully invoiced.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Panels (Right/Bottom) */}
        <div className="md:col-span-3 lg:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="size-4 text-primary" /> Rental Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">{format(new Date(rental.startDateTime || rental.startDate || new Date()), "PPP")}</span>
                </div>
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Expected End:</span>
                  <span className="font-medium">{format(new Date(rental.expectedEndDateTime || rental.expectedEndDate || new Date()), "PPP")}</span>
                </div>
                {rental.actualEndDateTime && (
                  <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Actual End:</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{format(new Date(rental.actualEndDateTime), "PPP")}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Start Odometer:</span>
                  <span className="font-medium">{rental.startOdometer || "-"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">End Odometer:</span>
                  <span className="font-medium">{rental.endOdometer || "-"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> Billing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium">${rental.rateAmount || rental.rentalRate} / {formatRateType(rental.rateType)}</span>
                </div>
                <div className="pt-4 mt-2">
                  <div className="grid grid-cols-2 items-center">
                    <span className="text-muted-foreground font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary tracking-tight">
                      {rental.totalAmount ? `$${rental.totalAmount.toFixed(2)}` : "Pending"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="size-4 text-primary" /> Asset Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{rental.assetName}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs">{rental.assetId}</span>
                </div>
                <div className="pt-2">
                  <Button variant="link" className="h-auto p-0" asChild>
                    <Link to={`/assets/${rental.assetId}`}>View Asset Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="size-4 text-primary" /> Customer Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{rental.customerName}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs">{rental.customerId}</span>
                </div>
                <div className="pt-2">
                  <Button variant="link" className="h-auto p-0" asChild>
                    <Link to={`/customers/${rental.customerId}`}>View Customer Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

