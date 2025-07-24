"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { api, storage } from "../../lib/api"

export default function TestClassroomDetail() {
  const [classroomId, setClassroomId] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const testClassroomDetail = async () => {
    if (!classroomId.trim()) {
      setError("Please enter a classroom ID")
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
      const response = await api.classroom.get(classroomId.trim(), token)
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
        <h1 className="text-3xl font-bold text-black mb-8">Test Classroom Detail API</h1>

        <div className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test GET /api/classroom/{"{id}"}/</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                placeholder="Enter classroom ID (e.g., 5)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <Button
                onClick={testClassroomDetail}
                disabled={loading}
                className="bg-black text-white hover:bg-gray-800"
              >
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
              <h3 className="font-bold text-green-800 mb-2">Success - Classroom Details:</h3>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-bold">Classroom #{result.id}</h4>
                <p>
                  <strong>Subject:</strong> {result.subject}
                </p>
                <p>
                  <strong>Type:</strong> {result.classroom_type}
                </p>
                <p>
                  <strong>Tutor:</strong> {result.tutor?.first_name} {result.tutor?.last_name} (@
                  {result.tutor?.username})
                </p>
                <p>
                  <strong>Students:</strong> {result.students?.length || 0}
                </p>

                {result.students && result.students.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Student List:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {result.students.map((student) => (
                        <li key={student.id} className="text-sm">
                          {student.first_name} {student.last_name} (@{student.username}) - ID: {student.id}
                        </li>
                      ))}
                    </ul>
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
          <h3 className="font-bold text-blue-800 mb-2">Expected API Response Format:</h3>
          <pre className="text-blue-600 text-xs overflow-auto">
            {`{
  "id": 5,
  "subject": "OTHER",
  "classroom_type": "group",
  "students": [
    {
      "id": 6,
      "username": "b2k4",
      "first_name": "beka",
      "last_name": "maks"
    }
  ],
  "tutor": {
    "id": 3,
    "username": "b2k4rys",
    "first_name": "Bekarys",
    "last_name": ""
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
