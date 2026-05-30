import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Edit2,
  HardHat,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Power,
  ShieldCheck,
  ShieldAlert,
  UserRound,
  Wrench,
  Calendar,
  FileText,
  Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorState } from "@/components/shared/ErrorState"
import { useDeactivateStaff, useStaff } from "@/hooks/useStaff"

const employeeCategoryLabels: Record<string | number, string> = {
  0: "Operator",
  1: "Office Staff",
  2: "Manager",
  3: "Mechanic",
  4: "Helper",
  5: "Other",
  "0": "Operator",
  "1": "Office Staff",
  "2": "Manager",
  "3": "Mechanic",
  "4": "Helper",
  "5": "Other",
  "Operator": "Operator",
  "OfficeStaff": "Office Staff",
  "Office Staff": "Office Staff",
  "Manager": "Manager",
  "Mechanic": "Mechanic",
  "Helper": "Helper",
  "Other": "Other",
}

const employmentStatusLabels: Record<string | number, string> = {
  0: "Active",
  1: "Inactive",
  2: "Suspended",
  3: "Resigned",
  "0": "Active",
  "1": "Inactive",
  "2": "Suspended",
  "3": "Resigned",
  "Active": "Active",
  "Inactive": "Inactive",
  "Suspended": "Suspended",
  "Resigned": "Resigned",
}

const statusClasses: Record<string | number, string> = {
  0: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  1: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  3: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "0": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "1": "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "2": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "3": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "Active": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Inactive": "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "Suspended": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Resigned": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
}

export function StaffDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const { data: staff, isLoading, isError, refetch } = useStaff(id)
  const deactivateStaff = useDeactivateStaff()

  const handleDeactivate = async () => {
    if (!id || !window.confirm("Are you sure you want to deactivate this staff member?")) return
    await deactivateStaff.mutateAsync(id)
    navigate("/staff")
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !staff) {
    return (
      <ErrorState
        onRetry={refetch}
        message="We encountered an issue loading this staff record."
      />
    )
  }

  const isOperator = staff.employeeCategory === 0 || staff.employeeCategory === "0" || staff.employeeCategory === "Operator"
  const isActive = staff.employmentStatus === 0 || staff.employmentStatus === "0" || staff.employmentStatus === "Active"

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div className="flex items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-700 shadow-md shrink-0 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            {isOperator ? <HardHat className="size-8" /> : <UserRound className="size-8" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {staff.displayName}
              </h1>
              <Badge variant="secondary">
                {employeeCategoryLabels[staff.employeeCategory] ?? "Unknown"}
              </Badge>
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                  statusClasses[staff.employmentStatus] ?? statusClasses[1],
                ].join(" ")}
              >
                {isActive ? <ShieldCheck className="size-3.5" /> : <ShieldAlert className="size-3.5" />}
                {employmentStatusLabels[staff.employmentStatus] ?? "Unknown"}
              </span>
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-0.5">
              Code: <span className="font-bold text-slate-700 dark:text-slate-300">{staff.staffCode}</span>
              {" · "}
              {staff.designation}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild className="font-semibold">
            <Link to="/staff">
              <ArrowLeft className="mr-2 size-4" />
              Back to List
            </Link>
          </Button>
          <Button variant="outline" asChild className="font-semibold">
            <Link to={`/staff/${staff.id}/edit`}>
              <Edit2 className="mr-2 size-4 text-primary" />
              Edit Staff
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeactivate}
            disabled={!isActive || deactivateStaff.isPending}
            className="font-semibold"
          >
            {deactivateStaff.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Power className="mr-2 size-4" />
            )}
            Deactivate
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm border-muted">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Personal and employment information.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <DetailRow label="Full Name" value={`${staff.firstName} ${staff.lastName}`} />
            <DetailRow label="Gender" value={staff.gender} />
            <DetailRow label="Date of Birth" value={formatDate(staff.dateOfBirth)} />
            <DetailRow label="Department" value={staff.department} />
            <DetailRow label="Joining Date" value={formatDate(staff.joiningDate)} />
            {staff.relievingDate && (
              <DetailRow label="Relieving Date" value={formatDate(staff.relievingDate)} />
            )}
            {staff.salary != null && (
              <DetailRow label="Salary" value={formatCurrency(staff.salary)} />
            )}
            {staff.hasUserAccount && (
              <DetailRow label="User Account" value="Linked" valueClass="text-emerald-600" />
            )}
            {staff.remarks && (
              <DetailRow label="Remarks" value={staff.remarks} valueClass="italic text-sm font-normal" />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-muted">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
            <CardTitle className="text-lg">Contact</CardTitle>
            <CardDescription>Communication details.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <ContactRow icon={Phone} label="Mobile" value={staff.mobileNo} />
            {staff.alternateMobileNo && (
              <ContactRow icon={Phone} label="Alternate Mobile" value={staff.alternateMobileNo} />
            )}
            <ContactRow icon={Mail} label="Email" value={staff.email} />
            <ContactRow
              icon={MapPin}
              label="Address"
              value={
                <div>
                  <p>{staff.addressLine1}</p>
                  {staff.addressLine2 && <p className="text-xs text-muted-foreground">{staff.addressLine2}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[staff.city, staff.state, staff.pincode].filter(Boolean).join(", ")}
                  </p>
                </div>
              }
            />
            <ContactRow
              icon={UserRound}
              label="Emergency Contact"
              value={`${staff.emergencyContactName} · ${staff.emergencyContactNumber}`}
            />
          </CardContent>
        </Card>
      </div>

      {(isOperator || staff.licenseNumber) && (
        <Card className="shadow-sm border-amber-200 bg-amber-50/5 dark:bg-amber-950/5">
          <CardHeader className="bg-amber-100/20 border-b pb-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <HardHat className="size-5" />
              <CardTitle className="text-lg">License Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailRow label="License Number" value={staff.licenseNumber ?? "-"} valueClass="font-mono" />
              <DetailRow label="License Category" value={staff.licenseCategory ?? "-"} />
              <DetailRow
                label="Expiry Date"
                value={staff.licenseExpiryDate ? formatDate(staff.licenseExpiryDate) : "-"}
              />
              {staff.experienceYears != null && (
                <DetailRow label="Experience" value={`${staff.experienceYears} years`} />
              )}
              {staff.operatorGrade && (
                <DetailRow label="Operator Grade" value={staff.operatorGrade} />
              )}
              {staff.dailyWage != null && (
                <DetailRow label="Daily Wage" value={formatCurrency(staff.dailyWage)} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-muted">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
          <div className="flex items-center gap-2">
            <Wrench className="size-5 text-primary" />
            <CardTitle className="text-lg">Allowed Asset Classes</CardTitle>
          </div>
          <CardDescription>Equipment categories this staff member is authorized to operate.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {staff.allowedAssetClasses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {staff.allowedAssetClasses.map((ac) => (
                <Badge key={ac.id} variant="outline" className="px-3 py-1">
                  {ac.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No asset classes assigned.</p>
          )}
        </CardContent>
      </Card>

      {(staff.licenseDocumentUrl || staff.idProofUrl) && (
        <Card className="shadow-sm border-muted">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <CardTitle className="text-lg">Uploaded Documents</CardTitle>
            </div>
            <CardDescription>Click to view uploaded credential or identification documents.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {staff.licenseDocumentUrl && (
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/30 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-amber-50 dark:bg-amber-950/20 p-2.5 text-amber-500 border border-amber-100 dark:border-amber-900/30">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">License Document</p>
                      <p className="text-xs text-muted-foreground">Uploaded credential</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold border-slate-200 text-slate-700 hover:text-primary dark:text-slate-300"
                    onClick={() => window.open(`http://localhost:5000${staff.licenseDocumentUrl}`, "_blank")}
                  >
                    <Eye className="size-3.5 mr-1.5" />
                    View Document
                  </Button>
                </div>
              )}
              {staff.idProofUrl && (
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/30 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 dark:bg-blue-950/20 p-2.5 text-blue-500 border border-blue-100 dark:border-blue-900/30">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">ID Proof Document</p>
                      <p className="text-xs text-muted-foreground">Uploaded identity proof</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold border-slate-200 text-slate-700 hover:text-primary dark:text-slate-300"
                    onClick={() => window.open(`http://localhost:5000${staff.idProofUrl}`, "_blank")}
                  >
                    <Eye className="size-3.5 mr-1.5" />
                    View Document
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-muted border-dashed">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            <CardTitle className="text-lg">Assignments</CardTitle>
          </div>
          <CardDescription>Rental and dispatch assignment history.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground italic">
            Assignment timeline placeholder. Integrate with dispatch records in a future iteration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailRow({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0 border-muted">
      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider shrink-0">
        {label}
      </span>
      <span
        className={[
          "text-sm font-bold text-slate-900 dark:text-slate-100 text-right ml-4",
          valueClass,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50/50 border border-slate-100 dark:bg-slate-900/10 dark:border-slate-900/40 p-4">
      <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900/60 text-muted-foreground shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="mt-1 font-semibold text-slate-800 dark:text-slate-200 text-sm">{value}</div>
      </div>
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(value)
}
