import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { mockAssets, type AssetStatus } from './mockAssets'

type AssetFormValues = {
  name: string
  category: string
  serialNumber: string
  location: string
  dailyRate: string
  status: AssetStatus
}

export function AssetForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editAssetId = searchParams.get('assetId')

  const existingAsset = useMemo(
    () => mockAssets.find((asset) => asset.id === editAssetId),
    [editAssetId],
  )

  const [formValues, setFormValues] = useState<AssetFormValues>({
    name: existingAsset?.name ?? '',
    category: existingAsset?.category ?? '',
    serialNumber: existingAsset?.serialNumber ?? '',
    location: existingAsset?.location ?? '',
    dailyRate: existingAsset ? String(existingAsset.dailyRate) : '',
    status: existingAsset?.status ?? 'available',
  })

  const isEditMode = Boolean(existingAsset)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/assets', { replace: true })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditMode ? 'Edit Asset' : 'Create Asset'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Dummy form only. Submitted data is not persisted.
          </p>
        </div>
        <Link
          to="/assets"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        >
          Back to assets
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Name</span>
            <input
              required
              value={formValues.name}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="Excavator EX-21"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Category</span>
            <input
              required
              value={formValues.category}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, category: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="Heavy Equipment"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Serial Number</span>
            <input
              required
              value={formValues.serialNumber}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  serialNumber: event.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="EX21-AX-9901"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Location</span>
            <input
              required
              value={formValues.location}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, location: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="Yard A"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Daily Rate</span>
            <input
              required
              min="0"
              step="1"
              type="number"
              value={formValues.dailyRate}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, dailyRate: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="150"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select
              value={formValues.status}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  status: event.target.value as AssetStatus,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {isEditMode ? 'Save Changes' : 'Create Asset'}
          </button>
          <Link
            to="/assets"
            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}

