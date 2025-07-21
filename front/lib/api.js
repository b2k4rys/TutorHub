const API_BASE_URL = "http://localhost:8000/api"

// API utility functions
export const api = {
  // POST request helper
  post: async (endpoint, data, token = null) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle different error formats from Django
        const errorMessage =
          result.detail ||
          result.message ||
          result.non_field_errors?.[0] ||
          Object.values(result)[0]?.[0] ||
          "Something went wrong"
        throw new Error(errorMessage)
      }

      return result
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  },

  // GET request helper
  get: async (endpoint, token = null) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers,
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.detail || result.message || "Something went wrong"
        throw new Error(errorMessage)
      }

      return result
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  },

  // Auth endpoints matching your Django URLs
  auth: {
    // Login using JWT token endpoint - using username field as required by Django
    login: (credentials) =>
      api.post("/auth/login/", {
        username: credentials.username, // Use actual username, not email
        password: credentials.password,
      }),

    // Register using role-based registration
    register: (userData) => api.post("/auth/register/", userData),

    // Get current user info
    me: (token) => api.get("/auth/me/", token),

    // Refresh JWT token
    refreshToken: (refreshToken) =>
      api.post("/auth/token/refresh/", {
        refresh: refreshToken,
      }),
  },
}

// Local storage helpers
export const storage = {
  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tutorhub_access_token", accessToken)
      localStorage.setItem("tutorhub_refresh_token", refreshToken)
    }
  },

  getAccessToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tutorhub_access_token")
    }
    return null
  },

  getRefreshToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tutorhub_refresh_token")
    }
    return null
  },

  removeTokens: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tutorhub_access_token")
      localStorage.removeItem("tutorhub_refresh_token")
    }
  },

  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tutorhub_user", JSON.stringify(user))
    }
  },

  getUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("tutorhub_user")
      return user ? JSON.parse(user) : null
    }
    return null
  },

  removeUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tutorhub_user")
    }
  },

  // Clear all stored data
  clearAll: () => {
    storage.removeTokens()
    storage.removeUser()
  },
}

// Token refresh utility
export const refreshAccessToken = async () => {
  const refreshToken = storage.getRefreshToken()
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  try {
    const response = await api.auth.refreshToken(refreshToken)
    storage.setTokens(response.access, refreshToken)
    return response.access
  } catch (error) {
    // If refresh fails, clear all tokens and redirect to login
    storage.clearAll()
    throw error
  }
}
