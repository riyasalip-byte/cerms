import { useMemo, useState } from 'react'
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

type RevenueDataPoint = {
  month: string
  revenue: number
  target: number
}

const revenueData: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 42000, target: 40000 },
  { month: 'Feb', revenue: 45500, target: 42000 },
  { month: 'Mar', revenue: 51000, target: 45000 },
  { month: 'Apr', revenue: 53000, target: 47000 },
  { month: 'May', revenue: 56500, target: 50000 },
  { month: 'Jun', revenue: 59200, target: 52000 },
  { month: 'Jul', revenue: 61000, target: 55000 },
  { month: 'Aug', revenue: 64500, target: 58000 },
  { month: 'Sep', revenue: 63200, target: 60000 },
  { month: 'Oct', revenue: 68000, target: 62000 },
  { month: 'Nov', revenue: 70200, target: 64000 },
  { month: 'Dec', revenue: 74000, target: 68000 },
]

const monthOptions = revenueData.map((d) => d.month)

export function RevenueReport() {
  const [fromMonth, setFromMonth] = useState('Jan')
  const [toMonth, setToMonth] = useState('Dec')

  const filteredData = useMemo(() => {
    const fromIndex = monthOptions.indexOf(fromMonth)
    const toIndex = monthOptions.indexOf(toMonth)

    if (fromIndex === -1 || toIndex === -1 || fromIndex > toIndex) {
      return []
    }

    return revenueData.slice(fromIndex, toIndex + 1)
  }, [fromMonth, toMonth])

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        acc.revenue += item.revenue
        acc.target += item.target
        return acc
      },
      { revenue: 0, target: 0 },
    )
  }, [filteredData])

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Revenue Report</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Monthly revenue performance overview using dummy data.
        </p>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1">
            <span className="text-sm font-medium">From Month</span>
            <select
              value={fromMonth}
              onChange={(event) => setFromMonth(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">To Month</span>
            <select
              value={toMonth}
              onChange={(event) => setToMonth(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Revenue Total</p>
            <p className="mt-1 text-lg font-semibold">${totals.revenue.toLocaleString()}</p>
          </div>

          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Target Total</p>
            <p className="mt-1 text-lg font-semibold">${totals.target.toLocaleString()}</p>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="text-lg font-semibold tracking-tight">Revenue vs Target</h2>
        {filteredData.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Invalid date range. Choose a "From" month before "To" month.
          </p>
        ) : (
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f172a"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#64748b"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="text-lg font-semibold tracking-tight">Revenue Breakdown</h2>
        {filteredData.length > 0 && (
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>
    </section>
  )
}

