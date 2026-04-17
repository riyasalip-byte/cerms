import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/shared/AppLayout'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Placeholder content for {title}.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/assets" element={<PlaceholderPage title="Assets" />} />
        <Route path="/customers" element={<PlaceholderPage title="Customers" />} />
        <Route path="/rentals" element={<PlaceholderPage title="Rentals" />} />
        <Route path="/invoices" element={<PlaceholderPage title="Invoices" />} />
        <Route path="/staff" element={<PlaceholderPage title="Staff" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
