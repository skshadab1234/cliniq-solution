'use client'

import { Loader2, Plus, Search, Zap } from 'lucide-react'
import { Patient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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

    // common cases: +91XXXXXXXXXX or 0XXXXXXXXXX
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
    ? 'Enter a valid Indian mobile number (10 digits, starts with 6–9).'
    : ''
  const newPatientPhoneError = newPatient.phone.length > 0 && !isValidIndianMobile(newPatient.phone)
    ? 'Enter a valid Indian mobile number (10 digits, starts with 6–9).'
    : ''

  const canSearch = isValidIndianMobile(searchPhone) && !isBusy
  const canSubmit = !!newPatient.name.trim() && isValidIndianMobile(newPatient.phone) && !isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full sm:w-auto shadow-sm">
              <Plus className="h-5 w-5 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Add a walk-in patient to the queue</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Patient to Queue</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">Phone Number</Label>
            <div className="flex gap-2">
              <Input
                placeholder="10-digit Indian mobile (e.g., 9876543210)"
                value={searchPhoneDigits}
                inputMode="numeric"
                onChange={(e) => setSearchPhone(normalizeIndianMobile(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && canSearch && onSearchPatient()}
                disabled={isBusy}
                autoFocus
              />
              <Button
                variant="outline"
                className="shrink-0"
                onClick={onSearchPatient}
                disabled={!canSearch}
              >
                {isSearching
                  ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  : <Search className="h-4 w-4 mr-2" />}
                {isSearching ? 'Searching' : 'Search'}
              </Button>
            </div>
            {!!searchPhoneError && (
              <p className="text-xs text-red-600">{searchPhoneError}</p>
            )}
          </div>

          {searchResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-900 leading-relaxed">
                Found: <span className="font-semibold">{searchResult.name}</span> ({searchResult.phone})
                {searchResult.lastVisit && (
                  <span className="text-green-600"> - Last visit: {searchResult.lastVisit}</span>
                )}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">Patient Name</Label>
              <Input
                placeholder="Enter patient name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">Phone</Label>
              <Input
                placeholder="10-digit Indian mobile"
                value={newPatientPhoneDigits}
                inputMode="numeric"
                onChange={(e) => setNewPatient({ ...newPatient, phone: normalizeIndianMobile(e.target.value) })}
                disabled={isSubmitting}
              />
              {!!newPatientPhoneError && (
                <p className="text-xs text-red-600">{newPatientPhoneError}</p>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50/40 px-3 py-2">
              <input
                type="checkbox"
                id="emergency"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="rounded"
                disabled={isSubmitting}
              />
              <Label htmlFor="emergency" className="flex items-center gap-1 text-orange-600 cursor-pointer">
                <Zap className="h-4 w-4" />
                Emergency (jumps queue)
              </Label>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={onAddPatient}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
              : <Plus className="h-4 w-4 mr-2" />}
            {isSubmitting ? 'Adding…' : 'Add to Queue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
