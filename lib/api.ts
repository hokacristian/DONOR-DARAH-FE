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

class ApiService {
  private getAuthHeader() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
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
    return this.fetchWithAuth(`${API_BASE_URL}/auth/me`)
  }

  async getDashboardStatistics() {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/dashboard/statistics`)
  }

  async getAllEvents() {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/events`)
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
    return this.fetchWithAuth(`${API_BASE_URL}/admin/users`)
  }

  async getAllPetugas() {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/petugas`)
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
    return this.fetchWithAuth(`${API_BASE_URL}/admin/settings`)
  }

  async updateThresholdSetting(value: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/admin/settings/eligibility_threshold`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
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
}

export const apiService = new ApiService()