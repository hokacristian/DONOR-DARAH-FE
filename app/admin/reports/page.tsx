"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { FileText, Eye, Calendar, MapPin, Users, CheckCircle, XCircle } from "lucide-react"

interface EventStatistics {
  totalDonors: number
  totalExamined: number
  eligibleCount: number
  notEligibleCount: number
}

interface EventReport {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: string
  statistics: EventStatistics
}

export default function ReportsPage() {
  const [reports, setReports] = useState<EventReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllReports()
      if (response.success) {
        setReports(response.data)
      } else {
        setError("Failed to load reports")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load reports")
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

  const getSuccessRate = (stats: EventStatistics) => {
    if (stats.totalExamined === 0) return 0
    return ((stats.eligibleCount / stats.totalExamined) * 100).toFixed(1)
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Reports</h1>
          <p className="text-gray-600 mt-1">View and analyze donor statistics for all events</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <FileText className="h-5 w-5" />
          <span className="font-medium">{reports.length} Events</span>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-md border border-gray-200 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Available</h3>
          <p className="text-gray-600">There are no event reports to display at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{report.name}</h2>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{report.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(report.startDate)} - {formatDate(report.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/reports/${report.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600">Total Donors</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{report.statistics.totalDonors}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600">Examined</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{report.statistics.totalExamined}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-gray-600">Eligible</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{report.statistics.eligibleCount}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-gray-600">Not Eligible</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{report.statistics.notEligibleCount}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-xs text-gray-600">Success Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{getSuccessRate(report.statistics)}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
