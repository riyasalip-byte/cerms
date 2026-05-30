import { useEffect, useState, lazy, Suspense } from "react"
import type { FormEvent } from "react"
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { login as loginService, refresh as refreshService } from "@/api/services"
import { AppLayout } from "@/components/shared/AppLayout"
import { useAuthStore } from "@/stores/authStore"
import { ProtectedRoute } from "./ProtectedRoute"
import { AdminRoute } from "./AdminRoute"
import { GlobalLoading } from "@/components/shared/GlobalLoading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Command, AlertCircle } from "lucide-react"
import { usePermission } from "@/hooks/usePermission"

// Lazy load feature pages
const AssetDetail = lazy(() => import("@/features/assets/AssetDetail").then(m => ({ default: m.AssetDetail })))
const AssetForm = lazy(() => import("@/features/assets/AssetForm").then(m => ({ default: m.AssetForm })))
const AssetList = lazy(() => import("@/features/assets/AssetList").then(m => ({ default: m.AssetList })))
const CustomerDetailPage = lazy(() => import("@/features/customers/CustomerDetailPage").then(m => ({ default: m.CustomerDetailPage })))
const CustomerForm = lazy(() => import("@/features/customers/CustomerForm").then(m => ({ default: m.CustomerForm })))
const CustomerListPage = lazy(() => import("@/features/customers/CustomerListPage").then(m => ({ default: m.CustomerListPage })))
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage").then(m => ({ default: m.DashboardPage })))
const InvoiceDetail = lazy(() => import("@/features/invoices/InvoiceDetail").then(m => ({ default: m.InvoiceDetail })))
const InvoiceList = lazy(() => import("@/features/invoices/InvoiceList").then(m => ({ default: m.InvoiceList })))
const PaymentForm = lazy(() => import("@/features/invoices/PaymentForm").then(m => ({ default: m.PaymentForm })))
const RentalDetail = lazy(() => import("@/features/rentals/RentalDetail").then(m => ({ default: m.RentalDetail })))
const RentalForm = lazy(() => import("@/features/rentals/RentalForm").then(m => ({ default: m.RentalForm })))
const RentalList = lazy(() => import("@/features/rentals/RentalList").then(m => ({ default: m.RentalList })))
const ReportsOverview = lazy(() => import("@/features/reports/ReportsOverview").then(m => ({ default: m.ReportsOverview })))
const RevenueReport = lazy(() => import("@/features/reports/RevenueReport").then(m => ({ default: m.RevenueReport })))
const UtilisationReport = lazy(() => import("@/features/reports/UtilisationReport").then(m => ({ default: m.UtilisationReport })))
const GeneralSettings = lazy(() => import("@/features/settings/GeneralSettings").then(m => ({ default: m.GeneralSettings })))
const UserListPage = lazy(() => import("@/features/users/UserListPage").then(m => ({ default: m.UserListPage })))
const UserFormPage = lazy(() => import("@/features/users/UserFormPage").then(m => ({ default: m.UserFormPage })))
const StaffDetailPage = lazy(() => import("@/features/staff/StaffDetailPage").then(m => ({ default: m.StaffDetailPage })))
const StaffFormPage = lazy(() => import("@/features/staff/StaffFormPage").then(m => ({ default: m.StaffFormPage })))
const StaffListPage = lazy(() => import("@/features/staff/StaffListPage").then(m => ({ default: m.StaffListPage })))
const MyProfilePage = lazy(() => import("@/features/profile/MyProfilePage").then(m => ({ default: m.MyProfilePage })))
const OperatorDashboardPage = lazy(() => import("@/features/operators/OperatorDashboardPage").then(m => ({ default: m.OperatorDashboardPage })))

// Lazy load new Role management pages
const RoleListPage = lazy(() => import("@/features/roles/RoleListPage").then(m => ({ default: m.RoleListPage })))
const RoleFormPage = lazy(() => import("@/features/roles/RoleFormPage").then(m => ({ default: m.RoleFormPage })))
const RoleDetailPage = lazy(() => import("@/features/roles/RoleDetailPage").then(m => ({ default: m.RoleDetailPage })))

// Route Guard Component based on dynamic permissions
function PermissionGuard({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { hasPermission } = usePermission()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Admin bypasses all checks, otherwise verify code
  if (user?.role === 'Admin' || hasPermission(permission)) {
    return <>{children}</>
  }

  return <Navigate to={user?.role === 'Operator' ? "/operator/dashboard" : "/dashboard"} replace />
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      const isOperator = useAuthStore.getState().user?.role === 'Operator'
      navigate(isOperator ? "/operator/dashboard" : "/dashboard", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const payload = {
      email: email.trim(),
      password: password.trim()
    };

    console.log("[Login] Attempting sign-in with:", payload.email);

    try {
      const response = await loginService(payload)
      console.log("[Login] Success:", response.user.email);
      login(response.user, response.accessToken)
      
      const redirectPath = (location.state as any)?.from?.pathname
      const nextPath = response.user.role === 'Operator' ? "/operator/dashboard" : (redirectPath || "/dashboard")
      navigate(nextPath, { replace: true })
    } catch (err: any) {
      console.error("[Login] Authentication failed. Status:", err.response?.status);
      console.error("[Login] Error data:", err.response?.data);
      
      const apiMessage = err.response?.data?.message || err.response?.data?.title || err.response?.data;
      setError(typeof apiMessage === 'string' ? apiMessage : "Invalid email or password. Please check your credentials.");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100">
      {/* Left side: Premium branding & text (hidden on mobile) */}
      <div className="hidden lg:flex w-7/12 flex-col justify-between p-12 bg-slate-950 border-r border-slate-800/50 relative overflow-hidden">
        {/* Decorative background grid and gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[150px]" />

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 p-1.5 shadow-md">
            <img src="/favicon.png" alt="CERMS Logo" className="size-full object-contain" />
          </div>
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            CERMS
          </span>
        </div>

        {/* Product Pitch Section */}
        <div className="my-auto max-w-xl relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-none bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Construction Equipment Rental Management System
            </h1>
            <p className="text-base text-slate-400 leading-relaxed font-medium">
              Streamline operations, optimize fleet utilization, and safeguard your revenues with our premium database-driven dynamic management console.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 items-start p-4 rounded-2xl bg-slate-900/40 border border-slate-850/40 hover:bg-slate-900/60 hover:border-slate-800/60 transition-all duration-300">
              <span className="text-2xl mt-0.5">⚡</span>
              <div>
                <h3 className="font-bold text-slate-250 text-sm xl:text-base">Real-Time Asset Tracking</h3>
                <p className="text-xs xl:text-sm text-slate-400 mt-0.5 leading-normal">
                  Monitor machinery locations, active work states, and critical maintenance schedules instantly.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-2xl bg-slate-900/40 border border-slate-850/40 hover:bg-slate-900/60 hover:border-slate-800/60 transition-all duration-300">
              <span className="text-2xl mt-0.5">📅</span>
              <div>
                <h3 className="font-bold text-slate-250 text-sm xl:text-base">Seamless Rental Bookings</h3>
                <p className="text-xs xl:text-sm text-slate-400 mt-0.5 leading-normal">
                  Coordinate allocations, manage reservations, and track operational handovers effortlessly.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-2xl bg-slate-900/40 border border-slate-850/40 hover:bg-slate-900/60 hover:border-slate-800/60 transition-all duration-300">
              <span className="text-2xl mt-0.5">🧾</span>
              <div>
                <h3 className="font-bold text-slate-250 text-sm xl:text-base">Dynamic Invoicing & Finance</h3>
                <p className="text-xs xl:text-sm text-slate-400 mt-0.5 leading-normal">
                  Automate billing cycles, capture utilization-based charges, and minimize revenue leaks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500 font-medium relative z-10 flex justify-between items-center border-t border-slate-900/60 pt-6">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} CERMS. All rights reserved.</span>
            <span className="text-slate-800">|</span>
            <div className="flex items-center gap-1 text-slate-400">
              <span>Developed by</span>
              <a href="https://gridmind.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-emerald-400 transition-colors font-bold">
                <img src="/gridmind-icon.svg" alt="GridMind Logo" className="h-3.5 w-3.5 object-contain" />
                <span>GridMind</span>
              </a>
            </div>
          </div>
          <span className="bg-slate-900/60 px-3 py-1 rounded-full border border-slate-900 text-slate-400 text-[10px] uppercase tracking-widest font-black">
            SaaS Enterprise
          </span>
        </div>
      </div>

      {/* Right side: Login Form Panel */}
      <div className="flex w-full lg:w-5/12 flex-col justify-center bg-slate-950 px-6 sm:px-12 md:px-20 lg:px-16 xl:px-24 py-12 relative overflow-hidden">
        {/* Glow behind card on mobile */}
        <div className="lg:hidden absolute top-10 left-10 h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px]" />
        
        <div className="mx-auto w-full max-w-md space-y-8 relative z-10">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Show big standalone logo centered above the form */}
            <div className="flex h-36 w-36 items-center justify-center p-1 rounded-3xl bg-slate-900/30 border border-slate-800/50 shadow-2xl">
              <img src="/favicon.png" alt="CERMS Logo" className="size-full object-contain animate-pulse-slow" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-white">System Login</h2>
              <p className="text-sm text-slate-400 font-medium">
                Enter your administrative credentials to access the console
              </p>
            </div>
          </div>

          <div className="p-1 rounded-2xl bg-gradient-to-b from-slate-800/30 to-transparent">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/60 rounded-[15px] p-6 shadow-2xl shadow-black/50">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 font-bold text-sm">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@cerms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300 font-bold text-sm">Password</Label>
                    <button type="button" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all rounded-xl"
                  />
                </div>
                
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs xl:text-sm font-semibold text-red-400 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/10 active:scale-[0.99] transition-all rounded-xl cursor-pointer" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      Authenticating...
                    </div>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </Button>
              </form>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-slate-500 font-semibold italic">
              Authorized personnel only. All access sessions are dynamically audited.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppRouter() {
  const login = useAuthStore((state) => state.login)
  const setRefreshing = useAuthStore((state) => state.setRefreshing)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const isOperator = user?.role === 'Operator'
  const location = useLocation()

  // Track last visited page
  useEffect(() => {
    if (isAuthenticated && location.pathname !== "/login") {
      localStorage.setItem("lastVisitedPage", location.pathname)
    }
  }, [location, isAuthenticated])

  useEffect(() => {
    const recoverSession = async () => {
      if (isAuthenticated) return
      setRefreshing(true)
      try {
        const { accessToken, user } = await refreshService()
        login(user, accessToken)
      } catch (error) {
        // No session
      } finally {
        setRefreshing(false)
      }
    }
    recoverSession()
  }, [isAuthenticated, login, setRefreshing])

  return (
    <Suspense fallback={<GlobalLoading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to={isOperator ? "/operator/dashboard" : (localStorage.getItem("lastVisitedPage") || "/dashboard")} replace />} />
            <Route path="/dashboard" element={isOperator ? <Navigate to="/operator/dashboard" replace /> : <DashboardPage />} />
            
            <Route path="/operator/dashboard" element={<OperatorDashboardPage />} />

            {/* Assets */}
            <Route path="/assets" element={<PermissionGuard permission="Asset.View"><AssetList /></PermissionGuard>} />
            <Route path="/assets/new" element={<PermissionGuard permission="Asset.Create"><AssetForm /></PermissionGuard>} />
            <Route path="/assets/:id" element={<PermissionGuard permission="Asset.View"><AssetDetail /></PermissionGuard>} />
            <Route path="/assets/:id/edit" element={<PermissionGuard permission="Asset.Edit"><AssetForm /></PermissionGuard>} />

            {/* Customers */}
            <Route path="/customers" element={<PermissionGuard permission="Customer.View"><CustomerListPage /></PermissionGuard>} />
            <Route path="/customers/new" element={<PermissionGuard permission="Customer.Create"><CustomerForm /></PermissionGuard>} />
            <Route path="/customers/:id" element={<PermissionGuard permission="Customer.View"><CustomerDetailPage /></PermissionGuard>} />
            <Route path="/customers/:id/edit" element={<PermissionGuard permission="Customer.Edit"><CustomerForm /></PermissionGuard>} />

            {/* Rentals */}
            <Route path="/rentals" element={<PermissionGuard permission="Rental.View"><RentalList /></PermissionGuard>} />
            <Route path="/rentals/new" element={<PermissionGuard permission="Rental.Create"><RentalForm /></PermissionGuard>} />
            <Route path="/rentals/:id" element={<PermissionGuard permission="Rental.View"><RentalDetail /></PermissionGuard>} />
            <Route path="/rentals/:id/edit" element={<PermissionGuard permission="Rental.Edit"><RentalForm /></PermissionGuard>} />

            {/* Invoices */}
            <Route path="/invoices" element={<PermissionGuard permission="Invoice.View"><InvoiceList /></PermissionGuard>} />
            <Route path="/invoices/:id" element={<PermissionGuard permission="Invoice.View"><InvoiceDetail /></PermissionGuard>} />
            <Route path="/invoices/:id/payment" element={<PermissionGuard permission="Invoice.Create"><PaymentForm /></PermissionGuard>} />
            
            {/* Staff */}
            <Route path="/staff" element={<PermissionGuard permission="Staff.View"><StaffListPage /></PermissionGuard>} />
            <Route path="/staff/new" element={<PermissionGuard permission="Staff.Create"><StaffFormPage /></PermissionGuard>} />
            <Route path="/staff/:id" element={<PermissionGuard permission="Staff.View"><StaffDetailPage /></PermissionGuard>} />
            <Route path="/staff/:id/edit" element={<PermissionGuard permission="Staff.Edit"><StaffFormPage /></PermissionGuard>} />

            {/* Reports */}
            <Route path="/reports" element={<PermissionGuard permission="Reports.View"><ReportsOverview /></PermissionGuard>} />
            <Route path="/reports/revenue" element={<PermissionGuard permission="Reports.View"><RevenueReport /></PermissionGuard>} />
            <Route path="/reports/utilisation" element={<PermissionGuard permission="Reports.View"><UtilisationReport /></PermissionGuard>} />
            
            {/* Profile */}
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/settings/general" element={<GeneralSettings />} />

            {/* Users Management */}
            <Route path="/settings/users" element={<PermissionGuard permission="Users.View"><UserListPage /></PermissionGuard>} />
            <Route path="/settings/users/new" element={<PermissionGuard permission="Users.Create"><UserFormPage /></PermissionGuard>} />
            <Route path="/settings/users/:id/edit" element={<PermissionGuard permission="Users.Edit"><UserFormPage /></PermissionGuard>} />

            {/* Roles Management */}
            <Route path="/roles" element={<PermissionGuard permission="Roles.View"><RoleListPage /></PermissionGuard>} />
            <Route path="/roles/new" element={<PermissionGuard permission="Roles.Create"><RoleFormPage /></PermissionGuard>} />
            <Route path="/roles/:id" element={<PermissionGuard permission="Roles.View"><RoleDetailPage /></PermissionGuard>} />
            <Route path="/roles/:id/edit" element={<PermissionGuard permission="Roles.Edit"><RoleFormPage /></PermissionGuard>} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={isOperator ? "/operator/dashboard" : "/dashboard"} replace />} />
      </Routes>
    </Suspense>
  )
}
