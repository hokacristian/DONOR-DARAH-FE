const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://donor-darah-be-v1.vercel.app/api"

interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: {
      id: string
      email: string
      fullName: string
      role: string
    }
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

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

interface DashboardStatistics {
  statistics: DashboardStats
  recentEvents: RecentEvent[]
}

class ApiService {
  private getAuthHeader() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const authHeader = this.getAuthHeader()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(authHeader as Record<string, string>),
      ...(options.headers as Record<string, string> || {}),
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    return response.json()
  }

  async getCurrentUser() {
    return this.fetchWithAuth<any>(`${API_BASE_URL}/auth/me`)
  }

  async getDashboardStatistics() {
    return this.fetchWithAuth<DashboardStatistics>(`${API_BASE_URL}/admin/dashboard/statistics`)
  }

  async getAllEvents() {
    return this.fetchWithAuth<any[]>(`${API_BASE_URL}/admin/events`)
  }

  async getEventById(eventId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/events/${eventId}`)
  }

  async createEvent(eventData: any) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/events`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  }

  async updateEvent(eventId: string, eventData: any) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    })
  }

  async deleteEvent(eventId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/events/${eventId}`, {
      method: 'DELETE',
    })
  }

  async getAllUsers() {
    return this.fetchWithAuth<any[]>(`${API_BASE_URL}/admin/users`)
  }

  async getAllPetugas() {
    return this.fetchWithAuth<any[]>(`${API_BASE_URL}/admin/petugas`)
  }

  async getPetugasById(petugasId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/petugas/${petugasId}`)
  }

  async createPetugas(petugasData: { email: string; password: string; fullName: string }) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      body: JSON.stringify({ ...petugasData, role: 'petugas' }),
    })
  }

  async updatePetugas(petugasId: string, petugasData: { email?: string; fullName?: string; password?: string }) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/petugas/${petugasId}`, {
      method: 'PUT',
      body: JSON.stringify(petugasData),
    })
  }

  async deletePetugas(petugasId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/petugas/${petugasId}`, {
      method: 'DELETE',
    })
  }

  async getEventReport(eventId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/reports/${eventId}`)
  }

  async getSettings() {
    return this.fetchWithAuth<any[]>(`${API_BASE_URL}/admin/settings`)
  }

  async updateThresholdSetting(value: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/settings/eligibility_threshold`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    })
  }

  // Event Officers Management
  async getEventOfficers(eventId: string) {
    return this.fetchWithAuth<any[]>(`${API_BASE_URL}/admin/events/${eventId}/officers`)
  }

  async assignOfficer(eventId: string, userId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/events/${eventId}/officers`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  async removeOfficer(eventId: string, officerId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/events/${eventId}/officers/${officerId}`, {
      method: 'DELETE',
    })
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  saveAuthData(token: string, user: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  getStoredUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  getStoredToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Petugas endpoints
  async getPetugasAssignedEvents() {
    return this.fetchWithAuth<any[]>(`${API_BASE_URL}/petugas/my-events`)
  }

  async getPetugasEventById(eventId: string) {
    return this.fetchWithAuth<any>(`${API_BASE_URL}/petugas/events/${eventId}`)
  }

  async registerDonorWithExamination(eventId: string, donorData: any) {
    return this.fetchWithAuth(`${API_BASE_URL}/petugas/events/${eventId}/donors`, {
      method: 'POST',
      body: JSON.stringify(donorData),
    })
  }

  async getEventDonors(eventId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/petugas/events/${eventId}/donors`)
  }

  async getDonorById(eventId: string, donorId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/petugas/events/${eventId}/donors/${donorId}`)
  }

  async updateDonorWithExamination(eventId: string, donorId: string, donorData: any) {
    return this.fetchWithAuth(`${API_BASE_URL}/petugas/events/${eventId}/donors/${donorId}`, {
      method: 'PUT',
      body: JSON.stringify(donorData),
    })
  }
}

export const apiService = new ApiService()