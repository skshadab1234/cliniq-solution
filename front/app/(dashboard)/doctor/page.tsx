'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { queuesApi, doctorApi, Token, MedicineItem } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DoctorHeader } from '@/components/doctor/DoctorHeader'
import { QueueStatusBanner } from '@/components/doctor/QueueStatusBanner'
import { CurrentPatientCard } from '@/components/doctor/CurrentPatientCard'
import { ActionButtons } from '@/components/doctor/ActionButtons'
import { WaitingInfo } from '@/components/doctor/WaitingInfo'
import { PrescriptionDialog } from '@/components/doctor/PrescriptionDialog'

export default function DoctorDashboard() {
  const { token, user } = useAuth()
  const [queueId, setQueueId] = useState<number | null>(null)
  const [queueStatus, setQueueStatus] = useState<string>('open')
  const [currentToken, setCurrentToken] = useState<Token | null>(null)
  const [nextToken, setNextToken] = useState<Token | null>(null)
  const [waitingCount, setWaitingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isActing, setIsActing] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  const [prescriptionOpen, setPrescriptionOpen] = useState(false)
  const [isPrescribing, setIsPrescribing] = useState(false)

  const { subscribe, isConnected } = useSocket(queueId)

  const fetchStatus = useCallback(async () => {
    if (!token) return
    setSetupError(null)
    try {
      // First ensure queue exists
      const queueResponse = await queuesApi.getToday(token)
      setQueueId(queueResponse.queue.id)
      setQueueStatus(queueResponse.queue.status)

      // Then get current state
      const response = await doctorApi.getCurrent(token)
      setCurrentToken(response.currentToken)
      setNextToken(response.nextToken)
      setWaitingCount(response.waitingCount)
      setQueueStatus(response.queueStatus)
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      if (err.code === 'NOT_FOUND') {
        // Create queue
        try {
          const createResponse = await queuesApi.create(token, {})
          setQueueId(createResponse.queue.id)
          setQueueStatus('open')
        } catch (createError: unknown) {
          const createErr = createError as { code?: string; message?: string }
          if (createErr.code === 'VALIDATION_ERROR' && createErr.message?.includes('clinicId')) {
            setSetupError('You are not assigned to any clinic. Please contact the admin to assign you to a clinic.')
          } else {
            setSetupError(createErr.message || 'Failed to create queue. Please contact admin.')
          }
        }
      } else if (err.message?.includes('clinicId') || err.message?.includes('clinic')) {
        setSetupError('You are not assigned to any clinic. Please contact the admin to assign you to a clinic.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000) // keep timer ticking smoothly
    return () => clearInterval(id)
  }, [])

  // Socket events
  useEffect(() => {
    if (!subscribe) return

    const unsubs = [
      subscribe('token:added', () => fetchStatus()),
      subscribe('token:status', () => fetchStatus()),
      subscribe('token:called', () => fetchStatus()),
      subscribe('queue:paused', () => {
        setQueueStatus('paused')
        fetchStatus()
      }),
      subscribe('queue:resumed', () => {
        setQueueStatus('open')
        fetchStatus()
      }),
      subscribe('queue:reopened', () => {
        setQueueStatus('open')
        fetchStatus()
      }),
    ]

    return () => unsubs.forEach(unsub => unsub())
  }, [subscribe, fetchStatus])

  const handleCallNext = async () => {
    if (!token) return
    setIsActing(true)
    try {
      const response = await doctorApi.callNext(token)
      setCurrentToken(response.token)
      setWaitingCount(response.waitingCount)
      toast.success(`Calling Token #${response.token.tokenNumber}`)
      fetchStatus()
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string }
      if (err.code === 'NO_PATIENTS') {
        toast.info('No patients waiting')
      } else if (err.code === 'PATIENT_IN_PROGRESS') {
        toast.warning('Complete current consultation first')
      } else {
        toast.error(err.message || 'Failed to call next')
      }
    } finally {
      setIsActing(false)
    }
  }

  const handleStart = async () => {
    if (!token) return
    setIsActing(true)
    try {
      const response = await doctorApi.start(token)
      setCurrentToken(response.token)
      toast.success('Consultation started')
      fetchStatus()
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || 'Failed to start')
    } finally {
      setIsActing(false)
    }
  }

  const handleComplete = async () => {
    if (!token) return
    setIsActing(true)
    try {
      const response = await doctorApi.complete(token)
      setCurrentToken(null)
      setWaitingCount(response.waitingCount)
      toast.success('Consultation completed')
      fetchStatus()
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || 'Failed to complete')
    } finally {
      setIsActing(false)
    }
  }

  const handleReopenQueue = async () => {
    if (!token || !queueId) return
    if (!confirm('Reopen the queue? Cancelled patients will be restored to waiting.')) return
    try {
      await queuesApi.reopen(token, queueId)
      toast.success('Queue reopened')
      fetchStatus()
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || 'Failed to reopen queue')
    }
  }

  const handlePrescription = async (medicines: MedicineItem[], notes: string, sendWhatsApp: boolean, imageUrl?: string) => {
    if (!token || !currentToken) return
    setIsPrescribing(true)
    try {
      const response = await doctorApi.createPrescription(token, {
        tokenId: currentToken.id,
        medicines,
        notes,
        imageUrl,
        sendWhatsApp
      })

      toast.success('Prescription saved successfully')
      setPrescriptionOpen(false)

      // Open WhatsApp if URL is provided
      if (response.whatsAppUrl) {
        window.open(response.whatsAppUrl, '_blank')
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || 'Failed to save prescription')
    } finally {
      setIsPrescribing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (setupError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Setup Required</h2>
          <p className="text-gray-600 mb-4">{setupError}</p>
          <Button variant="outline" onClick={fetchStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const canCallNext = !currentToken && queueStatus === 'open' && waitingCount > 0
  const canStart = currentToken?.status === 'called'
  const canComplete = currentToken?.status === 'in_progress'
  const canPrescribe = currentToken?.status === 'in_progress'

  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <DoctorHeader
        doctorName={user?.name}
        now={now}
        timeString={timeString}
        queueStatus={queueStatus}
        isConnected={isConnected}
        waitingCount={waitingCount}
      />

      {/* Queue Status Banner */}
      <QueueStatusBanner queueStatus={queueStatus} onReopen={handleReopenQueue} />

      {/* Current Patient Card */}
      <CurrentPatientCard currentToken={currentToken} authToken={token} />

      {/* Action Buttons */}
      <ActionButtons
        nextToken={nextToken}
        isActing={isActing}
        canCallNext={canCallNext}
        canStart={!!canStart}
        canComplete={!!canComplete}
        canPrescribe={!!canPrescribe}
        onCallNext={handleCallNext}
        onStart={handleStart}
        onComplete={handleComplete}
        onPrescription={() => setPrescriptionOpen(true)}
      />

      {/* Waiting Info */}
      <WaitingInfo waitingCount={waitingCount} nextToken={nextToken} />

      {/* Prescription Dialog */}
      {currentToken && (
        <PrescriptionDialog
          open={prescriptionOpen}
          onOpenChange={setPrescriptionOpen}
          currentToken={currentToken}
          doctorName={user?.name || ''}
          isSubmitting={isPrescribing}
          onSave={handlePrescription}
        />
      )}
    </div>
  )
}
