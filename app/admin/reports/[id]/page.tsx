"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity
} from "lucide-react"

interface Event {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: string
}

interface Statistics {
  totalDonors: number
  totalExamined: number
  eligibleCount: number
  notEligibleCount: number
  threshold: number
}

interface Donor {
  id: string
  fullName: string
  birthDate: string
  gender: string
  bloodType: string
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
}

interface CriteriaValue {
  criteriaId: number
  code: string
  rawValue: number
  mappedValue: number
}

interface Evaluation {
  examinationId: string
  donorId: string
  preferenceValue: number
  benefitSum: number
  costSum: number
  isEligible: boolean
  status: string
  threshold: number
  criteriaValues: CriteriaValue[]
  normalizedValues: number[]
  weightedValues: number[]
  calculatedAt: string
}

interface DonorEvaluation {
  donor: Donor
  examination: Examination
  evaluation: Evaluation
}

interface ReportDetail {
  event: Event
  statistics: Statistics
  evaluations: DonorEvaluation[]
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [reportData, setReportData] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Criteria names mapping
  const criteriaNames: Record<string, string> = {
    'C1': 'Tekanan Darah',
    'C2': 'Berat Badan',
    'C3': 'Hemoglobin',
    'C4': 'Tidak Konsumsi Obat',
    'C5': 'Umur',
    'C6': 'Lamanya Terakhir Tidur',
    'C7': 'Riwayat Penyakit'
  }

  useEffect(() => {
    if (eventId) {
      fetchReportDetail()
    }
  }, [eventId])

  const fetchReportDetail = async () => {
    try {
      setLoading(true)
      const response = await apiService.getEventReport(eventId)
      if (response.success) {
        setReportData(response.data)
      } else {
        setError("Failed to load report details")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load report details")
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSuccessRate = () => {
    if (!reportData || reportData.statistics.totalExamined === 0) return 0
    return ((reportData.statistics.eligibleCount / reportData.statistics.totalExamined) * 100).toFixed(1)
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const getEligibilityBadge = (isEligible: boolean, status: string) => {
    if (isEligible) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          {status}
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <button
          onClick={() => router.push('/admin/reports')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </button>
        <div className="text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          {error || "Report not found"}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/reports')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </button>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{reportData.event.name}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm md:text-base text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{reportData.event.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{formatDate(reportData.event.startDate)} - {formatDate(reportData.event.endDate)}</span>
              </div>
            </div>
          </div>
          <div className="self-start">
            {getStatusBadge(reportData.event.status)}
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Total Donors</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{reportData.statistics.totalDonors}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Examined</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-blue-600">{reportData.statistics.totalExamined}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Eligible</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-green-600">{reportData.statistics.eligibleCount}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Not Eligible</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-red-600">{reportData.statistics.notEligibleCount}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Success Rate</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-purple-600">{getSuccessRate()}%</p>
        </div>
      </div>

      {/* Threshold Information */}
      <div className="bg-blue-50 border border-blue-200 p-4 md:p-5 rounded-lg mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <h3 className="font-semibold text-blue-900 text-sm md:text-base">Eligibility Threshold</h3>
        </div>
        <p className="text-blue-800 text-sm md:text-base">
          Current threshold value: <span className="font-bold">{reportData.statistics.threshold.toFixed(3)}</span>
        </p>
        <p className="text-xs md:text-sm text-blue-700 mt-1">
          Donors with preference value above this threshold are considered eligible for blood donation.
        </p>
      </div>

      {/* Evaluations Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Donor Evaluations</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">Detailed examination and evaluation results for all donors</p>
        </div>

        {reportData.evaluations.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Evaluations Yet</h3>
            <p className="text-gray-600">There are no donor evaluations for this event.</p>
          </div>
        ) : (
          <>
            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {reportData.evaluations.map((evaluation, index) => (
                <div key={index} className="p-6 space-y-4">
                  {/* Donor Info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{evaluation.donor.fullName}</h3>
                      <p className="text-sm text-gray-600">
                        {evaluation.examination.age} tahun, {evaluation.donor.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      {evaluation.donor.bloodType}
                    </span>
                  </div>

                  {/* Status and Preference */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      {getEligibilityBadge(evaluation.evaluation.isEligible, evaluation.evaluation.status)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Preference Value</p>
                      <div className="font-bold text-xl" style={{
                        color: evaluation.evaluation.isEligible ? '#059669' : '#DC2626'
                      }}>
                        {evaluation.evaluation.preferenceValue.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  {/* Examination Data */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Data Pemeriksaan</p>
                    <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded">
                      <div>
                        <span className="text-gray-600">Tekanan Darah:</span>
                        <p className="font-medium">{evaluation.examination.bloodPressureSystolic}/{evaluation.examination.bloodPressureDiastolic}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Berat Badan:</span>
                        <p className="font-medium">{evaluation.examination.weight} kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Hemoglobin:</span>
                        <p className="font-medium">{evaluation.examination.hemoglobin} g/dL</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tidur:</span>
                        <p className="font-medium">{evaluation.examination.lastSleepHours} jam</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Bebas Obat:</span>
                        <p className="font-medium">{evaluation.examination.medicationFreeDays} hari</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Riwayat Penyakit:</span>
                        <p className="font-medium">{evaluation.examination.hasDiseaseHistory ? 'Ya' : 'Tidak'}</p>
                      </div>
                    </div>
                  </div>

                  {/* MOORA Calculation */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Hasil Perhitungan MOORA</p>
                    <div className="grid grid-cols-2 gap-2 text-sm bg-blue-50 p-3 rounded border border-blue-200">
                      <div>
                        <span className="text-blue-700">Benefit Sum:</span>
                        <p className="font-medium text-blue-900">{evaluation.evaluation.benefitSum.toFixed(4)}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Cost Sum:</span>
                        <p className="font-medium text-blue-900">{evaluation.evaluation.costSum.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Calculated At */}
                  <div className="text-xs text-gray-500">
                    Dihitung pada: {formatDateTime(evaluation.evaluation.calculatedAt)}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examination Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preference Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calculated At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.evaluations.map((evaluation, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{evaluation.donor.fullName}</div>
                          <div className="text-sm text-gray-500">
                            {evaluation.examination.age} tahun, {evaluation.donor.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                          {evaluation.donor.bloodType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-gray-600">BP:</span>
                            <span className="font-medium">{evaluation.examination.bloodPressureSystolic}/{evaluation.examination.bloodPressureDiastolic}</span>
                            <span className="text-gray-600">Berat:</span>
                            <span className="font-medium">{evaluation.examination.weight} kg</span>
                            <span className="text-gray-600">Hb:</span>
                            <span className="font-medium">{evaluation.examination.hemoglobin} g/dL</span>
                            <span className="text-gray-600">Tidur:</span>
                            <span className="font-medium">{evaluation.examination.lastSleepHours} jam</span>
                            <span className="text-gray-600">Obat:</span>
                            <span className="font-medium">{evaluation.examination.medicationFreeDays} hari</span>
                            <span className="text-gray-600">Riwayat:</span>
                            <span className="font-medium">{evaluation.examination.hasDiseaseHistory ? 'Ya' : 'Tidak'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-lg" style={{
                          color: evaluation.evaluation.isEligible ? '#059669' : '#DC2626'
                        }}>
                          {evaluation.evaluation.preferenceValue.toFixed(4)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getEligibilityBadge(evaluation.evaluation.isEligible, evaluation.evaluation.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(evaluation.evaluation.calculatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Criteria Breakdown */}
      {reportData.evaluations.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Criteria Breakdown</h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">Detailed criteria values for each donor evaluation</p>
          </div>
          <div className="p-4 md:p-6 space-y-6">
            {reportData.evaluations.map((evaluation, evalIndex) => (
              <div key={evalIndex} className="border-l-4 border-red-500 pl-3 md:pl-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-base md:text-lg">{evaluation.donor.fullName}</h3>

                {/* MOORA Calculation Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                  <div>
                    <span className="text-xs text-blue-700">Benefit Sum:</span>
                    <p className="font-bold text-blue-900">{evaluation.evaluation.benefitSum.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700">Cost Sum:</span>
                    <p className="font-bold text-blue-900">{evaluation.evaluation.costSum.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700">Preference Value:</span>
                    <p className="font-bold text-lg" style={{
                      color: evaluation.evaluation.isEligible ? '#059669' : '#DC2626'
                    }}>
                      {evaluation.evaluation.preferenceValue.toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* Criteria Values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {evaluation.evaluation.criteriaValues.map((criteria, idx) => (
                    <div key={criteria.criteriaId} className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-xs text-gray-600 mb-2 font-medium">
                        {criteria.code} - {criteriaNames[criteria.code]}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-700">Raw:</span>
                          <span className="font-medium text-sm">{criteria.rawValue}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-700">Mapped:</span>
                          <span className="font-medium text-sm">{criteria.mappedValue}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-700">Normalized:</span>
                          <span className="font-medium text-sm">{evaluation.evaluation.normalizedValues[idx]?.toFixed(4) || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-700">Weighted:</span>
                          <span className="font-medium text-sm">{evaluation.evaluation.weightedValues[idx]?.toFixed(6) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
