"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { api, storage } from "../../lib/api"

export default function TestHomeworkCreate() {
  const [classroomId, setClassroomId] = useState("5")
  const [formData, setFormData] = useState({
    title: "Test Homework Assignment",
    description: "This is a test homework created via the new API endpoint",
    due_date: "2024-02-15T23:59",
    is_optional: false,
  })
  const [attachment, setAttachment] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    if (type === "file") {
      setAttachment(files[0])
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const testHomeworkCreate = async () => {
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
      const submissionData = { ...formData }
      if (attachment) {
        submissionData.attachment = attachment
      }

      const response = await api.homeworks.create(classroomId.trim(), submissionData, token)
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
      const formData = new FormData()
      formData.append("title", "Direct API Test Homework")
      formData.append("description", "Testing the new classroom-specific endpoint directly")
      formData.append("due_date", "2024-02-20T23:59")
      formData.append("is_optional", "false")

      const response = await fetch(`http://localhost:8000/api/homeworks/classroom/${classroomId}/assign/`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
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
        <h1 className="text-3xl font-bold text-black mb-8">Test Homework Creation API</h1>

        <div className="space-y-6">
          {/* Form */}
          <div className="border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test New Classroom-Specific Endpoint</h2>
            <p className="text-gray-600 mb-4">
              Endpoint:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">/api/homeworks/classroom/{classroomId}/assign/</code>
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Classroom ID</label>
                <input
                  type="text"
                  value={classroomId}
                  onChange={(e) => setClassroomId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter classroom ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_optional"
                  checked={formData.is_optional}
                  onChange={handleChange}
                  className="mr-2"
                />
                Mark as Optional
              </label>
            </div>

            <div className="flex gap-4">
              <Button onClick={testHomeworkCreate} disabled={loading} className="bg-black text-white hover:bg-gray-800">
                {loading ? "Creating..." : "Test via API Utility"}
              </Button>
              <Button onClick={testDirectFetch} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
                {loading ? "Testing..." : "Test Direct Fetch"}
              </Button>
            </div>
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
                <pre className="text-green-600 text-sm overflow-auto bg-green-100 p-3 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">New API Structure:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>
              • <strong>Endpoint:</strong> POST /api/homeworks/classroom/{classroomId}/assign/
            </li>
            <li>
              • <strong>Authentication:</strong> Bearer token required
            </li>
            <li>
              • <strong>Permission:</strong> Must be tutor of the specified classroom
            </li>
            <li>
              • <strong>Auto-assignment:</strong> Homework automatically assigned to the classroom
            </li>
            <li>
              • <strong>Context:</strong> Both tutor and classroom are set automatically
            </li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">Expected Response:</h3>
          <pre className="text-gray-600 text-xs overflow-auto">
            {`{
  "id": 1,
  "title": "Test Homework Assignment",
  "description": "This is a test homework...",
  "due_date": "2024-02-15T23:59:00Z",
  "attachment": null,
  "is_optional": false,
  "assigned_by": 3,
  "classroom": 5
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
