import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCompleteMaintenance } from "@/hooks/useAssets"

interface MaintenanceCloseDialogProps {
  assetId: string
  activeMaintenance: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MaintenanceCloseDialog({
  assetId,
  activeMaintenance,
  isOpen,
  onOpenChange,
}: MaintenanceCloseDialogProps) {
  const completeMaintenance = useCompleteMaintenance()

  const [finalCost, setFinalCost] = React.useState<string>("")
  const [notes, setNotes] = React.useState<string>("")
  const [serviceDate, setServiceDate] = React.useState<string>("")
  const [nextServiceDueDate, setNextServiceDueDate] = React.useState<string>("")
  const [nextServiceOdometer, setNextServiceOdometer] = React.useState<string>("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isOpen && activeMaintenance) {
      setFinalCost(activeMaintenance.cost?.toString() || "")
      setNotes("")
      setServiceDate(new Date().toISOString().split('T')[0])
      setNextServiceDueDate(activeMaintenance.nextServiceDueDate ? new Date(activeMaintenance.nextServiceDueDate).toISOString().split('T')[0] : "")
      setNextServiceOdometer(activeMaintenance.nextServiceOdometer?.toString() || "")
      setError(null)
    }
  }, [isOpen, activeMaintenance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!activeMaintenance) return

    const cost = parseFloat(finalCost)
    if (isNaN(cost) || cost < 0) {
      setError("Final cost must be a valid number greater than or equal to 0.")
      return
    }

    try {
      await completeMaintenance.mutateAsync({
        id: assetId,
        maintenanceId: activeMaintenance.id,
        finalCost: cost,
        notes: notes,
        serviceDate: serviceDate ? new Date(serviceDate).toISOString() : undefined,
        nextServiceDueDate: nextServiceDueDate ? new Date(nextServiceDueDate).toISOString() : undefined,
        nextServiceOdometer: nextServiceOdometer ? Number(nextServiceOdometer) : undefined
      })
      onOpenChange(false)
    } catch (err) {
      // Error is handled by the hook's toast
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Maintenance</DialogTitle>
          <DialogDescription>
            Enter the final details to mark this maintenance as completed. This will return the asset to Available status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="finalCost">Final Cost ($)</Label>
            <Input
              id="finalCost"
              type="number"
              step="0.01"
              min="0"
              value={finalCost}
              onChange={(e) => setFinalCost(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceDate">Completion Date</Label>
            <Input
              id="serviceDate"
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nextServiceDueDate">Next Service Due Date</Label>
              <Input
                id="nextServiceDueDate"
                type="date"
                value={nextServiceDueDate}
                onChange={(e) => setNextServiceDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextServiceOdometer">Next Service Odometer</Label>
              <Input
                id="nextServiceOdometer"
                type="number"
                placeholder="Optional"
                value={nextServiceOdometer}
                onChange={(e) => setNextServiceOdometer(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Completion Notes (Optional)</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Replaced filter, checked engine"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={completeMaintenance.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={completeMaintenance.isPending}
            >
              {completeMaintenance.isPending ? "Completing..." : "Confirm Completion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
