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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Command className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">System Login</CardTitle>
          <CardDescription>
            Access the CERMS Management Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@cerms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
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
                className="h-11 focus-visible:ring-primary/20"
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="size-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Authenticating...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground italic">
              Authorized personnel only. All access attempts are logged.
            </p>
          </div>
        </CardContent>
      </Card>
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
