import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import { useUtilisationReport, useMaintenanceCostReport, usePayrollReport } from '@/hooks/useReports'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function ReportsOverview() {
  const { data: utilisation, isLoading: isUtilLoading } = useUtilisationReport()
  const { data: maintenance, isLoading: isMainLoading } = useMaintenanceCostReport()
  const { data: payroll, isLoading: isPayLoading } = usePayrollReport()

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports Overview</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Summary of asset performance, maintenance, and staff payroll.
          </p>
        </div>
        <Link
          to="/reports/revenue"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          View Detailed Revenue
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Asset Utilisation Pie Chart */}
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Asset Utilisation (%)</h2>
            <Link to="/reports/utilisation" className="text-xs font-medium text-blue-600 hover:text-blue-700">View Details</Link>
          </div>
          {isUtilLoading ? (
            <div className="flex h-64 items-center justify-center">Loading...</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={utilisation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="label"
                    label
                  >
                    {utilisation?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        {/* Staff Payroll Bar Chart */}
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Staff Payroll Summary</h2>
          {isPayLoading ? (
            <div className="flex h-64 items-center justify-center">Loading...</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payroll} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="label" type="category" fontSize={12} width={100} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Monthly Salary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        {/* Maintenance Cost Bar Chart */}
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Maintenance Cost per Asset</h2>
          {isMainLoading ? (
            <div className="flex h-64 items-center justify-center">Loading...</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Maintenance Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </div>
    </section>
  )
}
