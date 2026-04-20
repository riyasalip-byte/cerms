import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getAssetById } from '@/api/services'
import { type AssetStatus } from './mockAssets'

const statusClassMap: Record<AssetStatus, string> = {
  available:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  rented: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  maintenance:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

function formatStatus(status: AssetStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function AssetDetail() {
  const { id } = useParams()
  
  const {
    data: asset,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['assets', id],
    queryFn: () => getAssetById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <section className="px-4 py-6 text-sm text-slate-600 dark:text-slate-300">
        Loading asset details...
      </section>
    )
  }

  if (isError || !asset) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h1 className="text-xl font-semibold text-rose-600 dark:text-rose-400">
          Asset not found
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No asset matches ID: {id}
        </p>
        <Link
          to="/assets"
          className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Back to assets
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{asset.name}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{asset.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/assets/new?assetId=${asset.id}`}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Edit Asset
          </Link>
          <Link
            to="/assets"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            Back to list
          </Link>
        </div>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
            <p className="mt-1 font-medium">{asset.category}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Serial Number</p>
            <p className="mt-1 font-medium">{asset.serialNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
            <p className="mt-1 font-medium">{asset.location}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Daily Rate</p>
            <p className="mt-1 font-medium">${asset.dailyRate}/day</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
            <span
              className={[
                'mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                statusClassMap[asset.status],
              ].join(' ')}
            >
              {formatStatus(asset.status)}
            </span>
          </div>
        </div>
      </article>
    </section>
  )
}

