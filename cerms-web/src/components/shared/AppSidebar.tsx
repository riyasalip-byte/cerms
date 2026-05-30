import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Box,
  Users,
  Key,
  FileText,
  PieChart,
  ShieldCheck,
  Settings,
  Command,
  LogOut,
} from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { authService } from "@/api/services"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { usePermission } from "@/hooks/usePermission"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

const operatorMenuGroups = [
  {
    label: "Field Operations",
    items: [
      { label: "My Jobs", to: "/operator/dashboard", icon: LayoutDashboard },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout: logoutStore, user } = useAuthStore()
  const isOperator = user?.role === 'Operator'
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const { hasPermission } = usePermission()

  // Build menu groups dynamically based on permissions
  const menuGroups = [
    ...(isOperator
      ? [
          {
            label: "Field Operations",
            items: [
              { label: "My Jobs", to: "/operator/dashboard", icon: LayoutDashboard },
            ],
          },
        ]
      : []),
    {
      label: "Operations",
      items: [
        { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, permission: "Dashboard.View" },
        { label: "Assets", to: "/assets", icon: Box, permission: "Asset.View" },
        { label: "Customers", to: "/customers", icon: Users, permission: "Customer.View" },
        { label: "Rentals", to: "/rentals", icon: Key, permission: "Rental.View" },
      ].filter(item => hasPermission(item.permission)),
    },
    {
      label: "Finance",
      items: [
        { label: "Invoices", to: "/invoices", icon: FileText, permission: "Invoice.View" },
        { label: "Reports", to: "/reports", icon: PieChart, permission: "Reports.View" },
      ].filter(item => hasPermission(item.permission)),
    },
    {
      label: "Administration",
      items: [
        { label: "Staff", to: "/staff", icon: ShieldCheck, permission: "Staff.View" },
        { label: "Roles", to: "/roles", icon: ShieldCheck, permission: "Roles.View" },
        { label: "Users", to: "/settings/users", icon: Users, permission: "Users.View" },
        { label: "Settings", to: "/settings/general", icon: Settings, adminOnly: true },
      ].filter(item => {
        if (item.adminOnly && !isAdmin) return false
        return !item.permission || hasPermission(item.permission)
      }),
    },
  ].filter(group => group.items.length > 0)

  const handleNavClick = (path: string) => {
    console.log(`[Sidebar] Navigating to: ${path}`)
  }

  const handleLogout = async () => {
    try {
      console.log("[Auth] Logging out from sidebar...")
      await authService.logout()
      logoutStore()
      toast.success("Logged out successfully")
      navigate("/login")
    } catch (error) {
      console.error("[Auth] Logout failed:", error)
      logoutStore()
      navigate("/login")
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={isOperator ? "/operator/dashboard" : "/dashboard"} onClick={() => handleNavClick(isOperator ? "/operator/dashboard" : "/dashboard")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">CERMS</span>
                  <span className="truncate text-xs">Rental Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.to ||
                    (item.to !== "/dashboard" &&
                      item.to !== "/operator/dashboard" &&
                      location.pathname.startsWith(item.to))
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActive}
                        className={cn(
                          "transition-all duration-200",
                          isActive && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold border-l-2 border-emerald-500 rounded-none pl-3"
                        )}
                      >
                        <Link to={item.to} onClick={() => handleNavClick(item.to)}>
                          <item.icon className={cn(isActive && "text-emerald-600 dark:text-emerald-400")} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <Link to="/profile" onClick={() => handleNavClick('/profile')}>
                <Users className="size-4" />
                <span>My Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="sm">
                <Link to="/settings/general" onClick={() => handleNavClick("/settings/general")}>
                  <Settings className="size-4" />
                  <span>Quick Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="sm" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
