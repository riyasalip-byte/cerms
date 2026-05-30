import * as React from "react"
import { Bell, Search, User, LogOut, Settings } from "lucide-react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { authService } from "@/api/services"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function AppTopbar() {
  const navigate = useNavigate()
  const { user, logout: logoutStore } = useAuthStore()
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const pathnames = location.pathname.split("/").filter((x) => x)

  const getInitials = (username?: string) => {
    if (!username) return "US"
    const parts = username.trim().split(/\s+/)
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return username.slice(0, 2).toUpperCase()
  }

  const handleNavClick = (path: string) => {
    console.log(`[Navigation] Navigating to: ${path}`)
  }

  const handleLogout = async () => {
    try {
      console.log("[Auth] Logging out...")
      await authService.logout()
      logoutStore()
      toast.success("Logged out successfully")
      navigate("/login")
    } catch (error) {
      console.error("[Auth] Logout failed:", error)
      // Even if API fails, we clear local state
      logoutStore()
      navigate("/login")
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/dashboard" onClick={() => handleNavClick("/dashboard")}>
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathnames.map((value, index) => {
              const to = `/${pathnames.slice(0, index + 1).join("/")}`
              const isLast = index === pathnames.length - 1
              
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
              const label = isUuid ? "Details" : (value.charAt(0).toUpperCase() + value.slice(1))

              if (value === "dashboard") return null

              return (
                <React.Fragment key={to}>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={to} onClick={() => handleNavClick(to)}>
                          {label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-4 px-4">
        <form className="relative hidden lg:flex">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 bg-muted/50 pl-8 focus-visible:bg-background"
          />
        </form>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 flex size-2 rounded-full bg-destructive"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative size-8 rounded-full">
              <Avatar className="size-8">
                <AvatarImage src="/avatars/01.png" alt="User" />
                <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@cerms.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex w-full items-center" onClick={() => handleNavClick("/profile")}>
                  <User className="mr-2 size-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/settings/general" className="flex w-full items-center" onClick={() => handleNavClick("/settings/general")}>
                    <Settings className="mr-2 size-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
