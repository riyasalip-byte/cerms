import { useState, useEffect, useMemo } from 'react'
import {
  useMyAssignments,
  useAcceptAssignment,
  useStartAssignment,
  useCompleteAssignment,
  useGenerateAssignmentInvoice
} from '@/hooks/useOperators'
import { offlineQueue } from '@/api/offlineQueue'
import { invoiceService } from '@/api/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Layers, 
  MapPin, 
  Gauge, 
  FileText, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  Clipboard,
  Smartphone,
  Download,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import type { OperatorAssignment } from '@/api/operators'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

export function OperatorDashboardPage() {
  const { data: assignments, isLoading, refetch } = useMyAssignments()
  const { user } = useAuthStore()
  const acceptMutation = useAcceptAssignment()
  const startMutation = useStartAssignment()
  const completeMutation = useCompleteAssignment()
  const generateInvoiceMutation = useGenerateAssignmentInvoice()

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [unsyncedCount, setUnsyncedCount] = useState(0)
  const [offlineActions, setOfflineActions] = useState<any[]>([])

  // Dialog states
  const [selectedJob, setSelectedJob] = useState<OperatorAssignment | null>(null)
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)

  // Form states
  const [startMeter, setStartMeter] = useState('')
  const [startRemarks, setStartRemarks] = useState('')
  const [endMeter, setEndMeter] = useState('')
  const [completeRemarks, setCompleteRemarks] = useState('')

  const normalizedAssignments = useMemo(() => {
    if (!Array.isArray(assignments)) return []
    const statusMap: Record<string | number, number> = {
      'Assigned': 0, 0: 0,
      'Accepted': 1, 1: 1,
      'Started': 2, 2: 2,
      'Completed': 3, 3: 3,
      'Closed': 4, 4: 4
    }
    return assignments
      .filter(job => job !== null && job !== undefined)
      .map(job => {
        let currentStatus = statusMap[job.assignmentStatus] ?? 0
        let startMeterReading = job.startMeterReading
        let endMeterReading = job.endMeterReading
        let actualStartDateTime = job.actualStartDateTime
        let actualEndDateTime = job.actualEndDateTime
        let invoiceId = job.invoiceId

        // Chronologically merge any unsynced offline actions to progress the UI offline
        const pendingActions = offlineActions
          .filter(a => a.assignmentId === job.id && !a.synced)
          .sort((a, b) => a.timestamp - b.timestamp)

        for (const action of pendingActions) {
          if (action.actionType === 'accept') {
            currentStatus = Math.max(currentStatus, 1)
          } else if (action.actionType === 'start') {
            currentStatus = Math.max(currentStatus, 2)
            if (action.data) {
              startMeterReading = action.data.startMeterReading
              actualStartDateTime = action.data.actualStartDateTime
            }
          } else if (action.actionType === 'complete') {
            currentStatus = Math.max(currentStatus, 3)
            if (action.data) {
              endMeterReading = action.data.endMeterReading
              actualEndDateTime = action.data.actualEndDateTime
            }
          } else if (action.actionType === 'generate-invoice') {
            currentStatus = Math.max(currentStatus, 4)
            invoiceId = invoiceId || `offline-inv-${job.id}`
          }
        }

        return {
          ...job,
          assignmentStatus: currentStatus,
          startMeterReading,
          endMeterReading,
          actualStartDateTime,
          actualEndDateTime,
          invoiceId
        }
      })
  }, [assignments, offlineActions])


  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncLocalQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    updateUnsyncedCount()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateUnsyncedCount = async () => {
    const queue = await offlineQueue.getAssignmentQueue()
    setUnsyncedCount(queue.filter(q => !q.synced).length)
    setOfflineActions(queue)
  }

  const syncLocalQueue = async () => {
    toast.info('Connection restored. Auto-syncing pending dispatches...')
    await offlineQueue.syncQueue()
    updateUnsyncedCount()
    refetch()
  }

  // Helper: Get status label and color
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Assigned</Badge>
      case 1:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Accepted</Badge>
      case 2:
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 animate-pulse">In Progress</Badge>
      case 3:
        return <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100 border-violet-200">Work Completed</Badge>
      case 4:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">Invoice Generated</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>
    }
  }

  // Workflows
  const handleAccept = async (job: OperatorAssignment) => {
    if (!isOnline) {
      await offlineQueue.addAssignmentAction({
        assignmentId: job.id,
        actionType: 'accept',
        timestamp: Date.now()
      })
      toast.success('Action queued. Accepted locally.')
      updateUnsyncedCount()
      refetch()
      return
    }

    acceptMutation.mutate(job.id, {
      onSuccess: () => refetch()
    })
  }

  const handleStartWork = async () => {
    if (!selectedJob) return
    const meterVal = parseFloat(startMeter)
    if (isNaN(meterVal) || meterVal < 0) {
      toast.error('Please enter a valid positive start meter reading.')
      return
    }

    const payload = {
      startMeterReading: meterVal,
      remarks: startRemarks,
      actualStartDateTime: new Date().toISOString()
    }

    if (!isOnline) {
      await offlineQueue.addAssignmentAction({
        assignmentId: selectedJob.id,
        actionType: 'start',
        data: payload,
        timestamp: Date.now()
      })
      toast.success('Action queued. Rental started locally.')
      setIsStartOpen(false)
      setSelectedJob(null)
      setStartMeter('')
      setStartRemarks('')
      updateUnsyncedCount()
      refetch()
      return
    }

    startMutation.mutate(
      { id: selectedJob.id, payload },
      {
        onSuccess: () => {
          setIsStartOpen(false)
          setSelectedJob(null)
          setStartMeter('')
          setStartRemarks('')
          refetch()
        }
      }
    )
  }

  const handleCompleteWork = async () => {
    if (!selectedJob) return
    const meterVal = parseFloat(endMeter)
    if (isNaN(meterVal) || meterVal < 0) {
      toast.error('Please enter a valid positive end meter reading.')
      return
    }

    const startMeterReading = selectedJob.startMeterReading || 0
    if (meterVal < startMeterReading) {
      toast.error(`End meter reading cannot be less than start meter reading (${startMeterReading}).`)
      return
    }

    const payload = {
      endMeterReading: meterVal,
      remarks: completeRemarks,
      actualEndDateTime: new Date().toISOString()
    }

    if (!isOnline) {
      await offlineQueue.addAssignmentAction({
        assignmentId: selectedJob.id,
        actionType: 'complete',
        data: payload,
        timestamp: Date.now()
      })
      toast.success('Action queued. Rental completed locally.')
      setIsCompleteOpen(false)
      setSelectedJob(null)
      setEndMeter('')
      setCompleteRemarks('')
      updateUnsyncedCount()
      refetch()
      return
    }

    completeMutation.mutate(
      { id: selectedJob.id, payload },
      {
        onSuccess: () => {
          setIsCompleteOpen(false)
          setSelectedJob(null)
          setEndMeter('')
          setCompleteRemarks('')
          refetch()
        }
      }
    )
  }

  const handleGenerateInvoice = async () => {
    if (!selectedJob) return

    if (!isOnline) {
      await offlineQueue.addAssignmentAction({
        assignmentId: selectedJob.id,
        actionType: 'generate-invoice',
        timestamp: Date.now()
      })
      toast.success('Action queued. Invoice requested locally.')
      setIsInvoiceOpen(false)
      setSelectedJob(null)
      updateUnsyncedCount()
      refetch()
      return
    }

    generateInvoiceMutation.mutate(selectedJob.id, {
      onSuccess: () => {
        setIsInvoiceOpen(false)
        setSelectedJob(null)
        refetch()
      }
    })
  }

  // Previews
  const safeFormatDate = (dateStr: any) => {
    if (!dateStr) return 'N/A'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return date.toLocaleDateString()
    } catch (e) {
      return 'Invalid Date'
    }
  }

  const getUsageHours = (job: OperatorAssignment) => {
    if (!job) return 0
    try {
      const startStr = job.actualStartDateTime || job.startDateTime
      const endStr = job.actualEndDateTime
      if (!startStr) return 0
      const start = new Date(startStr)
      const end = endStr ? new Date(endStr) : new Date()
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
      const diffMs = end.getTime() - start.getTime()
      const hours = diffMs / (1000 * 60 * 60)
      return Math.max(0.1, Number(hours.toFixed(1)))
    } catch (e) {
      console.error("Error in getUsageHours:", e)
      return 0
    }
  }

  const getOdometerUsage = (job: OperatorAssignment) => {
    if (!job) return 0
    const end = parseFloat(endMeter) || job.endMeterReading || 0
    const start = job.startMeterReading || 0
    return Math.max(0, end - start)
  }

  const getRentalCharge = (job: OperatorAssignment) => {
    if (!job) return 0
    const rate = job.rateAmount || 0
    const hours = getUsageHours(job)
    return Number((rate * hours).toFixed(2))
  }

  const getTotalCharge = (job: OperatorAssignment) => {
    if (!job) return 0
    const rentalCharge = getRentalCharge(job)
    const transportCharge = (job.pickupTransportCharge || 0) + (job.returnTransportCharge || 0)
    return Number((rentalCharge + transportCharge).toFixed(2))
  }

  // Previews & Offline Slip Downloads
  const handleDownloadReceiptOffline = (job: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print the receipt.')
      return
    }

    const hours = getUsageHours(job)
    const rate = job.rateAmount || 0
    const rentalCharge = rate * hours
    const transportCharge = (job.pickupTransportCharge || 0) + (job.returnTransportCharge || 0)
    const grossAmount = rentalCharge + transportCharge

    const htmlContent = `
      <html>
        <head>
          <title>Operational Invoice - ${job.assetCode}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; max-width: 600px; margin: auto; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #059669; margin-bottom: 5px; }
            .title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .row.total { font-size: 18px; font-weight: 800; border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 15px; }
            .value { font-weight: bold; text-align: right; }
            .badge { display: inline-block; padding: 4px 8px; font-size: 10px; font-weight: bold; background: #fffbeb; border-radius: 4px; color: #b45309; border: 1px solid #fde68a; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">CERMS</div>
            <div class="title">Operator Billing Slip (Offline)</div>
          </div>
          
          <div class="section">
            <div class="section-title">Rental Information</div>
            <div class="row"><span>Customer Name</span><span class="value">${job.customerName}</span></div>
            <div class="row"><span>Equipment Asset</span><span class="value">${job.assetName} (${job.assetCode})</span></div>
            <div class="row"><span>Status</span><span class="value"><span class="badge">Offline Sync Pending</span></span></div>
          </div>

          <div class="section">
            <div class="section-title">Metrics Logged</div>
            <div class="row"><span>Start Odometer</span><span class="value">${job.startMeterReading} Hrs</span></div>
            <div class="row"><span>End Odometer</span><span class="value">${job.endMeterReading} Hrs</span></div>
            <div class="row"><span>Total Hours Operated</span><span class="value">${hours} Hrs</span></div>
          </div>

          <div class="section">
            <div class="section-title">Billing Breakdown</div>
            <div class="row"><span>Cycle Rate</span><span class="value">₹${rate.toFixed(2)}/Hr</span></div>
            <div class="row"><span>Rental Cost</span><span class="value">₹${rentalCharge.toFixed(2)}</span></div>
            <div class="row"><span>Logistical Transport Fee</span><span class="value">₹${transportCharge.toFixed(2)}</span></div>
            <div class="row total"><span>Total Amount Due</span><span class="value" style="color: #059669;">₹${grossAmount.toFixed(2)}</span></div>
          </div>

          <div class="footer">
            <p>Generated offline by CERMS Operator Portal on ${new Date().toLocaleString()}</p>
            <button onclick="window.print()" class="no-print" style="margin-top: 15px; padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">Print / Save as PDF</button>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const handleShareReceipt = async (job: any) => {
    const hours = getUsageHours(job)
    const rate = job.rateAmount || 0
    const rentalCharge = rate * hours
    const transportCharge = (job.pickupTransportCharge || 0) + (job.returnTransportCharge || 0)
    const grossAmount = rentalCharge + transportCharge

    const shareText = `*CERMS Operator Invoice Slip (Offline)*\n` +
      `----------------------------------\n` +
      `*Client:* ${job.customerName}\n` +
      `*Equipment:* ${job.assetName} (${job.assetCode})\n` +
      `*Hours Worked:* ${hours} Hrs\n` +
      `*Rate:* ₹${rate.toFixed(2)}/Hr\n` +
      `*Rental Charge:* ₹${rentalCharge.toFixed(2)}\n` +
      `*Logistics Charge:* ₹${transportCharge.toFixed(2)}\n` +
      `----------------------------------\n` +
      `*Total Amount:* ₹${grossAmount.toFixed(2)}\n` +
      `----------------------------------\n` +
      `Generated offline by CERMS Operator Portal.`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice - ${job.assetCode}`,
          text: shareText
        })
        toast.success('Shared successfully!')
      } catch (error) {
        console.error('Sharing failed:', error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        toast.success('Invoice text copied to clipboard! You can now paste and share it.')
      } catch (e) {
        toast.error('Sharing not supported on this browser.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          <span className="text-sm font-medium text-slate-500">Loading your assignments...</span>
        </div>
      </div>
    )
  }


  const list = normalizedAssignments
  
  // Categorize jobs
  const todayJobs = list.filter(j => j.assignmentStatus === 2) // Started (In Progress)
  const upcomingJobs = list.filter(j => j.assignmentStatus === 0 || j.assignmentStatus === 1) // Assigned or Accepted
  const completedJobs = list.filter(j => j.assignmentStatus === 3 || j.assignmentStatus === 4) // Completed or Closed

  const getBorderLeftColor = (status: number) => {
    switch (status) {
      case 0: return "border-l-amber-500"
      case 1: return "border-l-blue-500"
      case 2: return "border-l-emerald-500"
      case 3: return "border-l-violet-500"
      case 4: return "border-l-slate-400"
      default: return "border-l-slate-200"
    }
  }

  const renderJobCard = (job: OperatorAssignment) => {
    return (
      <Card key={job.id} className={cn(
        "overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900 rounded-3xl border-l-4",
        getBorderLeftColor(job.assignmentStatus)
      )}>
        <CardHeader className="space-y-3 p-5 pb-4 border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {getStatusBadge(job.assignmentStatus)}
            <span className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Calendar className="size-3 text-slate-300" />
              ASSIGNED: {safeFormatDate(job.assignedAt)}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-sm border border-slate-100 dark:border-slate-700">
              {job.customerName?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
                {job.customerName}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <Layers className="size-3.5 shrink-0" />
                {job.assetName} <span className="text-[10px] bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded-md dark:bg-emerald-950/30 dark:text-emerald-400 font-mono">({job.assetCode})</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 p-4 border border-slate-100/50 dark:border-slate-800/40">
            <div className="space-y-1">
              <span className="text-slate-400 block text-[9px] uppercase font-extrabold tracking-wider">Odometer Tracking</span>
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Gauge className="size-4 text-emerald-500" />
                {job.startMeterReading !== null && job.startMeterReading !== undefined ? `${job.startMeterReading} Hrs` : 'Not Started'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block text-[9px] uppercase font-extrabold tracking-wider">Planned Start Date</span>
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="size-4 text-amber-500" />
                {safeFormatDate(job.startDateTime)}
              </span>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="flex gap-3 rounded-2xl bg-rose-500/[0.02] border border-rose-500/5 p-4 text-xs">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-950/20">
              <MapPin className="size-4 shrink-0" />
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[9px] uppercase font-extrabold tracking-wider">Delivery Location</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{job.siteName || 'Not Specified'}</span>
              <span className="block text-slate-500 text-[10px] leading-relaxed mt-0.5">{job.siteAddress}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-1">
            {job.assignmentStatus === 0 && (
              <Button 
                className="w-full h-11 text-xs font-bold rounded-xl bg-primary shadow-md hover:bg-primary/95 hover:shadow-lg transition-all"
                onClick={() => handleAccept(job)}
              >
                Accept Assignment
              </Button>
            )}

            {job.assignmentStatus === 1 && (
              <Button 
                className="w-full h-11 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                onClick={() => {
                  setSelectedJob(job)
                  setIsStartOpen(true)
                }}
              >
                <Play className="size-4 fill-white" /> Start Rental Work
              </Button>
            )}

            {job.assignmentStatus === 2 && (
              <Button 
                className="w-full h-11 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                onClick={() => {
                  setSelectedJob(job)
                  setIsCompleteOpen(true)
                }}
              >
                <CheckCircle className="size-4" /> Complete Work & Return
              </Button>
            )}

            {job.assignmentStatus === 3 && (
              <Button 
                className="w-full h-11 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                onClick={() => {
                  setSelectedJob(job)
                  setIsInvoiceOpen(true)
                }}
              >
                <FileText className="size-4" /> Preview & Generate Invoice
              </Button>
            )}

            {job.assignmentStatus === 4 && (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline"
                    className="flex-1 h-11 text-xs font-bold rounded-xl border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300 flex items-center justify-center gap-1.5"
                    onClick={async () => {
                      if (!isOnline || String(job.invoiceId).startsWith('offline-inv')) {
                        handleDownloadReceiptOffline(job)
                        return
                      }
                      if (!job.invoiceId) {
                        toast.error('Invoice details not found.')
                        return
                      }
                      try {
                        toast.loading('Downloading invoice PDF...', { id: 'pdf-download' })
                        const blob = await invoiceService.getPdf(job.invoiceId)
                        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
                        const link = document.createElement('a')
                        link.href = url
                        link.setAttribute('download', `Invoice-${job.assetCode || job.id}.pdf`)
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        toast.success('Invoice PDF downloaded successfully!', { id: 'pdf-download' })
                      } catch (e) {
                        console.error("PDF download error:", e)
                        toast.error('Failed to download invoice PDF.', { id: 'pdf-download' })
                      }
                    }}
                  >
                    <Download className="size-4" /> Get PDF Invoice
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 px-4 text-xs font-bold rounded-xl border-emerald-250 text-emerald-600 dark:border-emerald-800 dark:text-emerald-450 hover:bg-emerald-50/50 flex items-center justify-center gap-1.5"
                    onClick={() => handleShareReceipt(job)}
                  >
                    <Smartphone className="size-4 animate-pulse" /> Share
                  </Button>
                </div>
                <div className="w-full text-center">
                  <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-700 border-none font-bold text-[10px] uppercase rounded-lg px-2.5 py-0.5">
                    {String(job.invoiceId).startsWith('offline-inv') ? "Offline Sync Pending" : "Closed"}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24">
      {/* Visual Connectivity Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/80 dark:bg-slate-950/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20">
            <Smartphone className="size-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Operator Command Center</h1>
            <p className="text-xs text-slate-500 font-semibold">Logged in as: <span className="text-emerald-600 dark:text-emerald-400">{user?.username || "Alex Operator"}</span></p>
          </div>
        </div>
        
        {/* Connectivity Status Badge */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/10 dark:text-emerald-400 gap-1 font-bold">
              <Wifi className="size-3 animate-pulse" /> Online
            </Badge>
          ) : (
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/10 dark:text-rose-400 gap-1 font-bold">
              <WifiOff className="size-3" /> Offline
            </Badge>
          )}

          {unsyncedCount > 0 && (
            <Badge className="bg-amber-500 hover:bg-amber-600 animate-bounce text-white font-bold">
              {unsyncedCount} Syncing
            </Badge>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-xl p-6 space-y-6">
        {/* Connection Notice */}
        {!isOnline && (
          <div className="flex gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wide">Offline Mode Enabled</p>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">Odometer inputs and statuses are recorded locally in IndexedDB and will automatically sync when network is restored.</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="active" className="w-full flex flex-col gap-6">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-slate-100/80 p-1 dark:bg-slate-900 rounded-2xl shadow-inner border border-slate-200/50 dark:border-slate-800/40">
            <TabsTrigger value="active" className="rounded-xl font-bold text-xs gap-1.5 transition-all">
              <Play className="size-3.5 fill-current" /> Active ({todayJobs.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl font-bold text-xs gap-1.5 transition-all">
              <Clock className="size-3.5" /> Assigned ({upcomingJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl font-bold text-xs gap-1.5 transition-all">
              <CheckCircle className="size-3.5" /> History ({completedJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {todayJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm">
                <Play className="size-10 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
                <h3 className="font-extrabold text-slate-900 dark:text-white">No Active Jobs</h3>
                <p className="text-xs text-slate-500 mt-1 px-8 leading-relaxed max-w-sm">You are not currently running any equipment. Head to the "Assigned" tab to accept or start your next dispatch.</p>
              </div>
            ) : (
              todayJobs.map(job => renderJobCard(job))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm">
                <Clock className="size-10 text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="font-extrabold text-slate-900 dark:text-white">No Assigned Jobs</h3>
                <p className="text-xs text-slate-500 mt-1 px-8 leading-relaxed max-w-sm">Excellent! All dispatches are completed. Keep checking back here for new dispatches assigned by the administrator.</p>
              </div>
            ) : (
              upcomingJobs.map(job => renderJobCard(job))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm">
                <CheckCircle className="size-10 text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="font-extrabold text-slate-900 dark:text-white">No Operational History</h3>
                <p className="text-xs text-slate-500 mt-1 px-8 leading-relaxed max-w-sm">No historical log found. Once you complete work and finalize the operator invoice, it will log here.</p>
              </div>
            ) : (
              completedJobs.map(job => renderJobCard(job))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* START RENTAL DIALOG */}
      <Dialog open={isStartOpen} onOpenChange={setIsStartOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Start Equipment Rental</DialogTitle>
            <DialogDescription className="text-xs">
              Input the current machine meter reading to activate dispatch for <span className="font-semibold text-emerald-600">{selectedJob?.assetName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="startMeter" className="text-xs font-bold text-slate-600">Start Meter Reading (Hours / Km)</Label>
              <div className="relative">
                <Input
                  id="startMeter"
                  type="number"
                  placeholder="e.g. 1250"
                  value={startMeter}
                  onChange={(e) => setStartMeter(e.target.value)}
                  className="pl-9 h-11 rounded-xl focus:ring-emerald-500/20"
                />
                <Gauge className="absolute left-3 top-3.5 size-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startRemarks" className="text-xs font-bold text-slate-600">Start Remarks / Condition</Label>
              <Textarea
                id="startRemarks"
                placeholder="Remarks about the machine condition, site readiness, etc."
                value={startRemarks}
                onChange={(e) => setStartRemarks(e.target.value)}
                className="rounded-xl focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-xs items-start">
              <Clipboard className="size-4 shrink-0 text-slate-500 mt-0.5" />
              <div>
                <span className="font-bold block">Timestamp Recorded</span>
                <span className="text-slate-500 text-[10px]">Actual start date and time will be recorded as: <strong className="text-slate-800 dark:text-slate-200">{new Date().toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => {
              setIsStartOpen(false)
              setSelectedJob(null)
            }}>Cancel</Button>
            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleStartWork}>Start Rental</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COMPLETE RENTAL DIALOG */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Complete Equipment Rental</DialogTitle>
            <DialogDescription className="text-xs">
              Review and record the closing metrics to return the asset from the field.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Odometer started at:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedJob?.startMeterReading} Hrs</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Current work hours:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {selectedJob && `${getUsageHours(selectedJob)} Hrs`}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endMeter" className="text-xs font-bold text-slate-600">End Meter Reading (Odometer / Hrs)</Label>
              <div className="relative">
                <Input
                  id="endMeter"
                  type="number"
                  placeholder="e.g. 1275"
                  value={endMeter}
                  onChange={(e) => setEndMeter(e.target.value)}
                  className="pl-9 h-11 rounded-xl focus:ring-rose-500/20"
                />
                <Gauge className="absolute left-3 top-3.5 size-4 text-slate-400" />
              </div>
              {selectedJob && endMeter && (
                <p className="text-[10px] text-slate-500 pl-1">
                  Calculated usage: <strong className="text-slate-800 dark:text-slate-200">{getOdometerUsage(selectedJob)} Hrs</strong>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="completeRemarks" className="text-xs font-bold text-slate-600">Completion Remarks</Label>
              <Textarea
                id="completeRemarks"
                placeholder="Odometer condition, fuel level, pickup instructions, transport vehicle notes..."
                value={completeRemarks}
                onChange={(e) => setCompleteRemarks(e.target.value)}
                className="rounded-xl focus:ring-rose-500/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => {
              setIsCompleteOpen(false)
              setSelectedJob(null)
            }}>Cancel</Button>
            <Button className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white" onClick={handleCompleteWork}>Complete & Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OPERATOR INVOICE PREVIEW DIALOG */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Operator Billing Invoice</DialogTitle>
            <DialogDescription className="text-xs">
              Preview the dynamic rate calculations based on active rental timelines.
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4 py-3">
              <div className="rounded-2xl border border-slate-100 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-dashed border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Billing Category</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400"> Odometer Billing</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Odometer Overage (Hours)</span>
                    <span className="font-semibold">{getUsageHours(selectedJob)} Hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreed Cycle Rate</span>
                    <span className="font-semibold">₹{selectedJob.rateAmount?.toFixed(2)}/Hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rental Amount</span>
                    <span className="font-semibold">₹{getRentalCharge(selectedJob).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Logistical Transport Charge</span>
                    <span className="font-semibold">₹{((selectedJob.pickupTransportCharge || 0) + (selectedJob.returnTransportCharge || 0)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">Gross Amount Due</span>
                  <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">₹{getTotalCharge(selectedJob).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 rounded-xl bg-violet-50 dark:bg-violet-950/20 p-3 text-xs items-start border border-violet-100">
                <FileText className="size-4 shrink-0 text-violet-600 mt-0.5" />
                <div>
                  <span className="font-bold block text-violet-900 dark:text-violet-400">PDF Invoice Seeding</span>
                  <span className="text-slate-500 text-[10px]">Generating will seal these ledger values, flag the dispatch as completed in the central database, and generate the printable operator slip.</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => {
              setIsInvoiceOpen(false)
              setSelectedJob(null)
            }}>Cancel</Button>
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white" onClick={handleGenerateInvoice}>Generate Invoice PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
