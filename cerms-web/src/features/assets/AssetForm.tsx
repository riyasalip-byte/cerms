import * as React from "react"
import { useAsset, useAssetCategories, useCreateAsset, useUpdateAsset } from "@/hooks/useAssets"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm, useWatch } from "react-hook-form"
import type { Control, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Save } from "lucide-react"

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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().optional()
)

const assetFormSchema = z.object({
  assetCode: z.string().optional(),
  assetName: z.string().min(2, "Asset name must be at least 2 characters."),
  assetCategoryId: z.string().min(1, "Asset category is required."),
  currentMeterReading: z.coerce.number().min(0, "Meter reading cannot be negative."),
  registerNo: z.string().min(1, "Register number is required."),
  fitnessExpiryDate: z.string().min(1, "Fitness expiry date is required."),
  insuranceExpiryDate: z.string().min(1, "Insurance expiry date is required."),
  puccExpiryDate: z.string().min(1, "PUCC expiry date is required."),
  status: z.coerce.number(),
  purchaseDate: z.string().optional(),
  makeYear: optionalNumber,
  model: z.string().optional(),
  engineNo: z.string().optional(),
  chasisNo: z.string().optional(),
  placeOfRegistration: z.string().optional(),
  registerDate: z.string().optional(),
  insuranceCompany: z.string().optional(),
  insuranceNo: z.string().optional(),
  isTransportationRequired: z.boolean().default(false),
  transportationNotes: z.string().optional(),
})

type AssetFormValues = z.infer<typeof assetFormSchema>
const assetFormResolver = zodResolver(assetFormSchema) as unknown as Resolver<AssetFormValues>

const statusNameToValue = {
  available: 0,
  rented: 1,
  maintenance: 2,
  decommissioned: 3,
} as const

const toIsoDate = (value?: string) => value ? new Date(value).toISOString() : undefined
const toDateInput = (value?: string) => value ? new Date(value).toISOString().split("T")[0] : ""
const fromDate = (date?: Date) => date ? format(date, "yyyy-MM-dd") : ""
const parseDate = (value?: string) => value ? new Date(`${value}T00:00:00`) : undefined
const normalizeEnumKey = (value: string) => value.replace(/[\s/_-]/g, "").toLowerCase()

function toNumberValue(value: unknown, fallback = 0) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function toAssetStatusValue(value: unknown) {
  if (typeof value === "string") {
    const key = normalizeEnumKey(value)
    return statusNameToValue[key as keyof typeof statusNameToValue] ?? toNumberValue(value)
  }

  return toNumberValue(value)
}

function RequiredMark() {
  return <span className="text-destructive">*</span>
}

type SectionCardProps = {
  title: string
  description?: string
  children: React.ReactNode
}

function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-6 p-5 sm:grid-cols-2 xl:grid-cols-4">
        {children}
      </CardContent>
    </Card>
  )
}

type FieldLabelProps = {
  children: React.ReactNode
  required?: boolean
}

function FieldLabel({ children, required }: FieldLabelProps) {
  return (
    <FormLabel className="gap-1">
      {children} {required ? <RequiredMark /> : null}
    </FormLabel>
  )
}

type DateFieldProps = {
  control: Control<AssetFormValues>
  name: "purchaseDate" | "registerDate" | "fitnessExpiryDate" | "insuranceExpiryDate" | "puccExpiryDate"
  label: string
  required?: boolean
  disabled?: boolean
}

function DateField({ control, name, label, required, disabled }: DateFieldProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const calendarStartMonth = React.useMemo(() => new Date(1950, 0), [])
  const calendarEndMonth = React.useMemo(() => {
    const nextTwentyYears = new Date().getFullYear() + 20
    return new Date(nextTwentyYears, 11)
  }, [])

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FieldLabel required={required}>{label}</FieldLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input
                type="date"
                value={field.value || ""}
                onChange={(event) => field.onChange(event.target.value)}
                disabled={disabled}
                className={cn(!field.value && "text-muted-foreground")}
              />
            </FormControl>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="icon" disabled={disabled}>
                  <CalendarIcon className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parseDate(field.value)}
                  onSelect={(date) => {
                    field.onChange(fromDate(date))
                    setIsOpen(false)
                  }}
                  captionLayout="dropdown"
                  startMonth={calendarStartMonth}
                  endMonth={calendarEndMonth}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function AssetForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const { data: existingAsset, isLoading } = useAsset(id!)
  const { data: assetCategories = [], isLoading: isLoadingCategories } = useAssetCategories()
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()
  const isSaving = createAsset.isPending || updateAsset.isPending

  const form = useForm<AssetFormValues>({
    resolver: assetFormResolver,
    mode: "onChange",
    defaultValues: {
      assetCode: "",
      assetName: "",
      assetCategoryId: "",
      currentMeterReading: 0,
      registerNo: "",
      fitnessExpiryDate: "",
      insuranceExpiryDate: "",
      puccExpiryDate: "",
      status: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
      makeYear: undefined,
      model: "",
      engineNo: "",
      chasisNo: "",
      placeOfRegistration: "",
      registerDate: "",
      insuranceCompany: "",
      insuranceNo: "",
      isTransportationRequired: false,
      transportationNotes: "",
    },
  })
  const isTransportationRequired = useWatch({
    control: form.control,
    name: "isTransportationRequired",
  })
  const categoryOptions = React.useMemo(() => {
    if (
      existingAsset?.assetCategoryId &&
      existingAsset.assetCategoryName &&
      !assetCategories.some((category) => category.id === existingAsset.assetCategoryId)
    ) {
      return [
        ...assetCategories,
        {
          id: existingAsset.assetCategoryId,
          name: existingAsset.assetCategoryName,
          isTransportationRequiredByDefault: existingAsset.isTransportationRequired ?? false,
        },
      ]
    }

    return assetCategories
  }, [assetCategories, existingAsset])

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [form.formState.isDirty])

  React.useEffect(() => {
    if (existingAsset) {
      form.reset({
        assetCode: existingAsset.assetCode ?? "",
        assetName: existingAsset.assetName,
        assetCategoryId: existingAsset.assetCategoryId ?? "",
        currentMeterReading: existingAsset.currentMeterReading,
        registerNo: existingAsset.registerNo,
        fitnessExpiryDate: toDateInput(existingAsset.fitnessExpiryDate),
        insuranceExpiryDate: toDateInput(existingAsset.insuranceExpiryDate),
        puccExpiryDate: toDateInput(existingAsset.puccExpiryDate),
        status: toAssetStatusValue(existingAsset.status),
        purchaseDate: toDateInput(existingAsset.purchaseDate),
        makeYear: existingAsset.makeYear,
        model: existingAsset.model ?? "",
        engineNo: existingAsset.engineNo ?? "",
        chasisNo: existingAsset.chasisNo ?? "",
        placeOfRegistration: existingAsset.placeOfRegistration ?? "",
        registerDate: toDateInput(existingAsset.registerDate),
        insuranceCompany: existingAsset.insuranceCompany ?? "",
        insuranceNo: existingAsset.insuranceNo ?? "",
        isTransportationRequired: existingAsset.isTransportationRequired ?? false,
        transportationNotes: existingAsset.transportationNotes ?? "",
      })
    }
  }, [existingAsset, form])

  function onInvalidSubmit() {
    const firstError = Object.values(form.formState.errors)[0]
    const message = firstError?.message
    toast.error(typeof message === "string" ? message : "Please review the highlighted fields.")
  }

  async function onSubmit(data: AssetFormValues) {
    const payload = {
      assetName: data.assetName,
      assetCategoryId: data.assetCategoryId,
      currentMeterReading: data.currentMeterReading,
      registerNo: data.registerNo,
      fitnessExpiryDate: toIsoDate(data.fitnessExpiryDate),
      insuranceExpiryDate: toIsoDate(data.insuranceExpiryDate),
      puccExpiryDate: toIsoDate(data.puccExpiryDate),
      purchaseDate: toIsoDate(data.purchaseDate),
      makeYear: data.makeYear,
      model: data.model || undefined,
      engineNo: data.engineNo || undefined,
      chasisNo: data.chasisNo || undefined,
      placeOfRegistration: data.placeOfRegistration || undefined,
      registerDate: toIsoDate(data.registerDate),
      insuranceCompany: data.insuranceCompany || undefined,
      insuranceNo: data.insuranceNo || undefined,
      isTransportationRequired: data.isTransportationRequired,
      transportationNotes: data.isTransportationRequired ? data.transportationNotes : undefined,
    }

    if (isEditMode) {
      await updateAsset.mutateAsync({
        id: id!,
        data: {
          ...payload,
          id: id!,
          status: data.status,
        },
      })
    } else {
      await createAsset.mutateAsync(payload)
    }

    form.reset(data)
    navigate("/assets")
  }

  if (isEditMode && isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
        </div>
        <Card className="shadow-sm">
          <CardContent className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Asset" : "New Asset"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update the asset record with current operational, registration, and compliance details."
              : "Register a new asset with the details needed for operations and compliance tracking."}
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/assets">Back to List</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-6">
          <SectionCard
            title="Basic Info"
          >
            <FormField
              control={form.control}
              name="assetCode"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Asset Code</FieldLabel>
                  <FormControl>
                    <Input
                      readOnly
                      disabled
                      value={field.value || "Auto-generated on save"}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assetName"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel required>Asset Name</FieldLabel>
                  <FormControl>
                    <Input placeholder="e.g. Caterpillar Excavator 320" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assetCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel required>Asset Category</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)

                      const selectedCategory = categoryOptions.find((category) => category.id === value)
                      if (selectedCategory?.isTransportationRequiredByDefault) {
                        form.setValue("isTransportationRequired", true, { shouldValidate: true, shouldDirty: true })
                      }
                    }}
                    value={field.value}
                    disabled={isSaving || isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DateField
              control={form.control}
              name="purchaseDate"
              label="Purchase Date"
              disabled={isEditMode || isSaving}
            />
          </SectionCard>

          <SectionCard
            title="Vehicle Details"
          >
            <FormField
              control={form.control}
              name="currentMeterReading"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel required>Current Meter Reading</FieldLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0" disabled={isSaving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="makeYear"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Make Year</FieldLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1900}
                      placeholder="2024"
                      disabled={isSaving}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Model</FieldLabel>
                  <FormControl>
                    <Input placeholder="e.g. 320D" disabled={isSaving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="engineNo"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Engine No</FieldLabel>
                  <FormControl>
                    <Input placeholder="Enter engine number" disabled={isSaving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chasisNo"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Chasis No</FieldLabel>
                  <FormControl>
                    <Input placeholder="Enter chasis number" disabled={isSaving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SectionCard>

          <SectionCard
            title="Registration"
          >
            <FormField
              control={form.control}
              name="placeOfRegistration"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Place of Registration</FieldLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ernakulam RTO" disabled={isSaving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registerNo"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel required>Register No</FieldLabel>
                  <FormControl>
                    <Input placeholder="e.g. KL-01-AB-1234" disabled={isSaving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DateField
              control={form.control}
              name="registerDate"
              label="Register Date"
              disabled={isSaving}
            />
          </SectionCard>

          <SectionCard
            title="Insurance & Compliance"
          >
            <DateField
              control={form.control}
              name="fitnessExpiryDate"
              label="Fitness Expiry Date"
              required
              disabled={isSaving}
            />

            <FormField
              control={form.control}
              name="insuranceCompany"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Insurance Company</FieldLabel>
                  <FormControl>
                    <Input placeholder="e.g. National Insurance" disabled={isSaving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insuranceNo"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel>Insurance No</FieldLabel>
                  <FormControl>
                    <Input placeholder="Enter policy number" disabled={isSaving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DateField
              control={form.control}
              name="insuranceExpiryDate"
              label="Insurance Expiry Date"
              required
              disabled={isSaving}
            />

            <DateField
              control={form.control}
              name="puccExpiryDate"
              label="PUCC Expiry Date"
              required
              disabled={isSaving}
            />
          </SectionCard>

          <SectionCard
            title="Transportation"
          >
            <FormField
              control={form.control}
              name="isTransportationRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm sm:col-span-2 xl:col-span-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Transportation Required
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {isTransportationRequired && (
              <FormField
                control={form.control}
                name="transportationNotes"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 xl:col-span-4">
                    <FieldLabel>Transportation Notes</FieldLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. Requires trailer transport or low-bed vehicle" 
                        disabled={isSaving} 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </SectionCard>

          <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:p-0">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/assets")}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    {isEditMode ? "Update Asset" : "Create Asset"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

    </div>
  )
}
