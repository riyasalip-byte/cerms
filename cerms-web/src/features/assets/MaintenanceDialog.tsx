import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAddMaintenance } from "@/hooks/useAssets"

import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const maintenanceSchema = z.object({
  description: z.string().min(2, "Description is required"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  serviceDate: z.string().min(1, "Service date is required"),
  odometer: z.coerce.number().min(0, "Odometer cannot be negative"),
  nextServiceDueDate: z.string().optional(),
  nextServiceOdometer: z.string().optional(),
}).refine(data => !data.nextServiceOdometer || Number(data.nextServiceOdometer) > data.odometer, {
  message: "Must be greater than service odometer",
  path: ["nextServiceOdometer"],
})

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>

interface MaintenanceDialogProps {
  assetId: string
  currentOdometer: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MaintenanceDialog({ assetId, currentOdometer, isOpen, onOpenChange }: MaintenanceDialogProps) {
  const addMaintenance = useAddMaintenance()

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema) as any,
    defaultValues: {
      description: "",
      cost: 0,
      serviceDate: new Date().toISOString().split('T')[0],
      odometer: currentOdometer,
      nextServiceDueDate: "",
      nextServiceOdometer: "",
    },
  })

  React.useEffect(() => {
    if (isOpen) {
      form.setValue("odometer", currentOdometer)
    }
  }, [isOpen, currentOdometer, form])

  const onSubmit = async (data: MaintenanceFormValues) => {
    await addMaintenance.mutateAsync({
      id: assetId,
      data: {
        assetId: assetId,
        description: data.description,
        cost: data.cost,
        serviceDate: new Date(data.serviceDate).toISOString(),
        odometer: data.odometer,
        nextServiceDueDate: data.nextServiceDueDate ? new Date(data.nextServiceDueDate).toISOString() : undefined,
        nextServiceOdometer: data.nextServiceOdometer ? Number(data.nextServiceOdometer) : undefined,
      }
    })
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Maintenance Record</DialogTitle>
          <DialogDescription>
            Log a completed maintenance service. This will update the asset's current odometer, total maintenance cost, and set its status to Maintenance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Routine Oil Change and Filter Replacement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($) <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Odometer <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" max={new Date().toISOString().split('T')[0]} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextServiceDueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Service Due</FormLabel>
                    <FormControl>
                      <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="nextServiceOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Service Odometer</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMaintenance.isPending}>
                {addMaintenance.isPending ? "Saving..." : "Log Maintenance"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
