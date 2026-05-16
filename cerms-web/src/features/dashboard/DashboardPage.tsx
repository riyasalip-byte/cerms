import { Link } from "react-router-dom"
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Key,
  Package,
  ShieldAlert,
  Wrench,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpiringAssets } from "@/hooks/useAssets"
import { cn } from "@/lib/utils"

const kpiCards = [
  {
    label: "Total Assets",
    value: "1,248",
    icon: Package,
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    label: "Active Rentals",
    value: "312",
    icon: Key,
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    label: "Monthly Revenue",
    value: "Rs. 84,560",
    icon: DollarSign,
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
]

const assetStatus = [
  { label: "Available", count: 684, icon: CheckCircle2, className: "bg-emerald-500" },
  { label: "Rented", count: 312, icon: Key, className: "bg-blue-500" },
  { label: "Maintenance", count: 143, icon: Wrench, className: "bg-amber-500" },
  { label: "Decommissioned", count: 24, icon: Activity, className: "bg-slate-500" },
]

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date)
}

export function DashboardPage() {
  const { data: expiryAlerts = [], isLoading } = useExpiringAssets(30)
  const criticalCount = expiryAlerts.filter((alert) => alert.severity === "critical").length
  const warningCount = expiryAlerts.filter((alert) => alert.severity === "warning").length
  const visibleAlerts = expiryAlerts.slice(0, 6)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="mt-1 flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" />
            {dateFormatter.format(new Date())}
          </p>
        </div>
        <Button asChild>
          <Link to="/assets/new">New Asset</Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card) => (
          <Card key={card.label} className="border-muted/60 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={cn("flex size-12 items-center justify-center rounded-xl", card.bg)}>
                <card.icon className={cn("size-6", card.color)} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-muted/60 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-primary" />
                Compliance Expiry Alerts
              </CardTitle>
              <CardDescription>
                Fitness, insurance, and PUCC items that are expired or due within 30 days.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                {criticalCount} Critical
              </Badge>
              <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {warningCount} Warning
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : visibleAlerts.length ? (
              <div className="grid gap-3">
                {visibleAlerts.map((alert) => (
                  <Link
                    key={alert.notificationKey}
                    to={`/assets/${alert.assetId}`}
                    className="flex flex-col gap-3 rounded-lg border border-muted/70 bg-background p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-bold text-foreground">{alert.assetName}</p>
                        <span className="font-mono text-xs text-muted-foreground">{alert.assetCode}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.complianceType} expires on {formatDate(alert.expiryDate)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "w-fit px-2.5 py-1 text-xs font-bold",
                        alert.severity === "critical"
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      )}
                    >
                      {alert.severity === "critical"
                        ? "Expired"
                        : `${alert.daysUntilExpiry} days left`}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 size-10 text-emerald-600" />
                <p className="font-semibold">No compliance alerts due soon.</p>
                <p className="text-sm text-muted-foreground">Future notifications can build from this alert feed.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-primary" />
              Asset Health
            </CardTitle>
            <CardDescription>Fleet status snapshot</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {assetStatus.map((item) => (
              <div key={item.label} className="flex items-center gap-4 rounded-lg border border-muted/70 p-4">
                <div className={cn("flex size-10 items-center justify-center rounded-xl text-white", item.className)}>
                  <item.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">Current fleet count</p>
                </div>
                <p className="text-lg font-bold">{item.count}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
