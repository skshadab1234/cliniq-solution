'use client'

import { useState, useEffect } from 'react'
import { Phone, AlertCircle, Clock, FileText, ChevronDown, Pill, Loader2, UserCircle } from 'lucide-react'
import { Token, Prescription, doctorApi } from '@/lib/api'
import { cn } from '@/lib/utils'

type CurrentPatientCardProps = {
  currentToken: Token | null
  authToken?: string | null
}

export function CurrentPatientCard({ currentToken, authToken }: CurrentPatientCardProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setShowHistory(false)
    setPrescriptions([])
  }, [currentToken?.patient?.id])

  const fetchPrescriptionHistory = async () => {
    if (!authToken || !currentToken?.patient?.id) return

    setIsLoading(true)
    try {
      const response = await doctorApi.getPatientPrescriptions(authToken, currentToken.patient.id)
      setPrescriptions(response.prescriptions)
    } catch (error) {
      console.error('Failed to fetch prescription history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleHistory = () => {
    if (!showHistory && prescriptions.length === 0) {
      fetchPrescriptionHistory()
    }
    setShowHistory(!showHistory)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getWaitTime = () => {
    if (!currentToken?.calledAt) return null
    const calledTime = new Date(currentToken.calledAt)
    const now = new Date()
    const diffMs = now.getTime() - calledTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    return diffMins
  }

  // Empty State
  if (!currentToken) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <div className="text-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <UserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-400">No Patient</h3>
          <p className="text-sm text-gray-400 mt-1">Call next patient to begin</p>
        </div>
      </div>
    )
  }

  const isInProgress = currentToken.status === 'in_progress'
  const waitTime = getWaitTime()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Status Bar */}
      <div className={cn(
        'px-4 py-2.5 flex items-center justify-between',
        isInProgress ? 'bg-teal-500' : 'bg-amber-500'
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            'h-2 w-2 rounded-full bg-white',
            isInProgress && 'animate-pulse'
          )} />
          <span className="text-white font-medium text-sm">
            {isInProgress ? 'In Consultation' : 'Called'}
          </span>
        </div>
        {waitTime !== null && waitTime > 0 && (
          <span className="text-white/90 text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {waitTime}m
          </span>
        )}
      </div>

      {/* Patient Info */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Avatar */}
          <div className={cn(
            'h-14 w-14 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold text-white flex-shrink-0',
            isInProgress ? 'bg-teal-500' : 'bg-amber-500'
          )}>
            {currentToken.patient?.name?.charAt(0).toUpperCase() || 'P'}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Name & Emergency */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {currentToken.patient?.name}
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3.5 w-3.5" />
                  {currentToken.patient?.phone}
                </p>
              </div>

              {/* Token */}
              <div className={cn(
                'text-center px-3 py-1.5 rounded-lg flex-shrink-0',
                isInProgress ? 'bg-teal-50' : 'bg-amber-50'
              )}>
                <p className="text-[10px] font-medium text-gray-500 uppercase">Token</p>
                <p className={cn(
                  'text-xl sm:text-2xl font-bold',
                  isInProgress ? 'text-teal-600' : 'text-amber-600'
                )}>
                  #{currentToken.tokenNumber}
                </p>
              </div>
            </div>

            {/* Emergency Badge */}
            {currentToken.isEmergency && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium mt-2">
                <AlertCircle className="h-3 w-3" />
                Emergency
              </span>
            )}
          </div>
        </div>

        {/* History Toggle */}
        {authToken && (
          <button
            onClick={handleToggleHistory}
            className={cn(
              'mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors border',
              showHistory
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            )}
          >
            <FileText className="h-4 w-4" />
            Past Prescriptions
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              showHistory && 'rotate-180'
            )} />
          </button>
        )}
      </div>

      {/* Prescription History Panel */}
      {showHistory && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="h-4 w-4 text-teal-600" />
            <h4 className="text-sm font-semibold text-gray-700">Prescription History</h4>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No previous prescriptions</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-800">
                      {formatDate(prescription.createdAt)}
                    </span>
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      Dr. {prescription.doctor?.name}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {prescription.medicines.map((med, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="h-4 w-4 rounded-full bg-teal-100 text-teal-600 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                          {idx + 1}
                        </span>
                        <div className="text-xs leading-relaxed">
                          <span className="font-medium text-gray-900">{med.name}</span>
                          <span className="text-gray-500"> - {med.dosage}, {med.duration}</span>
                          {med.instructions && (
                            <span className="text-gray-400 block">{med.instructions}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {prescription.notes && (
                    <p className="text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      <span className="font-medium">Note:</span> {prescription.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
