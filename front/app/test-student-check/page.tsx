"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { api, storage } from "../../lib/api"

export default function TestStudentCheck() {
  const [username, setUsername] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const testStudentCheck = async () => {
    if (!username.trim()) {
      setError("Please enter a username")
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
      const response = await api.classroom.checkStudent(username.trim(), token)
      setResult(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testClassroomCreation = async () => {
    const token = storage.getAccessToken()
    if (!token) {
      setError("Please login first")
      return
    }

    setLoading(true)
    setError("")

    try {
      const testData = {
        subject: "ENGLISH",
        classroom_type: "group",
        student_usernames: ["timur_kz", "alice_123"],
      }

      const response = await api.classroom.create(testData, token)
      setResult(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Test Student Check & Classroom Creation</h1>

        <div className="space-y-6">
          {/* Student Check Test */}
          <div className="border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test Student Check</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username to check"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <Button onClick={testStudentCheck} disabled={loading} className="bg-black text-white hover:bg-gray-800">
                {loading ? "Checking..." : "Check Student"}
              </Button>
            </div>
          </div>

          {/* Classroom Creation Test */}
          <div className="border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test Classroom Creation</h2>
            <p className="text-gray-600 mb-4">
              This will test creating a classroom with the sample JSON format:
              <br />
              <code className="bg-gray-100 p-2 rounded text-sm">
                {JSON.stringify({
                  subject: "ENGLISH",
                  classroom_type: "group",
                  student_usernames: ["timur_kz", "alice_123"],
                })}
              </code>
            </p>
            <Button
              onClick={testClassroomCreation}
              disabled={loading}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {loading ? "Creating..." : "Test Create Classroom"}
            </Button>
          </div>

          {/* Results */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-bold text-red-800 mb-2">Error:</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Success:</h3>
              <pre className="text-green-600 text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
