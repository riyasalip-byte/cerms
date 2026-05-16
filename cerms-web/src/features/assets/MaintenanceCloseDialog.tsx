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
import { useCompleteMaintenance, useMaintenanceTypes } from "@/hooks/useAssets"
import type { MaintenanceRecordDto } from "@/api/assets"

interface MaintenanceCloseDialogProps {
  assetId: string
  assetName: string
  activeMaintenance: MaintenanceRecordDto | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MaintenanceCloseDialog({
  assetId,
  assetName,
  activeMaintenance,
  isOpen,
  onOpenChange,
}: MaintenanceCloseDialogProps) {
  const completeMaintenance = useCompleteMaintenance()
  const { data: maintenanceTypes = [] } = useMaintenanceTypes()

  const [sparePartsCost, setSparePartsCost] = React.useState<string>("")
  const [labourCost, setLabourCost] = React.useState<string>("")
  const [notes, setNotes] = React.useState<string>("")
  const [serviceDate, setServiceDate] = React.useState<string>("")
  const [nextServiceDueDate, setNextServiceDueDate] = React.useState<string>("")
  const [nextServiceOdometer, setNextServiceOdometer] = React.useState<string>("")
  const [error, setError] = React.useState<string | null>(null)

  const selectedType = maintenanceTypes.find((type) => type.id === activeMaintenance?.maintenanceTypeId)
  const isPreventive = Boolean(selectedType?.isPreventiveMaintenance)
  
  const totalCost = (parseFloat(sparePartsCost) || 0) + (parseFloat(labourCost) || 0)

  React.useEffect(() => {
    if (isOpen && activeMaintenance) {
      // The dialog owns local draft fields so users can adjust completion data before submitting.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSparePartsCost(activeMaintenance.sparePartsCost?.toString() || "0")
      setLabourCost(activeMaintenance.labourCost?.toString() || "0")
      setNotes("")
      setServiceDate(new Date().toISOString().split('T')[0])
      setNextServiceDueDate((activeMaintenance.nextServiceDate ?? activeMaintenance.nextServiceDueDate) ? new Date(activeMaintenance.nextServiceDate ?? activeMaintenance.nextServiceDueDate ?? "").toISOString().split('T')[0] : "")
      setNextServiceOdometer((activeMaintenance.nextServiceOdoMeterReading ?? activeMaintenance.nextServiceOdometer)?.toString() || "")
      setError(null)
    }
  }, [isOpen, activeMaintenance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!activeMaintenance) return

    const spareParts = parseFloat(sparePartsCost)
    const labour = parseFloat(labourCost)

    if (isNaN(spareParts) || spareParts < 0) {
      setError("Spare parts cost must be a valid number greater than or equal to 0.")
      return
    }

    if (isNaN(labour) || labour < 0) {
      setError("Labour cost must be a valid number greater than or equal to 0.")
      return
    }

    try {
      await completeMaintenance.mutateAsync({
        id: assetId,
        maintenanceId: activeMaintenance.id,
        sparePartsCost: spareParts,
        labourCost: labour,
        notes: notes,
        serviceDate: serviceDate ? new Date(serviceDate).toISOString() : undefined,
        nextServiceDueDate: nextServiceDueDate ? new Date(nextServiceDueDate).toISOString() : undefined,
        nextServiceOdometer: nextServiceOdometer ? Number(nextServiceOdometer) : undefined
      })
      onOpenChange(false)
    } catch {
      // Error is handled by the hook's toast
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Complete Maintenance - {assetName}</DialogTitle>
          <DialogDescription>
            Enter the final details to mark this maintenance as completed. This will return the asset to Available status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Complaint Type</Label>
                <Input value={activeMaintenance?.maintenanceTypeName || ""} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Odometer Reading</Label>
                <Input value={activeMaintenance?.odoMeterReading || activeMaintenance?.odometer || ""} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Estimated Amount</Label>
                <Input value={activeMaintenance?.estimatedCost || ""} readOnly className="bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={activeMaintenance?.description || ""} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Service Vendor</Label>
              <Input value={activeMaintenance?.serviceVendor || "N/A"} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sparePartsCost">Spare Parts Cost</Label>
                <Input
                  id="sparePartsCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={sparePartsCost}
                  onChange={(e) => setSparePartsCost(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labourCost">Labour Cost</Label>
                <Input
                  id="labourCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={labourCost}
                  onChange={(e) => setLabourCost(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Total Cost</Label>
                <Input readOnly value={totalCost.toFixed(2)} className="font-mono font-semibold" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="serviceDate">Completion Date</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={serviceDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                />
              </div>
              {isPreventive && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nextServiceDueDate">Next Service Due Date</Label>
                    <Input
                      id="nextServiceDueDate"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={nextServiceDueDate}
                      onChange={(e) => setNextServiceDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextServiceOdometer">Next Service Odometer</Label>
                    <Input
                      id="nextServiceOdometer"
                      type="number"
                      min="0"
                      placeholder="Optional"
                      value={nextServiceOdometer}
                      onChange={(e) => setNextServiceOdometer(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Service Remarks (Optional)</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. Replaced filter, checked engine"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
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
