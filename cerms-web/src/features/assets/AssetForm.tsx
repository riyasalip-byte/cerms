import { useAsset, useCreateAsset, useUpdateAsset } from '@/hooks/useAssets'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

type AssetFormValues = {
  name: string
  assetType: string
  assetCode: string
  currentOdometer: number
  status: number
}

export function AssetForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const { data: existingAsset, isLoading } = useAsset(id!)
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()

  const [formValues, setFormValues] = useState<AssetFormValues>({
    name: '',
    assetType: '',
    assetCode: '',
    currentOdometer: 0,
    status: 0,
  })

  useEffect(() => {
    if (existingAsset) {
      setFormValues({
        name: existingAsset.name,
        assetType: existingAsset.assetType,
        assetCode: existingAsset.assetCode,
        currentOdometer: existingAsset.currentOdometer,
        status: existingAsset.status,
      })
    }
  }, [existingAsset])

  if (isEditMode && isLoading) {
    return (
      <div className="px-4 py-12 flex justify-center text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
          Loading asset data...
        </div>
      </div>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (isEditMode) {
      await updateAsset.mutateAsync({ 
        id: id!, 
        data: { 
          id: id!,
          status: formValues.status, 
          currentOdometer: formValues.currentOdometer 
        } 
      })
    } else {
      await createAsset.mutateAsync(formValues)
    }
    
    navigate('/assets')
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditMode ? 'Edit Asset' : 'Create Asset'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {isEditMode ? 'Update asset status and odometer.' : 'Register a new asset in the system.'}
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
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
            <input
              required
              disabled={isEditMode}
              value={formValues.name}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800/50"
              placeholder="Excavator EX-21"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Asset Type</span>
            <input
              required
              disabled={isEditMode}
              value={formValues.assetType}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, assetType: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800/50"
              placeholder="Heavy Equipment"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Asset Code</span>
            <input
              required
              disabled={isEditMode}
              value={formValues.assetCode}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  assetCode: event.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800/50"
              placeholder="EX21-AX-9901"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Odometer</span>
            <input
              required
              min="0"
              type="number"
              value={formValues.currentOdometer}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, currentOdometer: Number(event.target.value) }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="0"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
            <select
              value={formValues.status}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  status: Number(event.target.value),
                }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value={0}>Available</option>
              <option value={1}>Rented</option>
              <option value={2}>Maintenance</option>
              <option value={3}>Decommissioned</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={createAsset.isPending || updateAsset.isPending}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {(createAsset.isPending || updateAsset.isPending) ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Asset'}
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

