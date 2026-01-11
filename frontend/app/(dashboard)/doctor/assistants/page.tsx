'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { doctorApi, Assistant } from '@/lib/api'
import { Loader2, Users, Mail, Phone, Calendar, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DoctorAssistantsPage() {
  const { token } = useAuth()
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssistants = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await doctorApi.getAssistants(token)
      setAssistants(response.assistants)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to load assistants')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchAssistants()
  }, [fetchAssistants])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAssistants}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assistants</h1>
          <p className="text-gray-600 mt-1">
            {assistants.length === 0
              ? 'No assistants assigned yet'
              : `${assistants.length} assistant${assistants.length > 1 ? 's' : ''} assigned to you`}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
          <UserCheck className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-semibold text-blue-600">{assistants.length}</span>
        </div>
      </div>

      {/* Assistants List */}
      {assistants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assistants Yet</h3>
            <p className="text-gray-600 text-center max-w-md">
              You don&apos;t have any assistants assigned to you. Contact your admin to assign assistants to your account.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assistants.map((assistant) => (
            <Card key={assistant.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {assistant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{assistant.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      assistant.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : assistant.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {assistant.status}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{assistant.email}</span>
                </div>
                {assistant.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{assistant.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Assigned: {new Date(assistant.assignedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
