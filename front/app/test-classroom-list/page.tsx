"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { api, storage } from "../../lib/api"

export default function TestClassroomList() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const testClassroomList = async () => {
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
      const response = await api.classroom.list(token)
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
        <h1 className="text-3xl font-bold text-black mb-8">Test Classroom List API</h1>

        <div className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test GET /api/classroom/all/</h2>
            <p className="text-gray-600 mb-4">This will test fetching all classrooms for the current tutor.</p>
            <Button onClick={testClassroomList} disabled={loading} className="bg-black text-white hover:bg-gray-800">
              {loading ? "Loading..." : "Fetch Classrooms"}
            </Button>
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
              <h3 className="font-bold text-green-800 mb-2">Success - Classrooms Found:</h3>
              <div className="space-y-4">
                {Array.isArray(result) ? (
                  result.length > 0 ? (
                    result.map((classroom, index) => (
                      <div key={index} className="bg-white p-4 rounded border">
                        <h4 className="font-bold">Classroom #{classroom.id}</h4>
                        <p>
                          <strong>Subject:</strong> {classroom.subject}
                        </p>
                        <p>
                          <strong>Type:</strong> {classroom.classroom_type}
                        </p>
                        <p>
                          <strong>Students:</strong> {classroom.students?.length || 0}
                        </p>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-gray-600">View Raw Data</summary>
                          <pre className="text-xs text-gray-500 mt-2 overflow-auto">
                            {JSON.stringify(classroom, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No classrooms found.</p>
                  )
                ) : (
                  <pre className="text-green-600 text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">Expected API Response:</h3>
          <p className="text-blue-700 text-sm mb-2">
            The API should return an array of classroom objects with the following structure:
          </p>
          <pre className="text-blue-600 text-xs overflow-auto">
            {`[
  {
    "id": 1,
    "subject": "ENGLISH",
    "classroom_type": "group",
    "tutor": 1,
    "students": [
      {
        "id": 1,
        "user": {
          "username": "timur_kz",
          "first_name": "Timur",
          "last_name": "K"
        }
      }
    ]
  }
]`}
          </pre>
        </div>
      </div>
    </div>
  )
}
