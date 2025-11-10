"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "petugas"
}

export default function ProtectedRoute({ children, requiredRole = "admin" }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = apiService.getStoredToken()
      const user = apiService.getStoredUser()

      if (!token || !user) {
        router.push("/login")
        return
      }

      try {
        const response = await apiService.getCurrentUser()
        if (response.success && response.data.role === requiredRole) {
          setIsAuthenticated(true)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}