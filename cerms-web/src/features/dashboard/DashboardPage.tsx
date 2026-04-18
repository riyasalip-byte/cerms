const kpiCards = [
  { label: 'Total Assets', value: '1,248', trend: '+3.2% vs last month' },
  { label: 'Active Rentals', value: '312', trend: '+1.1% vs yesterday' },
  { label: 'Revenue', value: '$84,560', trend: '+8.4% this month' },
]

const todaysAssignments = [
  {
    id: 'ASG-1001',
    assignee: 'Alex Carter',
    asset: 'Excavator EX-21',
    dueTime: '09:30 AM',
    status: 'In Progress',
  },
  {
    id: 'ASG-1002',
    assignee: 'Mia Johnson',
    asset: 'Forklift FL-08',
    dueTime: '11:00 AM',
    status: 'Pending',
  },
  {
    id: 'ASG-1003',
    assignee: 'Noah Rivera',
    asset: 'Generator GN-14',
    dueTime: '02:15 PM',
    status: 'Completed',
  },
]

const assetStatus = [
  { label: 'Available', count: 684, color: 'bg-emerald-500' },
  { label: 'Rented', count: 312, color: 'bg-blue-500' },
  { label: 'Maintenance', count: 143, color: 'bg-amber-500' },
  { label: 'Reserved', count: 109, color: 'bg-violet-500' },
]

const assignmentStatusClasses: Record<string, string> = {
  Completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'In Progress':
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

export function DashboardPage() {
  const totalAssets = assetStatus.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Overview of assets, rentals, and daily assignments.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card) => (
          <article
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
              {card.trend}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Today's Assignments</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {todaysAssignments.length} items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-4 font-medium">Assignment</th>
                  <th className="py-2 pr-4 font-medium">Assignee</th>
                  <th className="py-2 pr-4 font-medium">Asset</th>
                  <th className="py-2 pr-4 font-medium">Due</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {todaysAssignments.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">
                      {item.id}
                    </td>
                    <td className="py-3 pr-4">{item.assignee}</td>
                    <td className="py-3 pr-4">{item.asset}</td>
                    <td className="py-3 pr-4">{item.dueTime}</td>
                    <td className="py-3">
                      <span
                        className={[
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                          assignmentStatusClasses[item.status],
                        ].join(' ')}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <h2 className="text-lg font-semibold tracking-tight">Asset Status</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Total tracked assets: {totalAssets}
          </p>

          <div className="mt-5 grid gap-3">
            {assetStatus.map((item) => {
              const percentage = Math.round((item.count / totalAssets) * 100)
              return (
                <div key={item.label} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={['h-2 rounded-full', item.color].join(' ')}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </section>
    </div>
  )
}

