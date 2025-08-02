"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { api, storage } from "../../lib/api"

export default function TestClassroomCreate() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "MATH",
    classroom_type: "group",
    student_usernames: ["b2k4"],
  })

  const testWithFormData = async () => {
    setLoading(true)
    const token = storage.getAccessToken()

    try {
      console.log("Testing classroom creation with form-data...")

      const formDataObj = new FormData()
      formDataObj.append("subject", formData.subject)
      formDataObj.append("classroom_type", formData.classroom_type)

      // Add each student username separately
      formData.student_usernames.forEach((username) => {
        formDataObj.append("student_usernames", username)
      })

      console.log("FormData entries:", [...formDataObj.entries()])

      const response = await fetch("http://localhost:8000/api/classroom/register/", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formDataObj,
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text()
        setResults((prev) => ({
          ...prev,
          formData: {
            error: "Received HTML instead of JSON",
            status: response.status,
            htmlPreview: htmlText.substring(0, 500),
          },
        }))
      } else {
        const result = await response.json()
        setResults((prev) => ({
          ...prev,
          formData: {
            success: response.ok,
            status: response.status,
            data: result,
          },
        }))
      }
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        formData: {
          error: error.message,
        },
      }))
    }
    setLoading(false)
  }

  const testWithJSON = async () => {
    setLoading(true)
    const token = storage.getAccessToken()

    try {
      console.log("Testing classroom creation with JSON...")

      const response = await fetch("http://localhost:8000/api/classroom/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(formData),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text()
        setResults((prev) => ({
          ...prev,
          json: {
            error: "Received HTML instead of JSON",
            status: response.status,
            htmlPreview: htmlText.substring(0, 500),
          },
        }))
      } else {
        const result = await response.json()
        setResults((prev) => ({
          ...prev,
          json: {
            success: response.ok,
            status: response.status,
            data: result,
          },
        }))
      }
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        json: {
          error: error.message,
        },
      }))
    }
    setLoading(false)
  }

  const testViaAPI = async () => {
    setLoading(true)
    const token = storage.getAccessToken()

    try {
      console.log("Testing via API utility...")
      const result = await api.classroom.create(formData, token)
      setResults((prev) => ({
        ...prev,
        apiUtil: {
          success: true,
          data: result,
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        apiUtil: {
          error: error.message,
        },
      }))
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "student_usernames") {
      setFormData((prev) => ({
        ...prev,
        [name]: value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Debug Classroom Creation</h1>

        {/* Form Data Editor */}
        <div className="border border-gray-300 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Test Data</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="MATH">Mathematics</option>
                <option value="ENGLISH">English</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Classroom Type</label>
              <select
                name="classroom_type"
                value={formData.classroom_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="individual">Individual</option>
                <option value="group">Group</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Student Usernames (comma-separated)</label>
              <input
                type="text"
                name="student_usernames"
                value={formData.student_usernames.join(", ")}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="username1, username2"
              />
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button onClick={testWithFormData} disabled={loading} className="bg-black text-white hover:bg-gray-800">
            Test with FormData
          </Button>
          <Button onClick={testWithJSON} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
            Test with JSON
          </Button>
          <Button onClick={testViaAPI} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
            Test via API Utility
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {Object.entries(results).map(([testName, result]) => (
            <div key={testName} className="border border-gray-300 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 capitalize">{testName.replace(/([A-Z])/g, " $1")}</h3>

              {result.error ? (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-800 font-medium">Error: {result.error}</p>
                  {result.status && <p className="text-red-600">Status: {result.status}</p>}
                  {result.htmlPreview && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-600">HTML Preview</summary>
                      <pre className="text-xs text-red-500 mt-2 overflow-auto bg-red-100 p-2 rounded max-h-40">
                        {result.htmlPreview}
                      </pre>
                    </details>
                  )}
                </div>
              ) : result.success ? (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-green-800 font-medium">✅ SUCCESS! Status: {result.status}</p>
                  <pre className="text-xs text-green-600 mt-2 overflow-auto bg-green-100 p-2 rounded max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-yellow-800 font-medium">Status: {result.status}</p>
                  <pre className="text-xs text-yellow-600 mt-2 overflow-auto bg-yellow-100 p-2 rounded max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">Debugging Steps:</h3>
          <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
            <li>Check if Django expects FormData or JSON for classroom creation</li>
            <li>Verify the field names match your Django serializer</li>
            <li>Ensure the student usernames exist and are valid</li>
            <li>Check Django server logs for detailed error messages</li>
            <li>Verify your JWT token is valid and you're registered as a tutor</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">Current Test Data:</h3>
          <pre className="text-gray-600 text-xs overflow-auto">{JSON.stringify(formData, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
