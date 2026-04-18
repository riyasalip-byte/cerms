import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/shared/AppLayout'
import { AssetDetail } from '@/features/assets/AssetDetail'
import { AssetForm } from '@/features/assets/AssetForm'
import { AssetList } from '@/features/assets/AssetList'
import { CustomerDetail } from '@/features/customers/CustomerDetail'
import { CustomerForm } from '@/features/customers/CustomerForm'
import { CustomerList } from '@/features/customers/CustomerList'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { InvoiceDetail } from '@/features/invoices/InvoiceDetail'
import { InvoiceList } from '@/features/invoices/InvoiceList'
import { PaymentForm } from '@/features/invoices/PaymentForm'
import { RentalDetail } from '@/features/rentals/RentalDetail'
import { RentalForm } from '@/features/rentals/RentalForm'
import { RentalList } from '@/features/rentals/RentalList'
import { RevenueReport } from '@/features/reports/RevenueReport'
import { GeneralSettings } from '@/features/settings/GeneralSettings'
import { UserManagement } from '@/features/settings/UserManagement'
import { StaffDetail } from '@/features/staff/StaffDetail'
import { StaffForm } from '@/features/staff/StaffForm'
import { StaffList } from '@/features/staff/StaffList'
import { useAuthStore } from '@/stores/authStore'
import { ProtectedRoute } from './ProtectedRoute'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    login()

    const redirectPath =
      (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
    navigate(redirectPath || '/dashboard', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h1 className="text-xl font-semibold tracking-tight">Login</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Use any email and password to continue.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/assets" element={<AssetList />} />
          <Route path="/assets/new" element={<AssetForm />} />
          <Route path="/assets/:id" element={<AssetDetail />} />

          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />

          <Route path="/rentals" element={<RentalList />} />
          <Route path="/rentals/new" element={<RentalForm />} />
          <Route path="/rentals/:id" element={<RentalDetail />} />

          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/invoices/:id/payment" element={<PaymentForm />} />

          <Route path="/staff" element={<StaffList />} />
          <Route path="/staff/new" element={<StaffForm />} />
          <Route path="/staff/:id" element={<StaffDetail />} />

          <Route
            path="/reports/revenue"
            element={<RevenueReport />}
          />

          <Route
            path="/settings/general"
            element={<GeneralSettings />}
          />
          <Route path="/settings/users" element={<UserManagement />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

