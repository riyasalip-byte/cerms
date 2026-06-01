import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Briefcase,
  FileText,
  HardHat,
  Loader2,
  Phone,
  Save,
  UserPlus,
  Wrench,
  Upload,
  CheckCircle2,
  Eye,
  Trash2,
} from "lucide-react"
import { uploadDocument } from "@/api/staff"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  useAssetClasses,
  useCreateStaff,
  useStaff,
  useUpdateStaff,
} from "@/hooks/useStaff"

const employeeCategoryToValue: Record<string | number, string> = {
  "Operator": "0",
  "OfficeStaff": "1",
  "Office Staff": "1",
  "Manager": "2",
  "Mechanic": "3",
  "Helper": "4",
  "Other": "5",
  0: "0",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
}

const employmentStatusToValue: Record<string | number, string> = {
  "Active": "0",
  "Inactive": "1",
  "Suspended": "2",
  "Resigned": "3",
  0: "0",
  1: "1",
  2: "2",
  3: "3",
}

const employeeCategoryLabels: Record<number, string> = {
  0: "Operator",
  1: "Office Staff",
  2: "Manager",
  3: "Mechanic",
  4: "Helper",
  5: "Other",
}

const employmentStatusLabels: Record<number, string> = {
  0: "Active",
  1: "Inactive",
  2: "Suspended",
  3: "Resigned",
}

const staffFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    displayName: z.string().trim().min(1, "Display name is required."),
    gender: z.string().trim().min(1, "Gender is required."),
    dateOfBirth: z.string().min(1, "Date of birth is required."),
    mobileNo: z.string().trim().min(1, "Mobile number is required."),
    alternateMobileNo: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .refine((val) => z.string().email().safeParse(val).success, {
        message: "Invalid email address.",
      }),
    addressLine1: z.string().trim().min(1, "Address line 1 is required."),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required."),
    state: z.string().trim().min(1, "State is required."),
    pincode: z.string().trim().min(1, "Pincode is required."),
    emergencyContactName: z.string().trim().min(1, "Emergency contact name is required."),
    emergencyContactNumber: z.string().trim().min(1, "Emergency contact number is required."),
    employeeCategory: z.enum(["0", "1", "2", "3", "4", "5"]),
    joiningDate: z.string().min(1, "Joining date is required."),
    relievingDate: z.string().optional(),
    employmentStatus: z.enum(["0", "1", "2", "3"]),
    designation: z.string().trim().min(1, "Designation is required."),
    department: z.string().trim().optional(),
    licenseNumber: z.string().trim().optional(),
    licenseCategory: z.string().trim().optional(),
    licenseExpiryDate: z.string().optional(),
    experienceYears: z.coerce.number().min(0).optional(),
    operatorGrade: z.string().trim().optional(),
    dailyWage: z.coerce.number().min(0).optional(),
    salary: z.coerce.number().min(0).optional(),
    aadhaarNo: z.string().trim().optional(),
    panNo: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    licenseDocumentUrl: z.string().trim().optional(),
    idProofUrl: z.string().trim().optional(),
    allowedAssetClassIds: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.employeeCategory === "0") {
      if (!data.licenseNumber?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "License number is required for operators.",
          path: ["licenseNumber"],
        })
      }
      if (!data.licenseCategory?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "License category is required for operators.",
          path: ["licenseCategory"],
        })
      }
      if (!data.licenseExpiryDate?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "License expiry date is required for operators.",
          path: ["licenseExpiryDate"],
        })
      }
    }
  })

type StaffFormValues = z.infer<typeof staffFormSchema>

const defaultValues: StaffFormValues = {
  firstName: "",
  lastName: "",
  displayName: "",
  gender: "",
  dateOfBirth: "",
  mobileNo: "",
  alternateMobileNo: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  employeeCategory: "1",
  joiningDate: "",
  relievingDate: "",
  employmentStatus: "0",
  designation: "",
  department: "",
  licenseNumber: "",
  licenseCategory: "",
  licenseExpiryDate: "",
  experienceYears: undefined,
  operatorGrade: "",
  dailyWage: undefined,
  salary: undefined,
  aadhaarNo: "",
  panNo: "",
  remarks: "",
  licenseDocumentUrl: "",
  idProofUrl: "",
  allowedAssetClassIds: [],
}

export function StaffFormPage() {
  const navigate = useNavigate()
  const { id: staffId = "" } = useParams()
  const isEditMode = Boolean(staffId)
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace("/api/v1", "")

  const { data: existingStaff, isLoading: isStaffLoading } = useStaff(staffId)
  const { data: assetClasses = [] } = useAssetClasses()
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema) as any,
    defaultValues,
    mode: "onChange",
  })

  const watchCategory = form.watch("employeeCategory")
  const isOperator = watchCategory === "0"

  React.useEffect(() => {
    if (!existingStaff) return

    form.reset({
      firstName: existingStaff.firstName ?? "",
      lastName: existingStaff.lastName ?? "",
      displayName: existingStaff.displayName ?? "",
      gender: existingStaff.gender ?? "",
      dateOfBirth: toDateInputValue(existingStaff.dateOfBirth),
      mobileNo: existingStaff.mobileNo ?? "",
      alternateMobileNo: existingStaff.alternateMobileNo ?? "",
      email: existingStaff.email ?? "",
      addressLine1: existingStaff.addressLine1 ?? "",
      addressLine2: existingStaff.addressLine2 ?? "",
      city: existingStaff.city ?? "",
      state: existingStaff.state ?? "",
      pincode: existingStaff.pincode ?? "",
      emergencyContactName: existingStaff.emergencyContactName ?? "",
      emergencyContactNumber: existingStaff.emergencyContactNumber ?? "",
      employeeCategory: (employeeCategoryToValue[existingStaff.employeeCategory] ?? "1") as StaffFormValues["employeeCategory"],
      joiningDate: toDateInputValue(existingStaff.joiningDate),
      relievingDate: existingStaff.relievingDate ? toDateInputValue(existingStaff.relievingDate) : "",
      employmentStatus: (employmentStatusToValue[existingStaff.employmentStatus] ?? "0") as StaffFormValues["employmentStatus"],
      designation: existingStaff.designation ?? "",
      department: existingStaff.department ?? "",
      licenseNumber: existingStaff.licenseNumber ?? "",
      licenseCategory: existingStaff.licenseCategory ?? "",
      licenseExpiryDate: existingStaff.licenseExpiryDate
        ? toDateInputValue(existingStaff.licenseExpiryDate)
        : "",
      experienceYears: existingStaff.experienceYears ?? undefined,
      operatorGrade: existingStaff.operatorGrade ?? "",
      dailyWage: existingStaff.dailyWage ?? undefined,
      salary: existingStaff.salary ?? undefined,
      aadhaarNo: existingStaff.aadhaarNo ?? "",
      panNo: existingStaff.panNo ?? "",
      remarks: existingStaff.remarks ?? "",
      licenseDocumentUrl: existingStaff.licenseDocumentUrl ?? "",
      idProofUrl: existingStaff.idProofUrl ?? "",
      allowedAssetClassIds: existingStaff.allowedAssetClasses?.map((ac) => ac.id) ?? [],
    })
  }, [existingStaff, form])

  const [isUploadingLicense, setIsUploadingLicense] = React.useState(false)
  const [isUploadingId, setIsUploadingId] = React.useState(false)

  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingLicense(true)
    try {
      const url = await uploadDocument(file)
      form.setValue("licenseDocumentUrl", url)
      toast.success("License document uploaded successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to upload license document")
    } finally {
      setIsUploadingLicense(false)
    }
  }

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingId(true)
    try {
      const url = await uploadDocument(file)
      form.setValue("idProofUrl", url)
      toast.success("ID proof document uploaded successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to upload ID proof document")
    } finally {
      setIsUploadingId(false)
    }
  }

  const isSaving = createStaff.isPending || updateStaff.isPending

  async function onSubmit(values: StaffFormValues) {
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      displayName: values.displayName.trim(),
      gender: values.gender.trim(),
      dateOfBirth: values.dateOfBirth,
      mobileNo: values.mobileNo.trim(),
      alternateMobileNo: normalizeOptional(values.alternateMobileNo),
      email: values.email.trim(),
      addressLine1: values.addressLine1.trim(),
      addressLine2: normalizeOptional(values.addressLine2),
      city: values.city.trim(),
      state: values.state.trim(),
      pincode: values.pincode.trim(),
      emergencyContactName: values.emergencyContactName.trim(),
      emergencyContactNumber: values.emergencyContactNumber.trim(),
      employeeCategory: Number(values.employeeCategory),
      joiningDate: values.joiningDate,
      relievingDate: normalizeOptional(values.relievingDate),
      employmentStatus: Number(values.employmentStatus),
      designation: values.designation.trim(),
      department: "General",
      licenseNumber: isOperator ? normalizeOptional(values.licenseNumber) : null,
      licenseCategory: isOperator ? normalizeOptional(values.licenseCategory) : null,
      licenseExpiryDate: isOperator ? normalizeOptional(values.licenseExpiryDate) : null,
      experienceYears: isOperator ? values.experienceYears ?? null : null,
      operatorGrade: isOperator ? normalizeOptional(values.operatorGrade) : null,
      dailyWage: isOperator ? values.dailyWage ?? null : null,
      salary: values.salary ?? null,
      aadhaarNo: normalizeOptional(values.aadhaarNo),
      panNo: normalizeOptional(values.panNo),
      remarks: normalizeOptional(values.remarks),
      licenseDocumentUrl: normalizeOptional(values.licenseDocumentUrl),
      idProofUrl: normalizeOptional(values.idProofUrl),
      allowedAssetClassIds: values.allowedAssetClassIds,
    }

    if (isEditMode) {
      await updateStaff.mutateAsync({
        id: staffId,
        data: { id: staffId, ...payload },
      })
    } else {
      await createStaff.mutateAsync(payload)
    }

    navigate("/staff", { replace: true })
  }

  const onInvalid = (errors: any) => {
    console.warn("Validation errors:", errors)
    toast.error("Please fill in all mandatory fields correctly.")
  }

  if (isEditMode && isStaffLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            {isEditMode ? "Edit Staff" : "New Staff"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditMode
              ? `Update profile and employment details for ${existingStaff?.displayName ?? "staff member"}.`
              : "Register a new staff member with contact, employment, and license information."}
          </p>
        </div>
        <Button variant="outline" asChild className="font-semibold border-slate-200">
          <Link to="/staff">Back to Staff</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any, onInvalid)} className="space-y-6">
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="size-5" />
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </div>
              <CardDescription>Personal details and identification.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
              {isEditMode && (
                <FormItem>
                  <FormLabel className="font-bold text-muted-foreground">Staff Code</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      value={existingStaff?.staffCode ?? ""}
                      className="bg-slate-50 dark:bg-slate-900/50 font-mono font-bold"
                    />
                  </FormControl>
                </FormItem>
              )}

              <FormField
                control={form.control as any}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Display name" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Gender</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="aadhaarNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Aadhaar No</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="panNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">PAN No</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Phone className="size-5" />
                <CardTitle className="text-lg">Contact</CardTitle>
              </div>
              <CardDescription>Communication and emergency contact details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2">
              <FormField
                control={form.control as any}
                name="mobileNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Mobile No</FormLabel>
                    <FormControl>
                      <Input placeholder="Primary mobile" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="alternateMobileNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Alternate Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold">Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold">Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">City</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">State</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Pincode</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Emergency Contact Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="emergencyContactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Emergency Contact Number</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Briefcase className="size-5" />
                <CardTitle className="text-lg">Employment</CardTitle>
              </div>
              <CardDescription>Role, department, and employment status.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control as any}
                name="employeeCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Employee Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(employeeCategoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Job title" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="joiningDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Joining Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="relievingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Relieving Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="employmentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Employment Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(employmentStatusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Salary</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="Monthly salary" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="remarks"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 lg:col-span-3">
                    <FormLabel className="font-bold">Remarks</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Internal notes..."
                        className={cn(
                          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
                          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border-muted",
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {isOperator && (
            <Card className="shadow-sm border-amber-200 bg-amber-50/5 dark:bg-amber-950/5 border animate-in slide-in-from-top duration-300">
              <CardHeader className="bg-amber-100/20 border-b pb-4">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <HardHat className="size-5" />
                  <CardTitle className="text-lg">Operator Details</CardTitle>
                </div>
                <CardDescription className="text-amber-900/60 dark:text-amber-400/60">
                  License and operator-specific information (required for operators).
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control as any}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-amber-800 dark:text-amber-300">License Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="License number" {...field} className="h-10 border-amber-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="licenseCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-amber-800 dark:text-amber-300">License Category *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Heavy Equipment" {...field} className="h-10 border-amber-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="licenseExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-amber-800 dark:text-amber-300">License Expiry *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-10 border-amber-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-amber-800 dark:text-amber-300">Experience (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="0" {...field} className="h-10 border-amber-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="operatorGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-amber-800 dark:text-amber-300">Operator Grade</FormLabel>
                      <FormControl>
                        <Input placeholder="Grade" {...field} className="h-10 border-amber-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="dailyWage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-amber-800 dark:text-amber-300">Daily Wage</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" min="0" {...field} className="h-10 border-amber-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Wrench className="size-5" />
                <CardTitle className="text-lg">Allowed Asset Classes</CardTitle>
              </div>
              <CardDescription>Select equipment categories this staff member may operate.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FormField
                control={form.control as any}
                name="allowedAssetClassIds"
                render={() => (
                  <FormItem>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {assetClasses.filter((ac) => ac.isActive).map((assetClass) => (
                        <FormField
                          key={assetClass.id}
                          control={form.control as any}
                          name="allowedAssetClassIds"
                          render={({ field }) => (
                            <FormItem className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(assetClass.id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? []
                                    field.onChange(
                                      checked
                                        ? [...current, assetClass.id]
                                        : current.filter((id) => id !== assetClass.id),
                                    )
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-0.5 leading-none">
                                <FormLabel className="font-semibold cursor-pointer">
                                  {assetClass.name}
                                </FormLabel>
                                {assetClass.description && (
                                  <FormDescription className="text-xs">
                                    {assetClass.description}
                                  </FormDescription>
                                )}
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    {assetClasses.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No asset classes available.</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
              <CardTitle className="text-lg">Documents</CardTitle>
              <CardDescription>Upload license and identification documents.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* License Document Upload */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-6 bg-slate-50/50 dark:bg-slate-900/5 hover:bg-slate-100/50 dark:hover:bg-slate-900/10 transition-colors relative">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">License Document</p>
                  
                  {form.watch("licenseDocumentUrl") ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold">
                        <CheckCircle2 className="size-4" />
                        <span>Uploaded</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 font-semibold text-slate-700 border-slate-200"
                          onClick={() => window.open(`${apiBase}${form.watch("licenseDocumentUrl")}`, "_blank")}
                        >
                          <Eye className="size-3.5 mr-1.5" />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => form.setValue("licenseDocumentUrl", "")}
                        >
                          <Trash2 className="size-3.5 mr-1.5" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 text-slate-400">
                        <Upload className="size-5" />
                      </div>
                      <label className="cursor-pointer">
                        <span className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground shadow transition-colors hover:bg-primary/95">
                          {isUploadingLicense ? (
                            <>
                              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Select File"
                          )}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleLicenseUpload}
                          disabled={isUploadingLicense}
                        />
                      </label>
                      <p className="text-[10px] text-muted-foreground">PDF, PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>

                {/* ID Proof Upload */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-6 bg-slate-50/50 dark:bg-slate-900/5 hover:bg-slate-100/50 dark:hover:bg-slate-900/10 transition-colors relative">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">ID Proof Document</p>
                  
                  {form.watch("idProofUrl") ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold">
                        <CheckCircle2 className="size-4" />
                        <span>Uploaded</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 font-semibold text-slate-700 border-slate-200"
                          onClick={() => window.open(`${apiBase}${form.watch("idProofUrl")}`, "_blank")}
                        >
                          <Eye className="size-3.5 mr-1.5" />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => form.setValue("idProofUrl", "")}
                        >
                          <Trash2 className="size-3.5 mr-1.5" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 text-slate-400">
                        <Upload className="size-5" />
                      </div>
                      <label className="cursor-pointer">
                        <span className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground shadow transition-colors hover:bg-primary/95">
                          {isUploadingId ? (
                            <>
                              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Select File"
                          )}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleIdUpload}
                          disabled={isUploadingId}
                        />
                      </label>
                      <p className="text-[10px] text-muted-foreground">PDF, PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/staff")}
              disabled={isSaving}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="font-bold bg-primary shadow-md">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {isEditMode ? <Save className="mr-2 size-4" /> : <UserPlus className="mr-2 size-4" />}
                  {isEditMode ? "Save Changes" : "Create Staff"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

function normalizeOptional(value?: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toDateInputValue(value: string) {
  if (!value) return ""
  return value.split("T")[0]
}
