import * as React from "react"
import { LayoutDashboard, Box, Key, Settings } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dash", to: "/dashboard", icon: LayoutDashboard },
  { label: "Assets", to: "/assets", icon: Box },
  { label: "Rentals", to: "/rentals", icon: Key },
  { label: "Settings", to: "/settings/general", icon: Settings },
]

export function MobileNav() {
  const location = useLocation()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur md:hidden">
      <nav className="flex items-center justify-around p-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("size-6", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      {/* Bottom safe area spacer for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  )
}
