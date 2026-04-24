import * as React from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Key, 
  DollarSign,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Activity,
  AlertTriangle,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const kpiCards = [
  { 
    label: "Total Assets", 
    value: "1,248", 
    trend: "+3.2%", 
    isUp: true, 
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    accent: "bg-blue-600"
  },
  { 
    label: "Active Rentals", 
    value: "312", 
    trend: "+1.1%", 
    isUp: true, 
    icon: Key,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    accent: "bg-emerald-600"
  },
  { 
    label: "Monthly Revenue", 
    value: "$84,560", 
    trend: "+8.4%", 
    isUp: true, 
    icon: DollarSign,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    accent: "bg-amber-600"
  },
]

const todaysAssignments = [
  {
    id: "ASG-1001",
    asset: "Excavator EX-21",
    client: "BuildCorp Asia",
    dueTime: "09:30 AM",
    status: "In Progress",
    priority: "High"
  },
  {
    id: "ASG-1002",
    asset: "Forklift FL-08",
    client: "Logistics Hub",
    dueTime: "11:00 AM",
    status: "Pending",
    priority: "Medium"
  },
  {
    id: "ASG-1003",
    asset: "Generator GN-14",
    client: "Metro Construction",
    dueTime: "02:15 PM",
    status: "Completed",
    priority: "Low"
  },
]

const assetStatus = [
  { label: "Available", count: 684, color: "bg-emerald-500", icon: CheckCircle2, description: "Ready for rental" },
  { label: "Rented", count: 312, color: "bg-blue-500", icon: Key, description: "Currently in field" },
  { label: "Maintenance", count: 143, color: "bg-amber-500", icon: AlertTriangle, description: "In workshop" },
  { label: "Decommissioned", count: 24, color: "bg-slate-500", icon: Activity, description: "Inactive" },
]

// Container variants for staggered animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="size-4" />
            Friday, April 24, 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex transition-transform hover:scale-105 active:scale-95">Export Report</Button>
          <Button className="bg-primary shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">New Assignment</Button>
        </div>
      </motion.div>

      {/* KPI Cards Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {kpiCards.map((card) => (
          <motion.div key={card.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-none shadow-xl transition-all hover:shadow-2xl">
              <div className={cn("absolute top-0 left-0 h-1 w-full", card.accent)} />
              <CardContent className="flex items-center gap-4 p-6">
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className={cn("flex size-14 items-center justify-center rounded-2xl", card.bg)}
                >
                  <card.icon className={cn("size-7", card.color)} />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{card.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight">{card.value}</span>
                    <span className={cn(
                      "flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full",
                      card.isUp ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" : "bg-destructive/10 text-destructive"
                    )}>
                      {card.isUp ? <TrendingUp className="mr-1 size-3" /> : <TrendingDown className="mr-1 size-3" />}
                      {card.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Assignments Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Today's Assignments</h2>
            <Button variant="ghost" size="sm" className="gap-1 font-semibold hover:bg-primary/5">
              View all <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="grid gap-4">
            {todaysAssignments.map((item) => (
              <motion.div key={item.id} variants={itemVariants} whileHover={{ x: 5 }}>
                <Card className="group overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
                  <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "mt-1 size-3 rounded-full shrink-0",
                        item.status === "In Progress" ? "bg-blue-500 animate-pulse" : 
                        item.status === "Completed" ? "bg-emerald-500" : "bg-amber-500"
                      )} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg group-hover:text-primary transition-colors">{item.asset}</span>
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">Client: {item.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Due Time</span>
                        <span className="text-sm font-bold flex items-center gap-1.5">
                          <Clock className="size-3.5 text-primary" />
                          {item.dueTime}
                        </span>
                      </div>
                      <Button size="icon" variant="secondary" className="rounded-full shadow-inner group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Asset Status Grid Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4"
        >
          <h2 className="text-xl font-bold tracking-tight">Asset Health</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {assetStatus.map((item) => (
              <motion.div key={item.label} variants={itemVariants}>
                <Card className="border-none shadow-md hover:bg-muted/30 transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.2 }}
                      className={cn("size-10 rounded-xl flex items-center justify-center transition-transform", item.color, "bg-opacity-10")}
                    >
                      <item.icon className={cn("size-5", item.text || "text-foreground")} />
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{item.label}</span>
                        <span className="font-bold text-base">{item.count}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden mt-2 relative">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -right-8 -bottom-8 size-32 bg-white rounded-full blur-2xl" 
              />
              <CardHeader className="p-5">
                <CardTitle className="text-lg">System Audit</CardTitle>
                <CardDescription className="text-primary-foreground/70">Last check performed 2h ago</CardDescription>
              </CardHeader>
              <CardFooter className="p-5 pt-0">
                <Button variant="secondary" className="w-full font-bold shadow-lg">Check Status</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.section>
      </div>
    </div>
  )
}
