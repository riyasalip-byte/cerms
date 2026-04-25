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

const menuGroups = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Assets", to: "/assets", icon: Box },
      { label: "Customers", to: "/customers", icon: Users },
      { label: "Rentals", to: "/rentals", icon: Key },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Invoices", to: "/invoices", icon: FileText },
      { label: "Reports", to: "/reports", icon: PieChart },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Staff", to: "/staff", icon: ShieldCheck },
      { label: "Users", to: "/settings/users", icon: Users },
      { label: "Settings", to: "/settings/general", icon: Settings },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout: logoutStore } = useAuthStore()

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
              <Link to="/dashboard" onClick={() => handleNavClick("/dashboard")}>
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
                      location.pathname.startsWith(item.to))
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActive}
                      >
                        <Link to={item.to} onClick={() => handleNavClick(item.to)}>
                          <item.icon />
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
              <Link to="/settings/general" onClick={() => handleNavClick("/settings/general")}>
                <Settings className="size-4" />
                <span>Quick Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
