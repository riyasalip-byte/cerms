import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { useAddMaintenance, useMaintenanceTypes } from "@/hooks/useAssets"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const maintenanceSchema = z.object({
  maintenanceTypeId: z.string().min(1, "Maintenance type is required"),
  description: z.string().min(2, "Description is required").max(500),
  odoMeterReading: z.coerce.number().min(0, "Odometer cannot be negative"),
  estimatedCost: z.coerce.number().min(0, "Estimated cost cannot be negative").optional(),
  serviceDate: z.string().min(1, "Service date is required"),
  serviceVendor: z.string().optional(),
})

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>
const maintenanceResolver = zodResolver(maintenanceSchema) as unknown as Resolver<MaintenanceFormValues>

interface MaintenanceDialogProps {
  assetId: string
  assetName: string
  currentOdometer: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MaintenanceDialog({ assetId, assetName, currentOdometer, isOpen, onOpenChange }: MaintenanceDialogProps) {
  const addMaintenance = useAddMaintenance()
  const { data: maintenanceTypes = [], isLoading: isLoadingTypes } = useMaintenanceTypes()

  const form = useForm<MaintenanceFormValues>({
    resolver: maintenanceResolver,
    mode: "onChange",
    defaultValues: {
      maintenanceTypeId: "",
      description: "",
      odoMeterReading: currentOdometer,
      estimatedCost: undefined,
      serviceDate: new Date().toISOString().split("T")[0],
      serviceVendor: "",
    },
  })

  const selectedTypeId = useWatch({ control: form.control, name: "maintenanceTypeId" })
  React.useEffect(() => {
    if (isOpen) {
      form.setValue("odoMeterReading", currentOdometer)
    }
  }, [isOpen, currentOdometer, form])

  const onSubmit = async (data: MaintenanceFormValues) => {

    await addMaintenance.mutateAsync({
      id: assetId,
      data: {
        assetId,
        maintenanceTypeId: data.maintenanceTypeId,
        description: data.description,
        odoMeterReading: data.odoMeterReading,
        estimatedCost: data.estimatedCost,
        serviceVendor: data.serviceVendor || undefined,
        serviceDate: new Date(data.serviceDate).toISOString(),
      },
    })

    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Add Maintenance - {assetName}</DialogTitle>
          <DialogDescription>
            Record maintenance work, cost, vendor, and next-service planning for this asset.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="maintenanceTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isLoadingTypes || addMaintenance.isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingTypes ? "Loading..." : "Select type"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {maintenanceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="odoMeterReading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Odometer Reading</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} disabled={addMaintenance.isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Date</FormLabel>
                      <FormControl>
                        <Input type="date" max={new Date().toISOString().split("T")[0]} disabled={addMaintenance.isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Work performed or issue reported" disabled={addMaintenance.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="serviceVendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="Workshop, mechanic, or vendor name" disabled={addMaintenance.isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="estimatedCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Amount</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" disabled={addMaintenance.isPending} {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>


            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={addMaintenance.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMaintenance.isPending || isLoadingTypes}>
                {addMaintenance.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Maintenance"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
