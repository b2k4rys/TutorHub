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
          } else if (data[key] !== null && data[key] !== undefined) {
            body.append(key, data[key])
          }
        })
      } else {
        // Use JSON for other endpoints
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(data)
      }

      console.log(`Making ${useFormData ? "FormData" : "JSON"} POST request to: ${API_BASE_URL}${endpoint}`)
      console.log("Data being sent:", data)
      if (useFormData) {
        console.log("FormData entries:", [...body.entries()])
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body,
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text()
        console.error("Received HTML instead of JSON:", htmlText.substring(0, 500))
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Response data:", result)

      if (!response.ok) {
        const errorMessage =
          result.detail ||
          result.message ||
          result.error ||
          result.non_field_errors?.[0] ||
          result.student_usernames?.[0] ||
          Object.values(result)[0]?.[0] ||
          Object.values(result).flat().join(", ") ||
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
    // Try form-data first, then JSON if that fails
    create: async (classroomData, token) => {
      console.log("Attempting classroom creation with data:", classroomData)

      try {
        // First try with form-data (most Django endpoints expect this)
        console.log("Trying form-data format...")
        return await api.post("/classroom/register/", classroomData, token, true)
      } catch (error) {
        console.log("Form-data failed, trying JSON format...")
        console.error("Form-data error:", error.message)

        try {
          // If form-data fails, try JSON
          return await api.post("/classroom/register/", classroomData, token, false)
        } catch (jsonError) {
          console.error("JSON format also failed:", jsonError.message)
          throw new Error(
            `Classroom creation failed. Form-data error: ${error.message}. JSON error: ${jsonError.message}`,
          )
        }
      }
    },

    list: (token) => api.get("/classroom/all/", token),

    get: (id, token) => api.get(`/classroom/${id}/`, token),

    checkStudent: (username, token) =>
      api.post(
        "/tutors/check/",
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

    // Get all students for current tutor
    getAllForTutor: (token) => api.get("/students/all/", token),
  },

  // Tutors endpoints
  tutors: {
    list: (token) => api.get("/tutors/", token),

    get: (id, token) => api.get(`/tutors/${id}/`, token),

    // Tutor detail endpoint with better error handling
    getDetail: (tutorId, token) => api.get(`/tutors/details/${tutorId}/`, token),
  },

  // Homework endpoints
  homeworks: {
    // List all homeworks (assuming there's a list endpoint)
    list: (token) => api.get("/homeworks/", token),

    // Get homeworks for a specific classroom
    getByClassroom: (classroomId, token) => api.get(`/homeworks/classroom/${classroomId}/`, token),

    // Get specific homework details
    get: (id, token) => api.get(`/homeworks/${id}/`, token),

    // Create new homework for specific classroom (tutors only)
    create: (classroomId, homeworkData, token) =>
      api.post(`/homeworks/classroom/${classroomId}/assign/`, homeworkData, token, true),

    // Submit homework (if needed later)
    submit: (homeworkData, token) => api.post("/homeworks/submit/", homeworkData, token, true),

    // Grade homework (if needed later)
    grade: (homeworkData, token) => api.post("/homeworks/grade/", homeworkData, token, false),
  },

  // Chat endpoints
  chat: {
    // Get WebSocket ticket for authentication
    getWebSocketTicket: (token) => api.post("/ws-ticket/", {}, token, false),

    // Start or get existing chat with another user
    startChat: (userType, userId, token) => api.get(`/chat/start/${userType}/${userId}/`, token),

    // Get message history for a conversation
    getMessageHistory: async (conversationId, token) => {
      try {
        console.log(`Loading message history for conversation: ${conversationId}`)
        const result = await api.get(`/conversations/${conversationId}/messages/`, token)
        console.log("Message history API response:", result)
        return result
      } catch (error) {
        console.error("Failed to load message history:", error)
        // Return empty array if history fails to load
        return []
      }
    },
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
