"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { api, storage } from "../../lib/api"

export default function TestStudentDetail() {
  const [studentId, setStudentId] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const testStudentDetail = async () => {
    if (!studentId.trim()) {
      setError("Please enter a student ID")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    const token = storage.getAccessToken()
    if (!token) {
      setError("Please login first")
      setLoading(false)
      return
    }

    try {
      const response = await api.students.getDetail(studentId.trim(), token)
      setResult(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Test Student Detail API</h1>

        <div className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test GET /api/students/details/{"{student_id}"}/</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter student ID (e.g., 6)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <Button onClick={testStudentDetail} disabled={loading} className="bg-black text-white hover:bg-gray-800">
                {loading ? "Loading..." : "Get Details"}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-bold text-red-800 mb-2">Error:</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Success - Student Details:</h3>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-bold">
                  {result.first_name} {result.last_name} (@{result.username})
                </h4>

                {/* Check if this is tutor view (has extended fields) */}
                {result.school_name !== undefined || result.phone !== undefined ? (
                  <div>
                    <p className="text-green-600 font-medium mb-2">🎓 Tutor View - Full Access</p>
                    <div className="space-y-1">
                      {result.school_name && (
                        <p>
                          <strong>School:</strong> {result.school_name}
                        </p>
                      )}
                      {result.grade && (
                        <p>
                          <strong>Grade:</strong> {result.grade}
                        </p>
                      )}
                      {result.phone && (
                        <p>
                          <strong>Phone:</strong> {result.phone}
                        </p>
                      )}
                      {result.telegram_username && (
                        <p>
                          <strong>Telegram:</strong> @{result.telegram_username}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-blue-600 font-medium mb-2">👥 Student View - Limited Access</p>
                    <p className="text-sm text-gray-600">Only basic information is visible to classmates.</p>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600">View Raw JSON</summary>
                  <pre className="text-xs text-gray-500 mt-2 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </details>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">Expected API Behavior:</h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p>
              <strong>Tutor View:</strong> Returns full student information including school_name, grade, phone,
              telegram_username
            </p>
            <p>
              <strong>Student View:</strong> Returns limited information (username, first_name, last_name only)
            </p>
            <p>
              <strong>No Permission:</strong> Returns 404 error if no shared classroom exists
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
