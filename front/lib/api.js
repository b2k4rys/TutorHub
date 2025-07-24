const API_BASE_URL = "http://localhost:8000/api"

// API utility functions
export const api = {
  // POST request helper with form-data support
  post: async (endpoint, data, token = null, useFormData = false) => {
    try {
      const headers = {}

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      let body
      if (useFormData) {
        // Create FormData for endpoints that expect form-data
        body = new FormData()
        Object.keys(data).forEach((key) => {
          if (Array.isArray(data[key])) {
            // Handle arrays (like student_usernames)
            data[key].forEach((item) => {
              body.append(key, item)
            })
          } else {
            body.append(key, data[key])
          }
        })
      } else {
        // Use JSON for other endpoints
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(data)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body,
      })

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`)
      }

      const result = await response.json()

      if (!response.ok) {
        const errorMessage =
          result.detail ||
          result.message ||
          result.error ||
          result.non_field_errors?.[0] ||
          result.student_usernames?.[0] ||
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

  // GET request helper with better error handling
  get: async (endpoint, token = null) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      console.log(`Making GET request to: ${API_BASE_URL}${endpoint}`)
      console.log("Headers:", headers)

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers,
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text()
        console.error("Received HTML instead of JSON:", htmlText.substring(0, 200))
        throw new Error(
          `Server returned HTML instead of JSON. Status: ${response.status}. Check CORS settings and authentication.`,
        )
      }

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.detail || result.message || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      return result
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  },

  // Auth endpoints
  auth: {
    login: (credentials) =>
      api.post(
        "/auth/login/",
        {
          username: credentials.username,
          password: credentials.password,
        },
        null,
        true,
      ),

    register: (userData) => api.post("/auth/register/", userData, null, true),

    me: (token) => api.get("/auth/me/", token),

    refreshToken: (refreshToken) =>
      api.post(
        "/auth/token/refresh/",
        {
          refresh: refreshToken,
        },
        null,
        true,
      ),
  },

  // Classroom endpoints
  classroom: {
    create: (classroomData, token) => api.post("/classroom/register/", classroomData, token, false),

    list: (token) => api.get("/classroom/all/", token),

    get: (id, token) => api.get(`/classroom/${id}/`, token),

    checkStudent: (username, token) =>
      api.post(
        "/classroom/check/",
        {
          student_username: username,
        },
        token,
        false,
      ),
  },

  // Students endpoints
  students: {
    list: (token) => api.get("/students/", token),

    get: (id, token) => api.get(`/students/${id}/`, token),

    // Student detail endpoint
    getDetail: (studentId, token) => api.get(`/students/details/${studentId}/`, token),
  },

  // Tutors endpoints
  tutors: {
    list: (token) => api.get("/tutors/", token),

    get: (id, token) => api.get(`/tutors/${id}/`, token),

    // Tutor detail endpoint with better error handling
    getDetail: (tutorId, token) => api.get(`/tutors/details/${tutorId}/`, token),
  },
}

// Local storage helpers (unchanged)
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
    storage.clearAll()
    throw error
  }
}
