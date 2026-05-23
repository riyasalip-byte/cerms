import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export type StatusType = 
  | "available" 
  | "rented" 
  | "maintenance" 
  | "decommissioned"
  | "overdue" 
  | "draft"
  | "confirmed"
  | "dispatched"
  | "active"
  | "completed"
  | "closed"
  | "cancelled"
  | "unpaid"
  | "partial"
  | "paid"

interface StatusBadgeProps {
  status: StatusType | string | number
  className?: string
}

const statusMap: Record<string, { label: string; className: string }> = {
  available: { 
    label: "Available", 
    className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" 
  },
  rented: { 
    label: "Rented", 
    className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" 
  },
  maintenance: { 
    label: "Maintenance", 
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" 
  },
  decommissioned: { 
    label: "Decommissioned", 
    className: "bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" 
  },
  overdue: { 
    label: "Overdue", 
    className: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/40" 
  },
  draft: { 
    label: "Draft", 
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700" 
  },
  confirmed: { 
    label: "Confirmed", 
    className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" 
  },
  dispatched: {
    label: "Dispatched",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"
  },
  active: { 
    label: "Active", 
    className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" 
  },
  completed: {
    label: "Completed",
    className: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800"
  },
  closed: { 
    label: "Closed", 
    className: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700" 
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
  },
  unpaid: { 
    label: "Unpaid", 
    className: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/40" 
  },
  partial: { 
    label: "Partial", 
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" 
  },
  paid: { 
    label: "Paid", 
    className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" 
  },
}

// Map for numeric statuses (from API)
const numericStatusMap: Record<number, StatusType> = {
  0: "available",
  1: "rented",
  2: "maintenance",
  3: "decommissioned",
}

const rentalNumericStatusMap: Record<number, StatusType> = {
  0: "draft",
  1: "confirmed",
  2: "dispatched",
  3: "active",
  4: "completed",
  5: "closed",
  6: "cancelled",
}

const invoiceNumericStatusMap: Record<number, StatusType> = {
  0: "unpaid",
  1: "partial",
  2: "paid",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let normalizedStatus: string = String(status).toLowerCase()
  
  // Handle numeric status conversion
  if (typeof status === "number") {
    if (status >= 0 && status <= 3 && className === "asset") {
       normalizedStatus = numericStatusMap[status] || normalizedStatus
    } 
    else if (status >= 0 && status <= 3 && className === "rental") {
       normalizedStatus = rentalNumericStatusMap[status] || normalizedStatus
    }
    else if (status >= 0 && status <= 2 && className === "invoice") {
       normalizedStatus = invoiceNumericStatusMap[status] || normalizedStatus
    }
  }

  const config = statusMap[normalizedStatus] || { 
    label: normalizedStatus, 
    className: "bg-slate-100 text-slate-700 border-slate-200" 
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Badge 
        variant="outline" 
        className={cn("px-2 py-0.5 font-semibold capitalize transition-all", config.className)}
      >
        {config.label}
      </Badge>
    </motion.div>
  )
}
