'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminAuthApi, User, Clinic } from '@/lib/adminApi'
import { toast } from 'sonner'
import {
  Loader2,
  LogOut,
  Users,
  Building2,
  Check,
  X,
  UserPlus,
  Plus,
  Shield,
  RefreshCw
} from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export default function AdminDashboard() {
  const router = useRouter()
  const { admin, token, isAuthenticated, isLoading, logout } = useAdminAuth()

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'clinics'>('pending')
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [approvedUsers, setApprovedUsers] = useState<User[]>([])
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [doctors, setDoctors] = useState<User[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false)
  const [newClinic, setNewClinic] = useState({ name: '', address: '', phone: '' })
  const [isCreatingClinic, setIsCreatingClinic] = useState(false)
  const [clinicErrors, setClinicErrors] = useState<{ name?: string; phone?: string }>({})

  // Approval modal state
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean
    user: User | null
    role: 'doctor' | 'assistant' | null
    selectedClinicId: number | null
    selectedDoctorId: number | null
    isApproving: boolean
  }>({
    isOpen: false,
    user: null,
    role: null,
    selectedClinicId: null,
    selectedDoctorId: null,
    isApproving: false
  })

  // Assignment modal for existing approved users
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean
    user: User | null
    selectedClinicId: number | null
    selectedDoctorId: number | null
    isAssigning: boolean
  }>({
    isOpen: false,
    user: null,
    selectedClinicId: null,
    selectedDoctorId: null,
    isAssigning: false
  })

  const fetchData = useCallback(async () => {
    if (!token) return

    setIsDataLoading(true)
    try {
      const [pendingRes, approvedRes, clinicsRes] = await Promise.all([
        adminAuthApi.getUsers(token, 'pending'),
        adminAuthApi.getUsers(token, 'approved'),
        adminAuthApi.getClinics(token)
      ])

      setPendingUsers(pendingRes.users)
      setApprovedUsers(approvedRes.users)
      setClinics(clinicsRes.clinics)
      // Filter doctors from approved users for assistant assignment
      setDoctors(approvedRes.users.filter(u => u.role === 'doctor'))
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setIsDataLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData()
    }
  }, [isAuthenticated, token, fetchData])

  const openApprovalModal = (user: User, role: 'doctor' | 'assistant') => {
    setApprovalModal({
      isOpen: true,
      user,
      role,
      selectedClinicId: clinics.length > 0 ? clinics[0].id : null,
      selectedDoctorId: doctors.length > 0 ? doctors[0].id : null,
      isApproving: false
    })
  }

  const closeApprovalModal = () => {
    setApprovalModal({
      isOpen: false,
      user: null,
      role: null,
      selectedClinicId: null,
      selectedDoctorId: null,
      isApproving: false
    })
  }

  // Assignment modal handlers
  const openAssignModal = (user: User) => {
    setAssignModal({
      isOpen: true,
      user,
      selectedClinicId: clinics.length > 0 ? clinics[0].id : null,
      selectedDoctorId: doctors.length > 0 ? doctors[0].id : null,
      isAssigning: false
    })
  }

  const closeAssignModal = () => {
    setAssignModal({
      isOpen: false,
      user: null,
      selectedClinicId: null,
      selectedDoctorId: null,
      isAssigning: false
    })
  }

  const handleAssign = async () => {
    if (!token || !assignModal.user) return

    const user = assignModal.user

    if (user.role === 'doctor' && !assignModal.selectedClinicId) {
      toast.error('Please select a clinic')
      return
    }
    if (user.role === 'assistant' && !assignModal.selectedDoctorId) {
      toast.error('Please select a doctor')
      return
    }

    setAssignModal(prev => ({ ...prev, isAssigning: true }))

    try {
      if (user.role === 'doctor' && assignModal.selectedClinicId) {
        await adminAuthApi.assignDoctor(token, assignModal.selectedClinicId, user.id)
        toast.success('Doctor assigned to clinic')
      } else if (user.role === 'assistant' && assignModal.selectedDoctorId) {
        await adminAuthApi.assignAssistant(token, assignModal.selectedDoctorId, user.id)
        toast.success('Assistant assigned to doctor')
      }
      closeAssignModal()
      fetchData()
    } catch {
      toast.error('Failed to assign')
      setAssignModal(prev => ({ ...prev, isAssigning: false }))
    }
  }

  const handleApproveWithAssignment = async () => {
    if (!token || !approvalModal.user || !approvalModal.role) return

    // Validate required assignments
    if (approvalModal.role === 'doctor' && !approvalModal.selectedClinicId) {
      toast.error('Please select a clinic for the doctor')
      return
    }
    if (approvalModal.role === 'assistant' && !approvalModal.selectedDoctorId) {
      toast.error('Please select a doctor for the assistant')
      return
    }

    setApprovalModal(prev => ({ ...prev, isApproving: true }))

    try {
      // First approve the user
      await adminAuthApi.approveUser(token, approvalModal.user.id, approvalModal.role)

      // Then create the assignment
      if (approvalModal.role === 'doctor' && approvalModal.selectedClinicId) {
        await adminAuthApi.assignDoctor(token, approvalModal.selectedClinicId, approvalModal.user.id)
      } else if (approvalModal.role === 'assistant' && approvalModal.selectedDoctorId) {
        await adminAuthApi.assignAssistant(token, approvalModal.selectedDoctorId, approvalModal.user.id)
      }

      toast.success(`User approved as ${approvalModal.role} with assignment`)
      closeApprovalModal()
      fetchData()
    } catch {
      toast.error('Failed to approve user')
      setApprovalModal(prev => ({ ...prev, isApproving: false }))
    }
  }

  const handleReject = async (userId: number) => {
    if (!token) return
    if (!confirm('Are you sure you want to reject this user?')) return
    try {
      await adminAuthApi.rejectUser(token, userId)
      toast.success('User rejected')
      fetchData()
    } catch {
      toast.error('Failed to reject user')
    }
  }

  const normalizePhone = (value: string) => value.replace(/\D/g, '')

  const validateNewClinic = () => {
    const errors: { name?: string; phone?: string } = {}

    const name = newClinic.name.trim()
    if (!name) {
      errors.name = 'Clinic name is required'
    } else if (name.length < 3) {
      errors.name = 'Clinic name must be at least 3 characters'
    }

    const rawPhone = newClinic.phone.trim()
    if (rawPhone) {
      let digits = normalizePhone(rawPhone)
      if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2)
      if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1)

      const isValidIndianMobile = /^([6-9][0-9]{9})$/.test(digits)
      if (!isValidIndianMobile) {
        errors.phone = 'Enter a valid 10-digit mobile number'
      }
    }

    setClinicErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateClinic = async () => {
    if (!token) return

    const isValid = validateNewClinic()
    if (!isValid) {
      toast.error('Please fix the highlighted fields')
      return
    }

    setIsCreatingClinic(true)
    try {
      await adminAuthApi.createClinic(token, newClinic)
      toast.success('Clinic created')
      setIsClinicModalOpen(false)
      setNewClinic({ name: '', address: '', phone: '' })
      setClinicErrors({})
      fetchData()
    } catch {
      toast.error('Failed to create clinic')
    } finally {
      setIsCreatingClinic(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      doctor: 'bg-blue-100 text-blue-800',
      assistant: 'bg-green-100 text-green-800',
    }
    return styles[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-400" />
            <div>
              <h1 className="font-bold">Cliniq Admin</h1>
              <p className="text-xs text-slate-400">{admin?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-slate-800">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{pendingUsers.length}</p>
                <p className="text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{approvedUsers.length}</p>
                <p className="text-gray-500">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{clinics.length}</p>
                <p className="text-gray-500">Clinics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
              Pending ({pendingUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                activeTab === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
              Approved
            </button>
            <button
              onClick={() => setActiveTab('clinics')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                activeTab === 'clinics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
              Clinics
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Content */}
        {isDataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Pending Users */}
            {activeTab === 'pending' && (
              <>
                {/* Warning messages for missing setup */}
                {clinics.length === 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">No clinics created yet</p>
                      <p className="text-sm text-yellow-700">You need to create at least one clinic before you can approve doctors. Go to the Clinics tab to add one.</p>
                    </div>
                  </div>
                )}
                {clinics.length > 0 && doctors.length === 0 && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">No doctors approved yet</p>
                      <p className="text-sm text-blue-700">You need to approve at least one doctor before you can approve assistants. Assistants work under doctors.</p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border shadow-sm">
                  {pendingUsers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p>No pending approval requests</p>
                    </div>
                  ) : (
                  <div className="divide-y">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-yellow-700 font-bold text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('px-2 py-1 rounded text-xs font-medium', getRoleBadge(user.role))}>
                            Requested: {user.role}
                          </span>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => openApprovalModal(user, 'doctor')}
                            disabled={clinics.length === 0}
                            title={clinics.length === 0 ? 'Create a clinic first' : ''}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Doctor
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openApprovalModal(user, 'assistant')}
                            disabled={doctors.length === 0}
                            title={doctors.length === 0 ? 'Approve a doctor first' : ''}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Assistant
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleReject(user.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Approved Users */}
            {activeTab === 'approved' && (
              <div className="bg-white rounded-xl border shadow-sm">
                {approvedUsers.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>No approved users yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {approvedUsers.map((user) => (
                      <div key={user.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-700 font-bold text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getRoleBadge(user.role))}>
                            {user.role}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignModal(user)}
                            disabled={
                              (user.role === 'doctor' && clinics.length === 0) ||
                              (user.role === 'assistant' && doctors.length === 0)
                            }
                          >
                            Assign
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Assignment Modal for existing approved users */}
            <Dialog open={assignModal.isOpen} onOpenChange={(open) => !open && closeAssignModal()}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Assign {assignModal.user?.role === 'doctor' ? 'Doctor to Clinic' : 'Assistant to Doctor'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{assignModal.user?.name}</p>
                    <p className="text-sm text-gray-500">{assignModal.user?.email}</p>
                  </div>

                  {assignModal.user?.role === 'doctor' && (
                    <div>
                      <Label>Assign to Clinic</Label>
                      <Select
                        value={assignModal.selectedClinicId?.toString() || ''}
                        onValueChange={(value) => setAssignModal(prev => ({
                          ...prev,
                          selectedClinicId: parseInt(value)
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a clinic" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinics.map(clinic => (
                            <SelectItem key={clinic.id} value={clinic.id.toString()}>
                              {clinic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {assignModal.user?.role === 'assistant' && (
                    <div>
                      <Label>Assign to Doctor</Label>
                      <Select
                        value={assignModal.selectedDoctorId?.toString() || ''}
                        onValueChange={(value) => setAssignModal(prev => ({
                          ...prev,
                          selectedDoctorId: parseInt(value)
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map(doctor => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              {doctor.name} ({doctor.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={closeAssignModal}
                      disabled={assignModal.isAssigning}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleAssign}
                      disabled={assignModal.isAssigning}
                    >
                      {assignModal.isAssigning ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Assign
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Approval Modal with Assignment */}
            <Dialog open={approvalModal.isOpen} onOpenChange={(open) => !open && closeApprovalModal()}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Approve as {approvalModal.role === 'doctor' ? 'Doctor' : 'Assistant'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{approvalModal.user?.name}</p>
                    <p className="text-sm text-gray-500">{approvalModal.user?.email}</p>
                  </div>

                  {approvalModal.role === 'doctor' && (
                    <div>
                      <Label>Assign to Clinic *</Label>
                      <Select
                        value={approvalModal.selectedClinicId?.toString() || ''}
                        onValueChange={(value) => setApprovalModal(prev => ({
                          ...prev,
                          selectedClinicId: parseInt(value)
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a clinic" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinics.map(clinic => (
                            <SelectItem key={clinic.id} value={clinic.id.toString()}>
                              {clinic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Doctor will be able to manage queues at this clinic
                      </p>
                    </div>
                  )}

                  {approvalModal.role === 'assistant' && (
                    <div>
                      <Label>Assign to Doctor *</Label>
                      <Select
                        value={approvalModal.selectedDoctorId?.toString() || ''}
                        onValueChange={(value) => setApprovalModal(prev => ({
                          ...prev,
                          selectedDoctorId: parseInt(value)
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map(doctor => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              {doctor.name} ({doctor.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Assistant will manage queue for this doctor
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={closeApprovalModal}
                      disabled={approvalModal.isApproving}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleApproveWithAssignment}
                      disabled={approvalModal.isApproving}
                    >
                      {approvalModal.isApproving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve & Assign
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Clinics */}
            {activeTab === 'clinics' && (
              <>
                <Dialog
                  open={isClinicModalOpen}
                  onOpenChange={(open) => {
                    setIsClinicModalOpen(open)
                    if (!open) setClinicErrors({})
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="mb-4 h-11 rounded-xl px-4 shadow-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Clinic
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold tracking-tight">Add New Clinic</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 pt-4">
                      <div className="grid gap-2">
                        <Label className="text-sm font-medium">Clinic Name *</Label>
                        <Input
                          placeholder="Enter clinic name"
                          value={newClinic.name}
                          onChange={(e) => {
                            setNewClinic({ ...newClinic, name: e.target.value })
                            if (clinicErrors.name) setClinicErrors((prev) => ({ ...prev, name: undefined }))
                          }}
                          aria-invalid={!!clinicErrors.name}
                          aria-describedby={clinicErrors.name ? 'clinic-name-error' : undefined}
                          className={cn(
                            'h-11 rounded-lg',
                            clinicErrors.name && 'border-red-500 focus-visible:ring-red-500'
                          )}
                        />
                        {clinicErrors.name && (
                          <p id="clinic-name-error" className="text-xs text-red-600">
                            {clinicErrors.name}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-sm font-medium">Address</Label>
                        <Input
                          placeholder="Enter address"
                          value={newClinic.address}
                          onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })}
                          className="h-11 rounded-lg"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-sm font-medium">Phone</Label>
                        <Input
                          placeholder="Enter phone number"
                          value={newClinic.phone}
                          onChange={(e) => {
                            setNewClinic({ ...newClinic, phone: e.target.value })
                            if (clinicErrors.phone) setClinicErrors((prev) => ({ ...prev, phone: undefined }))
                          }}
                          inputMode="numeric"
                          aria-invalid={!!clinicErrors.phone}
                          aria-describedby={clinicErrors.phone ? 'clinic-phone-error' : undefined}
                          className={cn(
                            'h-11 rounded-lg',
                            clinicErrors.phone && 'border-red-500 focus-visible:ring-red-500'
                          )}
                        />
                        {clinicErrors.phone && (
                          <p id="clinic-phone-error" className="text-xs text-red-600">
                            {clinicErrors.phone}
                          </p>
                        )}
                      </div>
                      <Button
                        className="w-full h-11 rounded-xl shadow-sm"
                        onClick={handleCreateClinic}
                        disabled={isCreatingClinic}
                      >
                        {isCreatingClinic ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Create Clinic
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  {clinics.length === 0 ? (
                    <div className="p-10 sm:p-12 text-center text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-sm sm:text-base">No clinics yet. Add your first clinic.</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {clinics.map((clinic) => (
                        <div
                          key={clinic.id}
                          className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-gray-50/60 transition-colors"
                        >
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                              <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 leading-6 truncate">{clinic.name}</p>
                              {clinic.address && (
                                <p className="text-sm text-gray-600 leading-5 mt-0.5 line-clamp-2">{clinic.address}</p>
                              )}
                              {clinic.phone && <p className="text-xs text-gray-500 mt-1">{clinic.phone}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
