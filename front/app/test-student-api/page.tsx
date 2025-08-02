"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { api, storage } from "../../lib/api"

export default function TestStudentsAPI() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("timur_kz")

  const testGetAllStudents = async () => {
    setLoading(true)
    const token = storage.getAccessToken()

    try {
      const response = await api.students.getAllForTutor(token)
      setResults((prev) => ({
        ...prev,
        getAllStudents: {
          success: true,
          data: response,
          count: Array.isArray(response) ? response.length : 0,
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        getAllStudents: {
          error: error.message,
        },
      }))
    }
    setLoading(false)
  }

  const testCheckStudent = async () => {
    if (!username.trim()) {
      setResults((prev) => ({
        ...prev,
        checkStudent: {
          error: "Please enter a username",
        },
      }))
      return
    }

    setLoading(true)
    const token = storage.getAccessToken()

    try {
      const response = await api.classroom.checkStudent(username.trim(), token)
      setResults((prev) => ({
        ...prev,
        checkStudent: {
          success: true,
          data: response,
          username: username.trim(),
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        checkStudent: {
          error: error.message,
          username: username.trim(),
        },
      }))
    }
    setLoading(false)
  }

  const testDirectFetch = async () => {
    setLoading(true)
    const token = storage.getAccessToken()

    try {
      // Test the new endpoint directly
      const response = await fetch("http://localhost:8000/api/students/all/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text()
        setResults((prev) => ({
          ...prev,
          directFetch: {
            error: "Received HTML instead of JSON",
            status: response.status,
            htmlPreview: htmlText.substring(0, 500),
          },
        }))
      } else {
        const result = await response.json()
        setResults((prev) => ({
          ...prev,
          directFetch: {
            success: response.ok,
            status: response.status,
            data: result,
          },
        }))
      }
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        directFetch: {
          error: error.message,
        },
      }))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Test Students API Endpoints</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button onClick={testGetAllStudents} disabled={loading} className="bg-black text-white hover:bg-gray-800">
            Test Get All Students
          </Button>

          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username to check"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Button onClick={testCheckStudent} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
              Check Student
            </Button>
          </div>

          <Button onClick={testDirectFetch} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
            Test Direct Fetch
          </Button>
        </div>

        <div className="space-y-6">
          {Object.entries(results).map(([testName, result]) => (
            <div key={testName} className="border border-gray-300 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 capitalize">{testName.replace(/([A-Z])/g, " $1")}</h3>

              {result.error ? (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-800 font-medium">Error: {result.error}</p>
                  {result.status && <p className="text-red-600">Status: {result.status}</p>}
                  {result.username && <p className="text-red-600">Username: {result.username}</p>}
                  {result.htmlPreview && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-600">HTML Preview</summary>
                      <pre className="text-xs text-red-500 mt-2 overflow-auto bg-red-100 p-2 rounded">
                        {result.htmlPreview}
                      </pre>
                    </details>
                  )}
                </div>
              ) : result.success ? (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-green-800 font-medium">
                    Success! {result.count !== undefined && `Found ${result.count} students`}
                    {result.status && ` (Status: ${result.status})`}
                  </p>
                  {result.username && <p className="text-green-600">Checked Username: {result.username}</p>}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-green-600">View Response Data</summary>
                    <pre className="text-xs text-green-600 mt-2 overflow-auto bg-green-100 p-2 rounded max-h-60">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-800 font-medium">Status: {result.status}</p>
                  <pre className="text-xs text-blue-600 mt-2 overflow-auto bg-blue-100 p-2 rounded">
                    {JSON.stringify(result.data || result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">API Endpoints Being Tested:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>
              • <strong>Get All Students:</strong> GET /api/students/all/ (Returns all students from tutor's classrooms)
            </li>
            <li>
              • <strong>Check Student:</strong> POST /api/tutors/check/ (Validates student username)
            </li>
            <li>
              • <strong>Authentication:</strong> All endpoints require Bearer token
            </li>
            <li>
              • <strong>Permissions:</strong> Must be registered as a tutor
            </li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">Expected Response Format:</h3>
          <pre className="text-gray-600 text-xs overflow-auto">
            {`// GET /api/students/all/
[
  {
    "id": 6,
    "username": "student1",
    "first_name": "John",
    "last_name": "Doe",
    "school_name": "Example High School",
    "grade": "10",
    "phone": "+1234567890",
    "telegram_username": "johndoe"
  }
]

// POST /api/tutors/check/
{
  "student_id": 6,
  "message": "Student found"
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
