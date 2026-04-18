import { useState } from 'react'
import type { FormEvent } from 'react'

type GeneralSettingsValues = {
  companyName: string
  supportEmail: string
  timezone: string
  defaultCurrency: string
}

const initialValues: GeneralSettingsValues = {
  companyName: 'CERMS Equipment Rentals',
  supportEmail: 'support@cerms.com',
  timezone: 'UTC-05:00',
  defaultCurrency: 'USD',
}

export function GeneralSettings() {
  const [values, setValues] = useState<GeneralSettingsValues>(initialValues)
  const [saved, setSaved] = useState(false)

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">General Settings</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Configure system defaults for your organization.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Company Name</span>
            <input
              value={values.companyName}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, companyName: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Support Email</span>
            <input
              type="email"
              value={values.supportEmail}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, supportEmail: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Timezone</span>
            <select
              value={values.timezone}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, timezone: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="UTC-08:00">UTC-08:00</option>
              <option value="UTC-05:00">UTC-05:00</option>
              <option value="UTC+00:00">UTC+00:00</option>
              <option value="UTC+05:30">UTC+05:30</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Default Currency</span>
            <select
              value={values.defaultCurrency}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, defaultCurrency: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Save Settings
          </button>
          {saved && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              Settings saved (dummy).
            </span>
          )}
        </div>
      </form>
    </section>
  )
}

