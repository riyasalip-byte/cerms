import { Outlet, useLocation } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { AppTopbar } from "./AppTopbar"
import { MobileNav } from "./MobileNav"

export function AppLayout() {
  const location = useLocation()
  
  console.log(`[AppLayout] Rendering path: ${location.pathname}`)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden relative">
          <Outlet />
        </main>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
