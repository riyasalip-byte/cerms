import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useRevenueReport } from '@/hooks/useReports'

export function RevenueReport() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading, isError } = useRevenueReport({ startDate, endDate })

  const chartData = data?.revenuePerDay || []
  const totalRevenue = data?.totalRevenue || 0

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Revenue Report</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Daily revenue performance overview from live data.
        </p>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1">
            <span className="text-sm font-medium">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800 flex flex-col justify-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Revenue</p>
            <p className="mt-1 text-lg font-semibold">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Revenue Trend</h2>
          {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>}
        </div>
        
        {isError && (
          <p className="text-sm text-rose-600">Failed to load revenue data.</p>
        )}

        {!isLoading && !isError && chartData.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No revenue records found for the selected period.
          </p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={12} tickMargin={10} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Revenue Breakdown</h2>
        {!isLoading && !isError && chartData.length > 0 && (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={12} tickMargin={10} />
                <YAxis fontSize={12} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="value" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>
    </section>
  )
}

