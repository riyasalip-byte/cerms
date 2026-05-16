import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Edit2,
  FileCheck2,
  Gauge,
  History,
  Landmark,
  MoreVertical,
  ShieldCheck,
  Trash2,
  Truck,
  Wrench,
} from "lucide-react"

import { ErrorState } from "@/components/shared/ErrorState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAsset, useCompleteMaintenance, useDeleteAsset } from "@/hooks/useAssets"
import { cn } from "@/lib/utils"
import { MaintenanceCloseDialog } from "./MaintenanceCloseDialog"
import { MaintenanceDialog } from "./MaintenanceDialog"
import type { MaintenanceRecordDto } from "@/api/assets"

const assetCategoryLabels = [
  "Excavator",
  "Mini Excavator",
  "Backhoe Loader",
  "Light / Medium Duty Tipper",
  "Heavy Duty Tipper",
] as const

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

function formatDate(value?: string | null) {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return dateFormatter.format(date)
}

function formatNumber(value?: number | null) {
  return Number(value ?? 0).toLocaleString("en-IN")
}

function getCategoryLabel(category: number | string) {
  if (typeof category === "number") {
    return assetCategoryLabels[category] ?? `Category ${category}`
  }

  return String(category)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
}

function getExpiryState(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const daysUntilExpiry = Math.ceil((date.getTime() - today.getTime()) / 86_400_000)

  if (daysUntilExpiry < 0) return { severity: "critical", label: "Expired", daysUntilExpiry }
  if (daysUntilExpiry <= 30) return { severity: "warning", label: "Expiring soon", daysUntilExpiry }

  return null
}

function ExpiryBadge({ date }: { date?: string | null }) {
  const state = getExpiryState(date)
  if (!state) return null

  return (
    <Badge
      variant="outline"
      className={cn(
        "w-fit px-2 py-0.5 text-xs font-bold",
        state.severity === "critical"
          ? "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20"
          : "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      )}
    >
      {state.label}
    </Badge>
  )
}

function InfoItem({
  label,
  value,
  icon: Icon,
  muted = false,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  muted?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </p>
      <div className={cn("font-semibold text-foreground", muted && "text-muted-foreground")}>
        {value || "-"}
      </div>
    </div>
  )
}

function ComplianceItem({
  label,
  date,
  description,
}: {
  label: string
  date?: string | null
  description: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-muted/70 bg-background p-4">
      <div className="space-y-1">
        <p className="font-bold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex min-w-[120px] flex-col items-end gap-1 text-right">
        <span className="font-semibold">{formatDate(date)}</span>
        <ExpiryBadge date={date} />
      </div>
    </div>
  )
}

export function AssetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: asset, isLoading, isError, refetch } = useAsset(id!)
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = React.useState(false)
  const [isMaintenanceCloseDialogOpen, setIsMaintenanceCloseDialogOpen] = React.useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = React.useState<MaintenanceRecordDto | null>(null)

  const deleteAsset = useDeleteAsset()
  const completeMaintenance = useCompleteMaintenance()

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isError || !asset) {
    return <ErrorState onRetry={refetch} message="We couldn't find the asset you're looking for." />
  }

  const expiryAlerts = [
    { label: "Fitness", date: asset.fitnessExpiryDate },
    { label: "Insurance", date: asset.insuranceExpiryDate },
    { label: "PUCC", date: asset.puccExpiryDate },
  ]
    .map((item) => ({ ...item, state: getExpiryState(item.date) }))
    .filter((item) => item.state)

  const isAssetInMaintenance = String(asset.status).toLowerCase() === "maintenance" || asset.status === 2;
  const activeMaintenanceRecord = asset.maintenanceRecords?.find(r => r.status === 0 || r.status === "Pending") || null;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this asset?")) {
      await deleteAsset.mutateAsync(id!)
      navigate("/assets")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/assets")}>
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-3xl font-bold tracking-tight">{asset.assetName}</h1>
              <StatusBadge status={asset.status} className="asset" />
            </div>
            <p className="font-mono text-sm font-semibold text-muted-foreground">{asset.assetCode}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAssetInMaintenance ? (
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedMaintenance(activeMaintenanceRecord)
                setIsMaintenanceCloseDialogOpen(true)
              }}
              disabled={!activeMaintenanceRecord}
            >
              <CheckCircle className="mr-2 size-4 text-emerald-500" />
              Complete Maintenance
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsMaintenanceDialogOpen(true)}>
              <Wrench className="mr-2 size-4 text-primary" />
              Add Maintenance
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={`/assets/${id}/edit`}>
              <Edit2 className="mr-2 size-4 text-primary" />
              Edit Asset
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="font-bold text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 size-4" />
                Delete Asset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {expiryAlerts.length > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          {expiryAlerts.map((alert) => (
            <div
              key={alert.label}
              className={cn(
                "rounded-lg border p-4",
                alert.state?.severity === "critical"
                  ? "border-destructive/30 bg-destructive/10"
                  : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{alert.label} expiry</p>
                  <p className="text-xs text-muted-foreground">{formatDate(alert.date)}</p>
                </div>
                <ExpiryBadge date={alert.date} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gauge className="size-5 text-primary" />
            Asset Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Category" value={getCategoryLabel(asset.assetCategory)} icon={ClipboardCheck} />
          <InfoItem label="Current Meter" value={`${formatNumber(asset.currentMeterReading)} units`} icon={Activity} />
          <InfoItem label="Service Interval" value={`${formatNumber(asset.serviceIntervalKm)} km`} icon={Wrench} />
          <InfoItem label="Maintenance Cost" value={currencyFormatter.format(asset.maintenanceCost ?? 0)} icon={History} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-muted/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="size-5 text-primary" />
              Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <InfoItem label="Make Year" value={asset.makeYear ?? "-"} />
            <InfoItem label="Model" value={asset.model || "-"} />
            <InfoItem label="Engine No" value={asset.engineNo || "-"} />
            <InfoItem label="Chasis No" value={asset.chasisNo || "-"} />
            <InfoItem label="Purchase Date" value={formatDate(asset.purchaseDate)} icon={Calendar} />
            <InfoItem label="Last Service Meter" value={`${formatNumber(asset.lastServiceOdometer)} units`} />
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Landmark className="size-5 text-primary" />
              Registration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <InfoItem label="Register No" value={asset.registerNo} />
            <InfoItem label="Register Date" value={formatDate(asset.registerDate)} icon={Calendar} />
            <InfoItem label="Registration Place" value={asset.placeOfRegistration || "-"} />
            <InfoItem label="Active Record" value={asset.isActive ? "Yes" : "No"} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="size-5 text-primary" />
            Transportation
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <InfoItem 
            label="Transportation Required" 
            value={
              <Badge variant={asset.isTransportationRequired ? "default" : "secondary"} className="flex w-fit items-center gap-1 font-semibold">
                {asset.isTransportationRequired ? <><Truck className="size-3" /> Yes</> : "No"}
              </Badge>
            } 
          />
          {asset.isTransportationRequired && (
            <InfoItem label="Transportation Notes" value={asset.transportationNotes || "No specific notes provided."} />
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="size-5 text-primary" />
            Insurance & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem label="Insurance Company" value={asset.insuranceCompany || "-"} />
            <InfoItem label="Insurance No" value={asset.insuranceNo || "-"} />
          </div>
          <Separator />
          <div className="grid gap-3 lg:grid-cols-3">
            <ComplianceItem label="Fitness Expiry" date={asset.fitnessExpiryDate} description="Vehicle fitness certificate" />
            <ComplianceItem label="Insurance Expiry" date={asset.insuranceExpiryDate} description="Insurance policy validity" />
            <ComplianceItem label="PUCC Expiry" date={asset.puccExpiryDate} description="Pollution certificate validity" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="size-5 text-primary" />
            Maintenance History
          </CardTitle>
          {isAssetInMaintenance ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setSelectedMaintenance(activeMaintenanceRecord)
                setIsMaintenanceCloseDialogOpen(true)
              }}
              disabled={!activeMaintenanceRecord}
            >
              <CheckCircle className="mr-2 size-3.5 text-emerald-500" />
              Complete
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsMaintenanceDialogOpen(true)}>
              <Wrench className="mr-2 size-3.5" />
              Add
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {asset.maintenanceRecords?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Odometer</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asset.maintenanceRecords
                  .slice()
                  .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
                  .map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{formatDate(record.serviceDate)}</TableCell>
                      <TableCell className="max-w-[360px]">
                        <p className="font-semibold">{record.description}</p>
                        {(record.nextServiceDueDate || record.nextServiceOdometer) && (
                          <p className="text-xs text-muted-foreground">
                            Next service: {[
                              record.nextServiceDueDate && formatDate(record.nextServiceDueDate),
                              record.nextServiceOdometer && `${formatNumber(record.nextServiceOdometer)} units`
                            ].filter(Boolean).join(" | ")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">{formatNumber(record.odometer)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {currencyFormatter.format(record.finalCost ?? record.cost ?? 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.status === 0 || record.status === "Pending" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMaintenance(record)
                              setIsMaintenanceCloseDialogOpen(true)
                            }}
                            disabled={completeMaintenance.isPending}
                          >
                            <CheckCircle className="mr-2 size-3" />
                            Complete
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <FileCheck2 className="mr-1 size-3" />
                            Completed
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <Wrench className="mx-auto mb-4 size-12 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-muted-foreground">No maintenance history recorded.</p>
              {isAssetInMaintenance ? (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setSelectedMaintenance(activeMaintenanceRecord)
                    setIsMaintenanceCloseDialogOpen(true)
                  }}
                  disabled={!activeMaintenanceRecord}
                >
                  Complete Maintenance
                </Button>
              ) : (
                <Button variant="outline" className="mt-4" onClick={() => setIsMaintenanceDialogOpen(true)}>
                  Add Maintenance
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <MaintenanceDialog
        assetId={id!}
        currentOdometer={asset.currentMeterReading || 0}
        isOpen={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
      />
      <MaintenanceCloseDialog
        assetId={id!}
        activeMaintenance={selectedMaintenance}
        isOpen={isMaintenanceCloseDialogOpen}
        onOpenChange={(open) => {
          setIsMaintenanceCloseDialogOpen(open)
          if (!open) setSelectedMaintenance(null)
        }}
      />
    </div>
  )
}
