'use client'

import { useState, useRef } from 'react'
import { Loader2, Plus, X, Send, Save, Pill, User, Stethoscope, Camera, Upload, Image as ImageIcon, Trash2, FileText } from 'lucide-react'
import { MedicineItem, Token } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type PrescriptionMode = 'type' | 'upload'

type PrescriptionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentToken: Token
  doctorName: string
  isSubmitting: boolean
  onSave: (medicines: MedicineItem[], notes: string, sendWhatsApp: boolean, imageUrl?: string) => Promise<void>
}

const emptyMedicine: MedicineItem = {
  name: '',
  dosage: '',
  duration: '',
  instructions: ''
}

export function PrescriptionDialog({
  open,
  onOpenChange,
  currentToken,
  doctorName,
  isSubmitting,
  onSave,
}: PrescriptionDialogProps) {
  const [mode, setMode] = useState<PrescriptionMode>('type')
  const [medicines, setMedicines] = useState<MedicineItem[]>([{ ...emptyMedicine }])
  const [notes, setNotes] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addMedicine = () => {
    setMedicines([...medicines, { ...emptyMedicine }])
  }

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index))
    }
  }

  const updateMedicine = (index: number, field: keyof MedicineItem, value: string) => {
    const updated = [...medicines]
    updated[index] = { ...updated[index], [field]: value }
    setMedicines(updated)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = () => {
      setImageUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCameraCapture = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    setImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isValidTyped = medicines.some(m => m.name.trim() && m.dosage.trim() && m.duration.trim())
  const isValidUploaded = !!imageUrl
  const isValid = mode === 'type' ? isValidTyped : isValidUploaded

  const handleSave = async (sendWhatsApp: boolean) => {
    if (mode === 'type') {
      const validMedicines = medicines.filter(m => m.name.trim())
      await onSave(validMedicines, notes, sendWhatsApp)
    } else {
      // Upload mode - send image
      await onSave([], notes, sendWhatsApp, imageUrl || undefined)
    }
    // Reset form
    setMedicines([{ ...emptyMedicine }])
    setNotes('')
    setImageUrl(null)
    setMode('type')
  }

  const handleClose = (value: boolean) => {
    if (!value) {
      setMedicines([{ ...emptyMedicine }])
      setNotes('')
      setImageUrl(null)
      setMode('type')
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 mx-2 sm:mx-auto">
        {/* Header */}
        <div className="bg-teal-500 px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold">Write Prescription</h2>
              <p className="text-white/80 text-xs sm:text-sm truncate">Add medicines or upload image</p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] sm:max-h-[calc(90vh-200px)]">
          {/* Patient & Doctor Info */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-medium">Patient</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{currentToken.patient?.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{currentToken.patient?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 sm:text-right">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 sm:order-2">
                  <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
                </div>
                <div className="min-w-0 sm:order-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-medium">Doctor</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">Dr. {doctorName}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="px-4 sm:px-6 pt-4">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('type')}
                disabled={isSubmitting}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  mode === 'type'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <FileText className="h-4 w-4" />
                Type
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                disabled={isSubmitting}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  mode === 'upload'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Camera className="h-4 w-4" />
                Upload
              </button>
            </div>
          </div>

          {/* Content based on mode */}
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            {mode === 'type' ? (
              /* Type Mode - Medicines Form */
              <>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                    <Pill className="h-4 w-4 text-teal-600" />
                    Medicines
                  </h3>
                  <button
                    type="button"
                    onClick={addMedicine}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Add</span> Medicine
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {medicines.map((medicine, index) => (
                    <div
                      key={index}
                      className="relative bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm"
                    >
                      <div className="absolute -top-2 left-3 sm:left-4 px-2 sm:px-2.5 py-0.5 bg-teal-500 text-white text-[10px] sm:text-xs font-semibold rounded-full">
                        {index + 1}
                      </div>

                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(index)}
                          disabled={isSubmitting}
                          className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                        >
                          <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-1.5 sm:mt-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Medicine Name *</label>
                          <Input
                            placeholder="e.g., Paracetamol 500mg"
                            value={medicine.name}
                            onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                            disabled={isSubmitting}
                            className="bg-gray-50 border-gray-200 focus:bg-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Dosage *</label>
                          <Input
                            placeholder="e.g., 1 tablet"
                            value={medicine.dosage}
                            onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                            disabled={isSubmitting}
                            className="bg-gray-50 border-gray-200 focus:bg-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Duration *</label>
                          <Input
                            placeholder="e.g., 5 days"
                            value={medicine.duration}
                            onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                            disabled={isSubmitting}
                            className="bg-gray-50 border-gray-200 focus:bg-white text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Instructions</label>
                          <Input
                            placeholder="e.g., After meals, twice daily"
                            value={medicine.instructions}
                            onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                            disabled={isSubmitting}
                            className="bg-gray-50 border-gray-200 focus:bg-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Upload Mode - Image Upload */
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                  <ImageIcon className="h-4 w-4 text-teal-600" />
                  Prescription Image
                </h3>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {imageUrl ? (
                  /* Image Preview */
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Prescription"
                      className="w-full rounded-xl border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  /* Upload Buttons */
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleCameraCapture}
                      disabled={isSubmitting}
                      className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-teal-300 bg-teal-50/50 rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-50"
                    >
                      <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-teal-600" />
                      </div>
                      <span className="text-sm font-semibold text-teal-700">Take Photo</span>
                      <span className="text-xs text-teal-600">Use camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Upload</span>
                      <span className="text-xs text-gray-500">From gallery</span>
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center">
                  Upload a clear photo of the handwritten prescription (max 5MB)
                </p>
              </div>
            )}

            {/* Notes Section - Always visible */}
            <div className="mt-4 sm:mt-6">
              <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2">
                Additional Notes
              </label>
              <Textarea
                placeholder="Any special instructions, diet recommendations, follow-up details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                rows={2}
                className="bg-gray-50 border-gray-200 focus:bg-white resize-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={!isValid || isSubmitting}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all',
                isValid && !isSubmitting
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              Save
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={!isValid || isSubmitting}
              className={cn(
                'flex-[1.5] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all',
                isValid && !isSubmitting
                  ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              Save & <span className="hidden xs:inline">Send</span> WhatsApp
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
