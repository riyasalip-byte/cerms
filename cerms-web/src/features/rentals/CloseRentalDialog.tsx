import * as React from "react"
import { useCloseRental } from "@/hooks/useRentals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, CheckCircle, FileText } from "lucide-react"

interface CloseRentalDialogProps {
  rentalId: string
  startOdometer?: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CloseRentalDialog({ rentalId, startOdometer, isOpen, onOpenChange, onSuccess }: CloseRentalDialogProps) {
  const closeRental = useCloseRental()
  const [endOdometer, setEndOdometer] = React.useState("")
  const [actualEndDate, setActualEndDate] = React.useState(new Date().toISOString().split("T")[0])
  const [billingSummary, setBillingSummary] = React.useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!endOdometer) return
    
    try {
      const response = await closeRental.mutateAsync({
        id: rentalId,
        actualEndDateTime: actualEndDate,
        endOdometer: Number(endOdometer)
      })
      // backend returns the billing result payload
      setBillingSummary(response || { offline: true })
    } catch (e) {
      // error handled globally by the hook
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    if (billingSummary && onSuccess) {
      onSuccess()
    }
    // Reset state after dialog closes so it's fresh next time
    setTimeout(() => {
      setBillingSummary(null)
      setEndOdometer("")
      setActualEndDate(new Date().toISOString().split("T")[0])
    }, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        {!billingSummary ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Close Rental & Generate Invoice</DialogTitle>
              <DialogDescription>
                This will close the rental agreement, mark the asset as available again, and automatically compute the final invoice amount.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">End Odometer</label>
                <Input 
                  type="number" 
                  placeholder={`Min: ${startOdometer || 0}`} 
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Actual End Date</label>
                <Input 
                  type="date" 
                  value={actualEndDate}
                  onChange={(e) => setActualEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={closeRental.isPending || !endOdometer}>
                {closeRental.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : "Confirm Close"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">Rental Closed Successfully</DialogTitle>
              <DialogDescription className="text-center">
                The asset has been returned and billing is complete.
              </DialogDescription>
            </DialogHeader>
            
            {billingSummary && !billingSummary.offline && (
              <div className="mt-4 rounded-lg bg-muted/50 p-4 border text-left">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-primary">
                  <FileText className="size-4" /> Billing Overview
                </div>
                {billingSummary.totalAmount !== undefined && (
                  <div className="flex justify-between border-b border-border/50 pb-2 mb-2">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-bold text-lg text-primary">${billingSummary.totalAmount.toFixed(2)}</span>
                  </div>
                )}
                {billingSummary.quantity !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billable Periods</span>
                    <span className="font-medium">{billingSummary.quantity}</span>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter className="sm:justify-center mt-6">
              <Button onClick={handleClose} className="w-full sm:w-auto">
                Refresh View
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
