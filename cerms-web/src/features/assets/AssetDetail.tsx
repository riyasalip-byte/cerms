import * as React from "react"
import { useAsset, useDeleteAsset } from "@/hooks/useAssets"
import { Link, useNavigate, useParams } from "react-router-dom"
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Package, 
  Activity, 
  Calendar, 
  MapPin, 
  Tag, 
  History,
  MoreVertical
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ErrorState } from "@/components/shared/ErrorState"

export function AssetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: asset, isLoading, isError, refetch } = useAsset(id!)
  const deleteAsset = useDeleteAsset()

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isError || !asset) {
    return (
      <ErrorState 
        onRetry={refetch} 
        message="We couldn't find the asset you're looking for." 
      />
    )
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this asset?")) {
      await deleteAsset.mutateAsync(id!)
      navigate("/assets")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/assets/${id}/edit`}>
              <Edit2 className="mr-2 size-4" />
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
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 size-4" />
                Delete Asset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="size-5 text-primary" />
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-2">
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
                  <Calendar className="size-3.5" /> Registered Date
                </p>
                <p className="font-bold">May 12, 2024</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="size-3.5" /> Current Location
                </p>
                <p className="font-bold text-primary">Warehouse A (Main Yard)</p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <History className="size-4 text-primary" />
                Operational History
              </h3>
              <div className="rounded-xl border border-dashed p-8 text-center bg-slate-50 dark:bg-slate-900/40">
                <p className="text-sm text-muted-foreground italic">No recent maintenance or rental history recorded.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className="border-none shadow-md overflow-hidden h-fit">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="size-5" />
              Asset Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Availability</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">100%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4 border border-muted-foreground/10">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Last Inspection</p>
                <p className="text-sm font-bold">3 days ago</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 border border-muted-foreground/10">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Next Service Due</p>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">In 1,250 units</p>
              </div>
            </div>
            
            <Button className="w-full" variant="outline">
              View Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
