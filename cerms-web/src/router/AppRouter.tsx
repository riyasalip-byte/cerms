import * as React from "react"
import { useEffect, useState, lazy, Suspense } from "react"
import type { FormEvent } from "react"
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { login as loginService, refresh as refreshService } from "@/api/services"
import { AppLayout } from "@/components/shared/AppLayout"
import { useAuthStore } from "@/stores/authStore"
import { ProtectedRoute } from "./ProtectedRoute"
import { GlobalLoading } from "@/components/shared/GlobalLoading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Command } from "lucide-react"

// Lazy load feature pages
const AssetDetail = lazy(() => import("@/features/assets/AssetDetail").then(m => ({ default: m.AssetDetail })))
const AssetForm = lazy(() => import("@/features/assets/AssetForm").then(m => ({ default: m.AssetForm })))
const AssetList = lazy(() => import("@/features/assets/AssetList").then(m => ({ default: m.AssetList })))
const CustomerDetail = lazy(() => import("@/features/customers/CustomerDetail").then(m => ({ default: m.CustomerDetail })))
const CustomerForm = lazy(() => import("@/features/customers/CustomerForm").then(m => ({ default: m.CustomerForm })))
const CustomerList = lazy(() => import("@/features/customers/CustomerList").then(m => ({ default: m.CustomerList })))
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
const UserManagement = lazy(() => import("@/features/settings/UserManagement").then(m => ({ default: m.UserManagement })))
const StaffDetail = lazy(() => import("@/features/staff/StaffDetail").then(m => ({ default: m.StaffDetail })))
const StaffForm = lazy(() => import("@/features/staff/StaffForm").then(m => ({ default: m.StaffForm })))
const StaffList = lazy(() => import("@/features/staff/StaffList").then(m => ({ default: m.StaffList })))

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
      navigate("/dashboard", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    // Bypass real login for now as requested
    setTimeout(() => {
      const dummyUser = { 
        id: "1", 
        username: "demouser",
        email: email || "demo@example.com",
        role: "Admin",
        companyId: "comp-1",
        branchId: "br-1"
      }
      const dummyToken = "dummy-jwt-token"
      login(dummyUser, dummyToken)
      
      const redirectPath = (location.state as any)?.from?.pathname
      navigate(redirectPath || "/dashboard", { replace: true })
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Command className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter any credentials to access your CERMS dashboard (Temporary).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-11 text-base font-bold" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function AppRouter() {
  const login = useAuthStore((state) => state.login)
  const setRefreshing = useAuthStore((state) => state.setRefreshing)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
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
            <Route index element={<Navigate to={localStorage.getItem("lastVisitedPage") || "/dashboard"} replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/assets" element={<AssetList />} />
            <Route path="/assets/new" element={<AssetForm />} />
            <Route path="/assets/:id" element={<AssetDetail />} />
            <Route path="/assets/:id/edit" element={<AssetForm />} />

            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />

            <Route path="/rentals" element={<RentalList />} />
            <Route path="/rentals/new" element={<RentalForm />} />
            <Route path="/rentals/:id" element={<RentalDetail />} />
            <Route path="/rentals/:id/edit" element={<RentalForm />} />

            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/invoices/:id/payment" element={<PaymentForm />} />
            
            <Route path="/staff" element={<StaffList />} />
            <Route path="/staff/new" element={<StaffForm />} />
            <Route path="/staff/:id" element={<StaffDetail />} />
            <Route path="/staff/:id/edit" element={<StaffForm />} />

            <Route path="/reports" element={<ReportsOverview />} />
            <Route path="/reports/revenue" element={<RevenueReport />} />
            <Route path="/reports/utilisation" element={<UtilisationReport />} />
            
            <Route path="/settings/general" element={<GeneralSettings />} />
            <Route path="/settings/users" element={<UserManagement />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
