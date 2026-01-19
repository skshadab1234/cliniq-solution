'use client'

import { Loader2, Plus, Search, Zap } from 'lucide-react'
import { Patient } from '@/lib/api'
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

type NewPatientForm = {
  name: string
  phone: string
}

type AddPatientDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  searchPhone: string
  setSearchPhone: (value: string) => void
  searchResult: Patient | null
  isSearching: boolean
  onSearchPatient: () => void

  newPatient: NewPatientForm
  setNewPatient: (value: NewPatientForm) => void

  isEmergency: boolean
  setIsEmergency: (value: boolean) => void

  isSubmitting: boolean
  onAddPatient: () => void
}

export function AddPatientDialog({
  open,
  onOpenChange,
  searchPhone,
  setSearchPhone,
  searchResult,
  isSearching,
  onSearchPatient,
  newPatient,
  setNewPatient,
  isEmergency,
  setIsEmergency,
  isSubmitting,
  onAddPatient,
}: AddPatientDialogProps) {
  const normalizeIndianMobile = (raw: string) => {
    const digits = raw.replace(/\D/g, '')

    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
    if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)

    return digits
  }

  const isValidIndianMobile = (raw: string) => {
    const digits = normalizeIndianMobile(raw)
    return /^[6-9]\d{9}$/.test(digits)
  }

  const isBusy = isSearching || isSubmitting
  const searchPhoneDigits = normalizeIndianMobile(searchPhone)
  const newPatientPhoneDigits = normalizeIndianMobile(newPatient.phone)
  const searchPhoneError = searchPhone.length > 0 && !isValidIndianMobile(searchPhone)
    ? 'Enter a valid 10-digit mobile number (starts with 6-9)'
    : ''
  const newPatientPhoneError = newPatient.phone.length > 0 && !isValidIndianMobile(newPatient.phone)
    ? 'Enter a valid 10-digit mobile number (starts with 6-9)'
    : ''

  const canSearch = isValidIndianMobile(searchPhone) && !isBusy
  const canSubmit = !!newPatient.name.trim() && isValidIndianMobile(newPatient.phone) && !isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full h-12 text-base font-semibold shadow-sm">
          <Plus className="h-5 w-5 mr-2" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add Patient to Queue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Search Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Search by Phone</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter 10-digit mobile"
                value={searchPhoneDigits}
                inputMode="numeric"
                onChange={(e) => setSearchPhone(normalizeIndianMobile(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && canSearch && onSearchPatient()}
                disabled={isBusy}
                className="h-11 text-base"
                autoFocus
              />
              <Button
                variant="outline"
                className="shrink-0 h-11 px-4"
                onClick={onSearchPatient}
                disabled={!canSearch}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {!!searchPhoneError && (
              <p className="text-xs text-red-600">{searchPhoneError}</p>
            )}
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-sm text-emerald-900">
                Found: <span className="font-semibold">{searchResult.name}</span>
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {searchResult.phone}
                {searchResult.lastVisit && ` • Last visit: ${searchResult.lastVisit}`}
              </p>
            </div>
          )}

          {/* Patient Details */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">Patient Name</Label>
              <Input
                placeholder="Enter patient name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                disabled={isSubmitting}
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">Phone Number</Label>
              <Input
                placeholder="10-digit mobile number"
                value={newPatientPhoneDigits}
                inputMode="numeric"
                onChange={(e) => setNewPatient({ ...newPatient, phone: normalizeIndianMobile(e.target.value) })}
                disabled={isSubmitting}
                className="h-11 text-base"
              />
              {!!newPatientPhoneError && (
                <p className="text-xs text-red-600">{newPatientPhoneError}</p>
              )}
            </div>

            {/* Emergency Toggle */}
            <label className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/50 p-3 cursor-pointer">
              <input
                type="checkbox"
                id="emergency"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="h-5 w-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                disabled={isSubmitting}
              />
              <div className="flex items-center gap-2 text-orange-700">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-semibold">Emergency (Priority)</span>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={onAddPatient}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Queue
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
