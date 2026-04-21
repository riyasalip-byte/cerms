import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useUtilisationReport } from '@/hooks/useReports'

export function UtilisationReport() {
  const { data, isLoading, isError } = useUtilisationReport()

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Asset Utilisation</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Utilisation percentage per asset type.
        </p>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold tracking-tight">Utilisation Breakdown</h2>
          {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>}
        </div>

        {isError && (
          <p className="text-sm text-rose-600">Failed to load utilisation data.</p>
        )}

        {!isLoading && !isError && (!data || data.length === 0) ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">No utilisation data available.</p>
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={12} tickMargin={10} />
                <YAxis fontSize={12} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Utilisation %" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{item.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{item.value}%</span>
              <span className={`text-xs font-medium ${item.value > 70 ? 'text-emerald-600' : item.value > 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                {item.value > 70 ? 'High' : item.value > 40 ? 'Moderate' : 'Low'}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div 
                className={`h-full rounded-full ${item.value > 70 ? 'bg-emerald-500' : item.value > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                style={{ width: `${item.value}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
