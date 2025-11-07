"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, Plus, UserPlus, CheckCircle, XCircle, ChevronLeft } from "lucide-react"

interface Event {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: string
  description: string
}

interface Examination {
  id: string
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  weight: number
  hemoglobin: number
  medicationFreeDays: number
  age: number
  lastSleepHours: number
  hasDiseaseHistory: boolean
  sawEvaluations?: {
    id: string
    preferenceValue: number
    isEligible: boolean
  }[]
}

interface Donor {
  id: string
  fullName: string
  birthDate: string
  gender: string
  bloodType: string
  phone: string
  address: string
  examinations?: Examination[]
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    gender: "",
    bloodType: "",
    phone: "",
    address: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    weight: "",
    hemoglobin: "",
    medicationFreeDays: "",
    age: "",
    lastSleepHours: "",
    hasDiseaseHistory: "false",
  })

  useEffect(() => {
    fetchEventData()
    fetchDonors()
  }, [eventId])

  const fetchEventData = async () => {
    try {
      const response = await apiService.getPetugasEventById(eventId)
      if (response.success) {
        setEvent(response.data)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load event")
    } finally {
      setLoading(false)
    }
  }

  const fetchDonors = async () => {
    try {
      const response = await apiService.getPetugasEventById(eventId)
      if (response.success && response.data.donors) {
        setDonors(response.data.donors)
      }
    } catch (err: any) {
      console.error("Failed to load donors:", err)
    }
  }

  const handleOpenModal = () => {
    setFormData({
      fullName: "",
      birthDate: "",
      gender: "",
      bloodType: "",
      phone: "",
      address: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      weight: "",
      hemoglobin: "",
      medicationFreeDays: "",
      age: "",
      lastSleepHours: "",
      hasDiseaseHistory: "false",
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const donorData = {
        fullName: formData.fullName,
        birthDate: formData.birthDate,
        gender: formData.gender,
        bloodType: formData.bloodType,
        phone: formData.phone,
        address: formData.address,
        bloodPressureSystolic: parseInt(formData.bloodPressureSystolic),
        bloodPressureDiastolic: parseInt(formData.bloodPressureDiastolic),
        weight: parseFloat(formData.weight),
        hemoglobin: parseFloat(formData.hemoglobin),
        medicationFreeDays: parseInt(formData.medicationFreeDays),
        age: parseInt(formData.age),
        lastSleepHours: parseInt(formData.lastSleepHours),
        hasDiseaseHistory: formData.hasDiseaseHistory === "true",
      }

      const response = await apiService.registerDonorWithExamination(eventId, donorData)
      if (response.success) {
        setIsModalOpen(false)
        fetchDonors()
        // Show success message with evaluation result
        alert(`Donor registered successfully!\nStatus: ${response.data.evaluation.status}\nEligibility: ${response.data.evaluation.isEligible ? 'LAYAK' : 'TIDAK LAYAK'}`)
      } else {
        setError("Failed to register donor")
      }
    } catch (err: any) {
      setError(err.message || "Failed to register donor")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-8">
        <div className="text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          Event not found
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {event.location}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(event.startDate).toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
          <Button onClick={handleOpenModal} className="bg-red-600 hover:bg-red-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Register New Donor
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Donors List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Donors ({donors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {donors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No donors registered yet. Click "Register New Donor" to add the first donor.
            </div>
          ) : (
            <div className="space-y-4">
              {donors.map((donor) => {
                // Get latest examination and evaluation
                const latestExam = donor.examinations?.[0]
                const latestEval = latestExam?.sawEvaluations?.[0]

                return (
                  <div
                    key={donor.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{donor.fullName}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>Blood Type: {donor.bloodType}</span>
                        <span>Phone: {donor.phone}</span>
                        {latestExam && (
                          <>
                            <span>
                              BP: {latestExam.bloodPressureSystolic}/{latestExam.bloodPressureDiastolic}
                            </span>
                            <span>Weight: {latestExam.weight} kg</span>
                            <span>Hb: {latestExam.hemoglobin} g/dL</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {latestEval && (
                        <>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Preference Value</div>
                            <div className="font-semibold text-gray-900">
                              {latestEval.preferenceValue.toFixed(4)}
                            </div>
                          </div>
                          {latestEval.isEligible ? (
                            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-semibold">LAYAK</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-2 rounded-lg">
                              <XCircle className="h-5 w-5" />
                              <span className="font-semibold">TIDAK LAYAK</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Register Donor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Donor</DialogTitle>
            <DialogDescription>
              Fill in donor information and health examination data. The system will automatically evaluate eligibility using SAW algorithm.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Birth Date *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type *</Label>
                    <Select value={formData.bloodType} onValueChange={(value) => setFormData({ ...formData, bloodType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="AB">AB</SelectItem>
                        <SelectItem value="O">O</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Health Examination */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Health Examination</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systolic">Blood Pressure (Systolic) *</Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="e.g. 120"
                      value={formData.bloodPressureSystolic}
                      onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic">Blood Pressure (Diastolic) *</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="e.g. 80"
                      value={formData.bloodPressureDiastolic}
                      onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 65"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hemoglobin">Hemoglobin (g/dL) *</Label>
                    <Input
                      id="hemoglobin"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 14.5"
                      value={formData.hemoglobin}
                      onChange={(e) => setFormData({ ...formData, hemoglobin: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medication">Medication Free Days *</Label>
                    <Input
                      id="medication"
                      type="number"
                      placeholder="e.g. 7"
                      value={formData.medicationFreeDays}
                      onChange={(e) => setFormData({ ...formData, medicationFreeDays: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g. 25"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleep">Last Sleep Hours *</Label>
                    <Input
                      id="sleep"
                      type="number"
                      placeholder="e.g. 8"
                      value={formData.lastSleepHours}
                      onChange={(e) => setFormData({ ...formData, lastSleepHours: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disease">Disease History *</Label>
                    <Select value={formData.hasDiseaseHistory} onValueChange={(value) => setFormData({ ...formData, hasDiseaseHistory: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                {submitting ? "Registering..." : "Register & Evaluate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
