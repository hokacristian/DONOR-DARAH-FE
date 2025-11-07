"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"

interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalPetugas: number
  totalDonors: number
  totalExaminations: number
  eligibleDonors: number
  notEligibleDonors: number
}

interface RecentEvent {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  status: string
  _count: {
    donors: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await apiService.getDashboardStatistics()
      if (response.success) {
        setStats(response.data.statistics)
        setRecentEvents(response.data.recentEvents || [])
      } else {
        setError("Failed to load dashboard statistics")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard statistics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
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

  const calculateSuccessRate = () => {
    if (!stats || stats.totalDonors === 0) return 0
    return ((stats.eligibleDonors / stats.totalDonors) * 100).toFixed(1)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Events</h3>
          <p className="text-3xl font-bold text-red-600">{stats?.totalEvents || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{stats?.activeEvents || 0} active</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Petugas</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalPetugas || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Officers registered</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Donors</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.totalDonors || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{stats?.totalExaminations || 0} examinations</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-green-600">{calculateSuccessRate()}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats?.eligibleDonors || 0} eligible / {stats?.notEligibleDonors || 0} not eligible</p>
        </div>
      </div>

      {/* Eligibility Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Eligibility</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Eligible Donors</span>
              <span className="text-2xl font-bold text-green-600">{stats?.eligibleDonors || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Not Eligible</span>
              <span className="text-2xl font-bold text-red-600">{stats?.notEligibleDonors || 0}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Examined</span>
                <span className="text-xl font-bold text-gray-900">{stats?.totalExaminations || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
          {recentEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent events</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="border-l-4 border-red-600 pl-3 py-2">
                  <h4 className="font-medium text-gray-900 text-sm">{event.name}</h4>
                  <p className="text-xs text-gray-600">{event.location}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(event.startDate).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-xs font-medium text-red-600">
                      {event._count.donors} donors
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}