"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"

interface DashboardStats {
  totalEvents: number
  totalDonors: number
  eligibleDonors: number
  successRate: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
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
        setStats(response.data)
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Events</h3>
          <p className="text-3xl font-bold text-red-600">{stats?.totalEvents || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Donors</h3>
          <p className="text-3xl font-bold text-red-600">{stats?.totalDonors || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Eligible Donors</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.eligibleDonors || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.successRate ? `${stats.successRate.toFixed(1)}%` : '0%'}</p>
        </div>
      </div>
    </div>
  )
}