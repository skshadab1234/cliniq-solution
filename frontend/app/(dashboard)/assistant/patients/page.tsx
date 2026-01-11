'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { patientsApi, Patient } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, Search, User, Phone, Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function PatientsPage() {
  const { token } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newPatient, setNewPatient] = useState({ name: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!token || !searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      // Search by phone or name
      const isPhone = /^\d+$/.test(searchQuery.trim())
      const response = await patientsApi.search(
        token,
        isPhone ? searchQuery.trim() : undefined,
        !isPhone ? searchQuery.trim() : undefined
      )
      setSearchResults(response.patients)
    } catch {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }, [token, searchQuery])

  const handleViewPatient = async (patient: Patient) => {
    if (!token) return
    try {
      const response = await patientsApi.getById(token, patient.id)
      setSelectedPatient(response.patient)
    } catch {
      toast.error('Failed to load patient details')
    }
  }

  const handleAddPatient = async () => {
    if (!token) return
    if (!newPatient.name || !newPatient.phone) {
      toast.error('Name and phone are required')
      return
    }

    setIsSubmitting(true)
    try {
      await patientsApi.create(token, newPatient)
      toast.success('Patient added')
      setIsAddModalOpen(false)
      setNewPatient({ name: '', phone: '' })
      // Refresh search if there was a query
      if (searchQuery) {
        handleSearch()
      }
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string }
      if (err.code === 'CONFLICT') {
        toast.error('Patient with this phone already exists')
      } else {
        toast.error(err.message || 'Failed to add patient')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500">Search and manage patient records</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Patient Name</Label>
                <Input
                  placeholder="Enter patient name"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  placeholder="Enter phone number"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleAddPatient}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by phone number or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Results List */}
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">
              {hasSearched ? `Results (${searchResults.length})` : 'Search Results'}
            </h2>
          </div>
          {!hasSearched ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>Enter a phone number or name to search</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No patients found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Patient
              </Button>
            </div>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {searchResults.map((patient) => (
                <button
                  key={patient.id}
                  className="w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-50 text-left"
                  onClick={() => handleViewPatient(patient)}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.phone}
                    </p>
                  </div>
                  {patient.lastVisit && (
                    <span className="ml-auto text-xs text-gray-400">
                      Last: {patient.lastVisit}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Patient Details */}
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">Patient Details</h2>
          </div>
          {!selectedPatient ? (
            <div className="p-8 text-center text-gray-500">
              <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>Select a patient to view details</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h3>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {selectedPatient.phone}
                  </p>
                </div>
              </div>

              {/* Visit History */}
              {selectedPatient.visitHistory && selectedPatient.visitHistory.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Visit History</h4>
                  <div className="space-y-2">
                    {selectedPatient.visitHistory.map((visit, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{visit.date}</span>
                        <span className="text-gray-400">Token #{visit.tokenNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Add to Queue */}
              <Button className="w-full" onClick={() => {
                // Navigate to assistant page with patient pre-selected
                window.location.href = `/assistant?patientId=${selectedPatient.id}`
              }}>
                Add to Today&apos;s Queue
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
