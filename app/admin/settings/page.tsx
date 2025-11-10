"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const [threshold, setThreshold] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSettings()
      if (response.success) {
        const thresholdSetting = response.data.find((s: any) => s.key === 'eligibility_threshold')
        if (thresholdSetting) {
          setThreshold(thresholdSetting.value)
        }
      } else {
        setError("Failed to load settings")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await apiService.updateThresholdSetting(threshold)
      if (!response.success) {
        setError("Failed to save settings")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Eligibility Threshold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label htmlFor="threshold" className="text-sm font-medium text-gray-700">
              Minimum Moora Score for Eligibility
            </label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-sm text-gray-500">
              Set the minimum Multi-Objective Optimization on the basis of Ratio Analysis (Moora) score for a donor to be considered eligible.
            </p>
          </div>
          <div className="mt-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}