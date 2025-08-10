"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { api, storage } from "../../lib/api"

export default function TestHomeworkSubmissions() {
  const [classroomId, setClassroomId] = useState("5")
  const [homeworkId, setHomeworkId] = useState("1")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const testGetSubmissions = async () => {
    if (!classroomId.trim() || !homeworkId.trim()) {
      setError("Please enter both classroom ID and homework ID")
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
      const response = await api.homeworks.getSubmissions(classroomId.trim(), homeworkId.trim(), token)
      setResult(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testDirectFetch = async () => {
    setLoading(true)
    const token = storage.getAccessToken()

    try {
      const response = await fetch(`http://localhost:8000/api/classroom/${classroomId}/homework/${homeworkId}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text()
        setResult({
          error: "Received HTML instead of JSON",
          status: response.status,
          htmlPreview: htmlText.substring(0, 500),
        })
      } else {
        const result = await response.json()
        setResult({
          success: response.ok,
          status: response.status,
          data: result,
        })
      }
    } catch (error) {
      setResult({
        error: error.message,
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Test Homework Submissions API</h1>

        <div className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              Test GET /api/classroom/{"{classroom_id}"}/homework/{"{homework_id}"}/
            </h2>
            <p className="text-gray-600 mb-4">
              This endpoint allows tutors to view all submissions for a specific homework assignment.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Classroom ID</label>
                <input
                  type="text"
                  value={classroomId}
                  onChange={(e) => setClassroomId(e.target.value)}
                  placeholder="Enter classroom ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Homework ID</label>
                <input
                  type="text"
                  value={homeworkId}
                  onChange={(e) => setHomeworkId(e.target.value)}
                  placeholder="Enter homework ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={testGetSubmissions} disabled={loading} className="bg-black text-white hover:bg-gray-800">
                {loading ? "Loading..." : "Test via API Utility"}
              </Button>
              <Button onClick={testDirectFetch} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
                {loading ? "Testing..." : "Test Direct Fetch"}
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
              <h3 className="font-bold text-green-800 mb-2">Result:</h3>
              {result.error ? (
                <div className="bg-red-100 p-3 rounded">
                  <p className="text-red-800 font-medium">Error: {result.error}</p>
                  {result.status && <p className="text-red-600">Status: {result.status}</p>}
                  {result.htmlPreview && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-600">HTML Preview</summary>
                      <pre className="text-xs text-red-500 mt-2 overflow-auto bg-red-50 p-2 rounded">
                        {result.htmlPreview}
                      </pre>
                    </details>
                  )}
                </div>
              ) : (
                <div>
                  {result.success && <p className="text-green-800 font-medium">✅ SUCCESS! Status: {result.status}</p>}
                  <div className="mt-2">
                    <h4 className="font-medium mb-2">Submissions Found:</h4>
                    {Array.isArray(result.data || result) ? (
                      <div className="space-y-2">
                        {(result.data || result).map((submission, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <p>
                              <strong>Student:</strong> {submission.student_name || `ID: ${submission.student}`}
                            </p>
                            <p>
                              <strong>Submitted:</strong> {submission.submitted_at || submission.created_at || "N/A"}
                            </p>
                            <p>
                              <strong>Status:</strong> {submission.status || "Submitted"}
                            </p>
                            {submission.file && (
                              <p>
                                <strong>File:</strong> {submission.file.split("/").pop()}
                              </p>
                            )}
                          </div>
                        ))}
                        {(result.data || result).length === 0 && (
                          <p className="text-gray-600 italic">No submissions found for this homework.</p>
                        )}
                      </div>
                    ) : (
                      <pre className="text-green-600 text-sm overflow-auto bg-green-100 p-3 rounded">
                        {JSON.stringify(result.data || result, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">API Endpoint Details:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>
              • <strong>Method:</strong> GET
            </li>
            <li>
              • <strong>URL:</strong> /api/classroom/{"{classroom_id}"}/homework/{"{homework_id}"}/
            </li>
            <li>
              • <strong>Authentication:</strong> Bearer token required
            </li>
            <li>
              • <strong>Permission:</strong> Must be tutor of the specified classroom
            </li>
            <li>
              • <strong>Response:</strong> Array of homework submissions with student details
            </li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">Expected Response Format:</h3>
          <pre className="text-gray-600 text-xs overflow-auto">
            {`[
  {
    "id": 1,
    "student": 6,
    "student_name": "John Doe",
    "homework": 1,
    "submitted_at": "2024-08-10T14:30:00Z",
    "file": "/media/submissions/homework_1_student_6.pdf",
    "text_submission": "My solution to the quadratic equations...",
    "status": "submitted",
    "grade": null,
    "feedback": null
  }
]`}
          </pre>
        </div>
      </div>
    </div>
  )
}
