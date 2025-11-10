"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Clock, Plus, Pencil, Trash2, Eye } from "lucide-react"

interface EventItem {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  description: string
  status: string
  officerCount: number
  donorCount: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Officers management states
  const [eventOfficers, setEventOfficers] = useState<any[]>([])
  const [availablePetugas, setAvailablePetugas] = useState<any[]>([])
  const [selectedPetugasId, setSelectedPetugasId] = useState("")
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([])

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "active",
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllEvents()
      if (response.success) {
        setEvents(response.data)
      } else {
        setError("Failed to load events")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateEvent = () => {
    setFormData({
      name: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      status: "active",
    })
    setSelectedOfficerIds([])
    setIsCreateModalOpen(true)
    fetchAvailablePetugas()
  }

  const fetchEventOfficers = async (eventId: string) => {
    try {
      const response = await apiService.getEventOfficers(eventId)
      console.log("getEventOfficers response:", response)
      if (response.success) {
        // Handle different possible response structures
        let officers = response.data

        // If data is wrapped in an array or has nested structure
        if (Array.isArray(officers)) {
          console.log("Officers data (array):", officers)
          setEventOfficers(officers)
        } else if (officers && typeof officers === 'object') {
          // If data might be nested (e.g., { officers: [...] })
          console.log("Officers data (object):", officers)
          const officersObj = officers as any
          setEventOfficers(officersObj.officers || officersObj.data || [])
        } else {
          console.log("No officers data found")
          setEventOfficers([])
        }
      }
    } catch (err: any) {
      console.error("Failed to load officers:", err)
    }
  }

  const fetchAvailablePetugas = async () => {
    try {
      const response = await apiService.getAllPetugas()
      if (response.success) {
        setAvailablePetugas(response.data)
      }
    } catch (err: any) {
      console.error("Failed to load petugas:", err)
    }
  }

  const handleViewEvent = async (event: EventItem) => {
    setSelectedEvent(event)
    setFormData({
      name: event.name,
      location: event.location,
      startDate: event.startDate.split('.')[0],
      endDate: event.endDate.split('.')[0],
      description: event.description,
      status: event.status,
    })
    setIsEditMode(false)
    setIsViewModalOpen(true)
    await fetchEventOfficers(event.id)
    await fetchAvailablePetugas()
  }

  const handleOpenAssignModal = () => {
    setIsAssignModalOpen(true)
    fetchAvailablePetugas()
  }

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  const handleAssignOfficer = async () => {
    if (!selectedEvent || !selectedPetugasId) {
      setError("Please select a petugas")
      return
    }

    try {
      setSubmitting(true)
      const response = await apiService.assignOfficer(selectedEvent.id, selectedPetugasId)
      if (response.success) {
        setIsAssignModalOpen(false)
        setSelectedPetugasId("")
        await fetchEventOfficers(selectedEvent.id)
        await fetchEvents() // Refresh event list to update officer count
      } else {
        setError("Failed to assign officer")
      }
    } catch (err: any) {
      setError(err.message || "Failed to assign officer")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveOfficer = async (officerId: string) => {
    if (!selectedEvent) return

    if (!confirm("Are you sure you want to remove this officer from the event?")) {
      return
    }

    try {
      const response = await apiService.removeOfficer(selectedEvent.id, officerId)
      if (response.success) {
        await fetchEventOfficers(selectedEvent.id)
        await fetchEvents() // Refresh event list to update officer count
      } else {
        setError("Failed to remove officer")
      }
    } catch (err: any) {
      setError(err.message || "Failed to remove officer")
    }
  }

  const handleDeleteEvent = (event: EventItem) => {
    setSelectedEvent(event)
    setIsDeleteModalOpen(true)
  }

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.location || !formData.startDate || !formData.endDate) {
      setError("Name, location, start date, and end date are required")
      return
    }

    try {
      setSubmitting(true)
      const eventData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      }
      const response = await apiService.createEvent(eventData)
      if (response.success) {
        // Assign officers if any selected
        const eventId = (response.data as any).id
        for (const officerId of selectedOfficerIds) {
          await apiService.assignOfficer(eventId, officerId)
        }

        setIsCreateModalOpen(false)
        fetchEvents()
        setFormData({
          name: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          status: "active",
        })
        setSelectedOfficerIds([])
      } else {
        setError("Failed to create event")
      }
    } catch (err: any) {
      setError(err.message || "Failed to create event")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveEvent = async () => {
    if (!selectedEvent || !formData.name || !formData.location || !formData.startDate || !formData.endDate) {
      setError("Name, location, start date, and end date are required")
      return
    }

    try {
      setSubmitting(true)
      const eventData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      }
      const response = await apiService.updateEvent(selectedEvent.id, eventData)
      if (response.success) {
        setIsEditMode(false)
        await fetchEvents()
        // Refresh current event data
        const updatedEvent = await apiService.getEventById(selectedEvent.id)
        if (updatedEvent.success) {
          setSelectedEvent(updatedEvent.data as EventItem)
        }
      } else {
        setError("Failed to update event")
      }
    } catch (err: any) {
      setError(err.message || "Failed to update event")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return

    try {
      setSubmitting(true)
      const response = await apiService.deleteEvent(selectedEvent.id)
      if (response.success) {
        setIsDeleteModalOpen(false)
        fetchEvents()
        setSelectedEvent(null)
      } else {
        setError("Failed to delete event")
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete event")
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
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <Button onClick={handleCreateEvent} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">Create your first event to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {event.name}
                  </CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatDate(event.startDate)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Until {formatDate(event.endDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {event.donorCount} donors
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {event.officerCount} officers
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewEvent(event)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View & Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteEvent(event)}
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

      {/* View/Edit Event Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>{isEditMode ? "Edit Event" : "Event Details"}</DialogTitle>
              {!isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleEditMode}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              {!isEditMode ? (
                <>
                  {/* View Mode */}
                  <div>
                    <Label className="text-gray-600">Event Name</Label>
                    <p className="font-medium text-lg mt-1">{selectedEvent.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Location</Label>
                    <p className="mt-1">{selectedEvent.location}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Start Date</Label>
                      <p className="mt-1">{formatDate(selectedEvent.startDate)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">End Date</Label>
                      <p className="mt-1">{formatDate(selectedEvent.endDate)}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEvent.status)}`}>
                        {selectedEvent.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Description</Label>
                    <p className="mt-1 text-gray-700">{selectedEvent.description || "No description provided"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-gray-600">Total Donors</Label>
                      <p className="font-bold text-2xl text-red-600 mt-1">{selectedEvent.donorCount}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Total Officers</Label>
                      <p className="font-bold text-2xl text-blue-600 mt-1">{selectedEvent.officerCount}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="space-y-2">
                    <Label htmlFor="view-name">Event Name *</Label>
                    <Input
                      id="view-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="view-location">Location *</Label>
                    <Input
                      id="view-location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="view-startDate">Start Date *</Label>
                      <Input
                        id="view-startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="view-endDate">End Date *</Label>
                      <Input
                        id="view-endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="view-status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="view-description">Description</Label>
                    <Textarea
                      id="view-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </>
              )}

              {/* Officers List */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-gray-900 font-semibold">Assigned Officers</Label>
                  <Button
                    size="sm"
                    onClick={handleOpenAssignModal}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Assign Petugas
                  </Button>
                </div>
                {eventOfficers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-md">
                    No officers assigned yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {eventOfficers.map((officer: any) => {
                      // Handle different possible data structures
                      const officerData = officer.user || officer
                      const officerId = officer.userId || officer.id
                      const officerName = officerData.fullName || officerData.name || 'Unknown'
                      const officerEmail = officerData.email || 'No email'

                      return (
                        <div
                          key={officerId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{officerName}</p>
                            <p className="text-sm text-gray-600">{officerEmail}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRemoveOfficer(officerId)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEvent} disabled={submitting} className="bg-red-600 hover:bg-red-700">
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Officer Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Petugas to Event</DialogTitle>
            <DialogDescription>
              Select a petugas to assign to this event.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="petugas-select">Select Petugas</Label>
            <Select value={selectedPetugasId} onValueChange={setSelectedPetugasId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a petugas" />
              </SelectTrigger>
              <SelectContent>
                {availablePetugas.map((petugas) => (
                  <SelectItem key={petugas.id} value={petugas.id}>
                    {petugas.fullName} - {petugas.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignModalOpen(false)
                setSelectedPetugasId("")
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignOfficer}
              disabled={submitting || !selectedPetugasId}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new donor event.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="create-name">Event Name *</Label>
                <Input
                  id="create-name"
                  placeholder="e.g. Donor Darah PMI Surabaya 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-location">Location *</Label>
                <Input
                  id="create-location"
                  placeholder="e.g. Gedung PMI Surabaya, Jl. Embong Kaliasin No. 20"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-startDate">Start Date *</Label>
                  <Input
                    id="create-startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-endDate">End Date *</Label>
                  <Input
                    id="create-endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  placeholder="Enter event description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Officers Assignment */}
              <div className="space-y-2 border-t pt-4">
                <Label>Assign Officers (Optional)</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                  {availablePetugas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No petugas available</p>
                  ) : (
                    availablePetugas.map((petugas) => (
                      <div key={petugas.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`petugas-${petugas.id}`}
                          checked={selectedOfficerIds.includes(petugas.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOfficerIds([...selectedOfficerIds, petugas.id])
                            } else {
                              setSelectedOfficerIds(selectedOfficerIds.filter(id => id !== petugas.id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`petugas-${petugas.id}`} className="text-sm cursor-pointer flex-1">
                          {petugas.fullName} - {petugas.email}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {selectedOfficerIds.length} officer(s) selected
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                {submitting ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEvent?.name}"? This action cannot be undone and will remove all associated data.
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