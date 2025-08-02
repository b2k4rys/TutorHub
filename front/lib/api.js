const API_BASE_URL = "http://127.0.0.1:8000/api"

// Storage utilities
export const storage = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("refresh_token", refreshToken)
  },

  getAccessToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),

  clearTokens: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  },
}

// Core API utility
const api = {
  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  },

  // GET request
  async get(endpoint, token) {
    return this.request(endpoint, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  },

  // POST request
  async post(endpoint, data, token, useFormData = false) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    if (useFormData) {
      const formData = new FormData()
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          data[key].forEach((item) => formData.append(key, item))
        } else {
          formData.append(key, data[key])
        }
      })

      return this.request(endpoint, {
        method: "POST",
        headers,
        body: formData,
      })
    } else {
      return this.request(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(data),
      })
    }
  },

  // Authentication endpoints
  auth: {
    login: (credentials) => api.post("/auth/login/", credentials),
    register: (userData) => api.post("/auth/register/", userData),
    refresh: (refreshToken) => api.post("/auth/refresh/", { refresh: refreshToken }),
  },

  // Student endpoints
  students: {
    register: (studentData) => api.post("/students/register/", studentData),
    getDetail: (id, token) => api.get(`/students/details/${id}/`, token),
    getAll: (token) => api.get("/students/all/", token),
  },

  // Tutor endpoints
  tutors: {
    register: (tutorData) => api.post("/tutors/register/", tutorData),
    getDetail: (id, token) => api.get(`/tutors/details/${id}/`, token),
    getAll: (token) => api.get("/tutors/all/", token),
  },

  // Classroom endpoints
  classroom: {
    create: (classroomData, token) => api.post("/classroom/register/", classroomData, token, false),
    list: (token) => api.get("/classroom/all/", token),
    get: (id, token) => api.get(`/classroom/${id}/`, token),
    checkStudent: (username, token) => api.post("/tutors/check/", { student_username: username }, token, false),
  },

  // Homework endpoints
  homeworks: {
    list: (token) => api.get("/homeworks/", token),
    get: (id, token) => api.get(`/homeworks/${id}/`, token),
    create: (classroomId, homeworkData, token) =>
      api.post(`/homeworks/classroom/${classroomId}/assign/`, homeworkData, token, true),
  },

  // Chat endpoints
  chat: {
    getTicket: (token) => api.post("/ws-ticket/", {}, token),
    startChat: (userType, userId, token) => api.get(`/chat/start/${userType}/${userId}/`, token),
    getMessageHistory: (conversationId, token) => api.get(`/conversations/${conversationId}/messages/`, token),
  },
}

export { api }
