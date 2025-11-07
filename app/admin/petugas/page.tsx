"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Shield, UserPlus, Pencil, Trash2 } from "lucide-react"

interface PetugasData {
  id: string
  email: string
  fullName: string
  createdAt: string
  _count: {
    eventOfficers: number
    registeredDonors: number
  }
}

export default function PetugasPage() {
  const [petugas, setPetugas] = useState<PetugasData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPetugas, setSelectedPetugas] = useState<PetugasData | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  })

  useEffect(() => {
    fetchPetugas()
  }, [])

  const fetchPetugas = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllPetugas()
      if (response.success) {
        setPetugas(response.data)
      } else {
        setError("Failed to load petugas")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load petugas")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleAddPetugas = () => {
    setFormData({ email: "", password: "", fullName: "" })
    setIsAddModalOpen(true)
  }

  const handleEditPetugas = (user: PetugasData) => {
    setSelectedPetugas(user)
    setFormData({ email: user.email, password: "", fullName: user.fullName })
    setIsEditModalOpen(true)
  }

  const handleDeletePetugas = (user: PetugasData) => {
    setSelectedPetugas(user)
    setIsDeleteModalOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password || !formData.fullName) {
      setError("All fields are required")
      return
    }

    try {
      setSubmitting(true)
      const response = await apiService.createPetugas(formData)
      if (response.success) {
        setIsAddModalOpen(false)
        fetchPetugas()
        setFormData({ email: "", password: "", fullName: "" })
      } else {
        setError("Failed to create petugas")
      }
    } catch (err: any) {
      setError(err.message || "Failed to create petugas")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPetugas || !formData.email || !formData.fullName) {
      setError("Email and Full Name are required")
      return
    }

    try {
      setSubmitting(true)
      const updateData: any = {
        email: formData.email,
        fullName: formData.fullName,
      }
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await apiService.updatePetugas(selectedPetugas.id, updateData)
      if (response.success) {
        setIsEditModalOpen(false)
        fetchPetugas()
        setFormData({ email: "", password: "", fullName: "" })
        setSelectedPetugas(null)
      } else {
        setError("Failed to update petugas")
      }
    } catch (err: any) {
      setError(err.message || "Failed to update petugas")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedPetugas) return

    try {
      setSubmitting(true)
      const response = await apiService.deletePetugas(selectedPetugas.id)
      if (response.success) {
        setIsDeleteModalOpen(false)
        fetchPetugas()
        setSelectedPetugas(null)
      } else {
        setError("Failed to delete petugas")
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete petugas")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Petugas Management</h1>
        <Button onClick={handleAddPetugas} className="bg-red-600 hover:bg-red-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Petugas
        </Button>
      </div>

      {petugas.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No petugas found</h3>
          <p className="text-gray-600">Add your first petugas to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {petugas.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {user.fullName}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Member since {formatDate(user.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Events: {user._count.eventOfficers}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Donors: {user._count.registeredDonors}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditPetugas(user)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDeletePetugas(user)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Petugas Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Petugas</DialogTitle>
            <DialogDescription>
              Create a new petugas account. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                {submitting ? "Creating..." : "Create Petugas"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Petugas Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Petugas</DialogTitle>
            <DialogDescription>
              Update petugas information. Leave password blank to keep it unchanged.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input
                  id="edit-fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (Optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                {submitting ? "Updating..." : "Update Petugas"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Petugas</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPetugas?.fullName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}