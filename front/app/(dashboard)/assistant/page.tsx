'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { queuesApi, tokensApi, patientsApi, Queue, Token, Patient, QueueStats } from '@/lib/api'
import { toast } from 'sonner'
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AssistantHeader } from '@/components/assistant/Header'
import { StatusBanner } from '@/components/assistant/StatusBanner'
import { StatsGrid } from '@/components/assistant/StatsGrid'
import { CurrentPatient } from '@/components/assistant/CurrentPatient'
import { WaitingList } from '@/components/assistant/WaitingList'
import { SkippedList } from '@/components/assistant/SkippedList'
import { AddPatientDialog } from '@/components/assistant/AddPatientDialog'

export default function AssistantDashboard() {
  const { token } = useAuth()
  const [queue, setQueue] = useState<Queue | null>(null)
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')
  const [searchResult, setSearchResult] = useState<Patient | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [newPatient, setNewPatient] = useState({ name: '', phone: '' })
  const [isEmergency, setIsEmergency] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { subscribe, isConnected } = useSocket(queue?.id ?? null)

  const fetchQueue = useCallback(async () => {
    if (!token) return
    setSetupError(null)
    try {
      // First try to get today's queue
      const response = await queuesApi.getToday(token)
      setQueue(response.queue)
      setStats(response.stats)
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      if (err.code === 'NOT_FOUND') {
        // Create queue if not exists
        try {
          const createResponse = await queuesApi.create(token, {})
          setQueue(createResponse.queue)
          setStats({ total: 0, waiting: 0, completed: 0, skipped: 0, noShow: 0 })
        } catch (createError: unknown) {
          const createErr = createError as { code?: string; message?: string }
          if (createErr.code === 'NO_DOCTOR_ASSIGNED') {
            setSetupError('You are not assigned to any doctor. Please contact the admin to assign you to a doctor.')
          } else {
            setSetupError(createErr.message || 'Failed to create queue. Please contact admin.')
          }
        }
      } else if (err.code === 'NO_DOCTOR_ASSIGNED') {
        setSetupError('You are not assigned to any doctor. Please contact the admin to assign you to a doctor.')
      } else {
        toast.error('Failed to load queue')
      }
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  // Socket event handlers
  useEffect(() => {
    if (!subscribe) return

    const unsubs = [
      subscribe('token:added', () => fetchQueue()),
      subscribe('token:status', () => fetchQueue()),
      subscribe('token:called', () => fetchQueue()),
      subscribe('token:cancelled', () => fetchQueue()),
      subscribe('queue:paused', () => fetchQueue()),
      subscribe('queue:resumed', () => fetchQueue()),
    ]

    return () => unsubs.forEach(unsub => unsub())
  }, [subscribe, fetchQueue])

  const handleSearchPatient = async () => {
    if (!token || !searchPhone) return
    setIsSearching(true)
    try {
      const response = await patientsApi.search(token, searchPhone)
      if (response.patients.length > 0) {
        setSearchResult(response.patients[0])
        setNewPatient({ name: response.patients[0].name, phone: response.patients[0].phone })
      } else {
        setSearchResult(null)
        setNewPatient({ ...newPatient, phone: searchPhone })
        toast.info('Patient not found. Enter name to add new patient.')
      }
    } catch {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddPatient = async () => {
    if (!token || !queue) return
    if (!newPatient.name || !newPatient.phone) {
      toast.error('Name and phone are required')
      return
    }

    setIsSubmitting(true)
    try {
      await tokensApi.add(token, {
        queueId: queue.id,
        patientName: newPatient.name,
        patientPhone: newPatient.phone,
        isEmergency
      })
      toast.success(`Patient added${isEmergency ? ' (Emergency)' : ''}`)
      setIsAddModalOpen(false)
      setNewPatient({ name: '', phone: '' })
      setSearchPhone('')
      setSearchResult(null)
      setIsEmergency(false)
      fetchQueue()
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || 'Failed to add patient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async (tokenId: number) => {
    if (!token) return
    try {
      await tokensApi.skip(token, tokenId)
      toast.success('Patient skipped')
      fetchQueue()
    } catch {
      toast.error('Failed to skip')
    }
  }

  const handleNoShow = async (tokenId: number) => {
    if (!token) return
    try {
      await tokensApi.noshow(token, tokenId)
      toast.success('Marked as no-show')
      fetchQueue()
    } catch {
      toast.error('Failed to mark no-show')
    }
  }

  const handleReadd = async (tokenId: number) => {
    if (!token) return
    try {
      await tokensApi.readd(token, tokenId)
      toast.success('Patient re-added to queue')
      fetchQueue()
    } catch {
      toast.error('Failed to re-add')
    }
  }

  const handleCancel = async (tokenId: number) => {
    if (!token) return
    try {
      await tokensApi.cancel(token, tokenId)
      toast.success('Token cancelled')
      fetchQueue()
    } catch {
      toast.error('Failed to cancel')
    }
  }

  const handlePauseResume = async () => {
    if (!token || !queue) return
    try {
      if (queue.status === 'open') {
        await queuesApi.pause(token, queue.id)
        toast.success('Queue paused')
      } else if (queue.status === 'paused') {
        await queuesApi.resume(token, queue.id)
        toast.success('Queue resumed')
      }
      fetchQueue()
    } catch {
      toast.error('Failed to update queue status')
    }
  }

  const handleCloseQueue = async () => {
    if (!token || !queue) return
    if (!confirm('Are you sure you want to close the queue for today?')) return
    try {
      await queuesApi.close(token, queue.id)
      toast.success('Queue closed')
      fetchQueue()
    } catch {
      toast.error('Failed to close queue')
    }
  }

  const getStatusBadge = (status: Token['status']) => {
    const styles: Record<Token['status'], string> = {
      waiting: 'bg-yellow-100 text-yellow-800',
      called: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      skipped: 'bg-gray-100 text-gray-800',
      no_show: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-500',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
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
          <Button variant="outline" onClick={fetchQueue}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const waitingTokens = queue?.tokens?.filter(t => t.status === 'waiting') || []
  const currentToken = queue?.tokens?.find(t => t.status === 'in_progress' || t.status === 'called')
  const skippedTokens = queue?.tokens?.filter(t => t.status === 'skipped') || []

  return (
    <div className="space-y-6">
      <AssistantHeader
        clinicName={queue?.clinic?.name}
        date={new Date()}
        isConnected={isConnected}
        queueStatus={queue?.status}
        onRefresh={fetchQueue}
        onPauseResume={handlePauseResume}
        onClose={handleCloseQueue}
        canClose={queue?.status !== 'closed'}
      />

      <StatusBanner status={queue?.status} />

      <StatsGrid stats={stats} />

      {queue?.status !== 'closed' && (
        <AddPatientDialog
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          searchPhone={searchPhone}
          setSearchPhone={setSearchPhone}
          searchResult={searchResult}
          isSearching={isSearching}
          onSearchPatient={handleSearchPatient}
          newPatient={newPatient}
          setNewPatient={setNewPatient}
          isEmergency={isEmergency}
          setIsEmergency={setIsEmergency}
          isSubmitting={isSubmitting}
          onAddPatient={handleAddPatient}
        />
      )}

      <CurrentPatient currentToken={currentToken} getStatusBadge={getStatusBadge} />

      <WaitingList tokens={waitingTokens} onSkip={handleSkip} onNoShow={handleNoShow} onCancel={handleCancel} />

      <SkippedList tokens={skippedTokens} onReadd={handleReadd} />
    </div>
  )

}
