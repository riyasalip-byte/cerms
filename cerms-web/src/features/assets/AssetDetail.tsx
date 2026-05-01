import * as React from "react"
import { useAsset, useDeleteAsset, useCompleteMaintenance } from "@/hooks/useAssets"
import { Link, useNavigate, useParams } from "react-router-dom"
import { 
  ArrowLeft, Edit2, Trash2, Package, Activity, Calendar, Tag, History, MoreVertical, CheckCircle, Wrench
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ErrorState } from "@/components/shared/ErrorState"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MaintenanceDialog } from "./MaintenanceDialog"
import { MaintenanceCloseDialog } from "./MaintenanceCloseDialog"

export function AssetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: asset, isLoading, isError, refetch } = useAsset(id!)
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = React.useState(false)
  const [isMaintenanceCloseDialogOpen, setIsMaintenanceCloseDialogOpen] = React.useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = React.useState<any>(null)
  
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

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this asset?")) {
      await deleteAsset.mutateAsync(id!)
      navigate("/assets")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/assets")}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
              <StatusBadge status={asset.status} className="asset" />
            </div>
            <p className="text-muted-foreground font-mono text-sm">{asset.assetCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(Number(asset.status) === 0 || String(asset.status).toLowerCase() === 'available') && (
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
              <DropdownMenuItem className="text-destructive font-bold" onClick={handleDelete}>
                <Trash2 className="mr-2 size-4" />
                Delete Asset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-1 border-none shadow-md overflow-hidden h-fit">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="size-5 text-primary" />
              Asset Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Tag className="size-3.5" /> Category
                </p>
                <p className="font-bold text-lg">{asset.assetType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="size-3.5" /> Current Odometer
                </p>
                <p className="font-bold text-lg font-mono">{asset.currentOdometer?.toLocaleString()} units</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="size-3.5" /> Purchase Date
                </p>
                <p className="font-bold">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Wrench className="size-3.5" /> Total Maintenance Cost
                </p>
                <p className="font-bold text-destructive">
                  ${asset.maintenanceCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </p>
              </div>
              {asset.nextServiceDueDate && (
                <div className="space-y-1 mt-4">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="size-3.5" /> Next Service Due
                  </p>
                  <p className="font-bold text-amber-600 dark:text-amber-400">
                    {new Date(asset.nextServiceDueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance History */}
        <Card className="md:col-span-2 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="size-5" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {asset.maintenanceRecords && asset.maintenanceRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Odometer</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asset.maintenanceRecords
                    .slice()
                    .sort((a: any, b: any) => {
                      if (a.status !== b.status) return a.status - b.status
                      return new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
                    })
                    .map((record: any) => (
                      <TableRow 
                        key={record.id}
                        className={record.status === 0 ? "bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40" : "text-muted-foreground"}
                      >
                        <TableCell className="font-medium">{new Date(record.serviceDate).toLocaleDateString()}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell className="font-mono">{record.odometer.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">
                        {record.status === 1 ? (
                          <div className="flex flex-col items-end">
                            {record.finalCost !== record.cost && (
                              <div className="flex items-center gap-2 mb-0.5">
                                <del className="text-muted-foreground text-xs">
                                  Est: ${record.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </del>
                                <span className="text-[10px] text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                  {record.finalCost > record.cost ? '+' : '-'}${Math.abs(record.finalCost - record.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}
                            <span className="text-destructive font-bold">
                              ${(record.finalCost ?? record.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-sans tracking-tight mt-1">
                              ✓ Updated on completion
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Est: ${record.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.status === 0 ? (
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-help">
                                  Completed
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Completed on: {record.completedAt ? new Date(record.completedAt).toLocaleDateString() : 'Unknown'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/40">
                <Wrench className="mx-auto size-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-muted-foreground">No maintenance history recorded for this asset.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Maintenance logs will appear here once registered.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MaintenanceDialog 
        assetId={id!} 
        currentOdometer={asset.currentOdometer || 0}
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
