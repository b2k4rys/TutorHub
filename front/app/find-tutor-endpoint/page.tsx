"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { storage } from "../../lib/api"

export default function FindTutorEndpoint() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  const testEndpoints = [
    "/api/tutors/details/3/",
    "/api/tutors/3/details/",
    "/api/tutor/details/3/",
    "/api/tutor/3/details/",
    "/tutors/details/3/",
    "/tutor/details/3/",
    "/api/tutors/3/",
    "/api/tutor/3/",
  ]

  const testAllEndpoints = async () => {
    setLoading(true)
    const token = storage.getAccessToken()
    const newResults = {}

    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`)

        const response = await fetch(`http://localhost:8000${endpoint}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        const contentType = response.headers.get("content-type")

        if (contentType && contentType.includes("application/json")) {
          const result = await response.json()
          newResults[endpoint] = {
            status: response.status,
            success: response.ok,
            contentType,
            data: result,
          }
        } else {
          newResults[endpoint] = {
            status: response.status,
            success: false,
            contentType,
            error: "HTML response (likely 404 or error page)",
          }
        }
      } catch (error) {
        newResults[endpoint] = {
          error: error.message,
          success: false,
        }
      }
    }

    setResults(newResults)
    setLoading(false)
  }

  const testDjangoRoot = async () => {
    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/", {
        method: "GET",
      })

      const text = await response.text()

      setResults((prev) => ({
        ...prev,
        djangoRoot: {
          status: response.status,
          contentType: response.headers.get("content-type"),
          preview: text.substring(0, 500),
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        djangoRoot: {
          error: error.message,
        },
      }))
    }

    setLoading(false)
  }

  const testApiRoot = async () => {
    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/", {
        method: "GET",
      })

      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        const result = await response.json()
        setResults((prev) => ({
          ...prev,
          apiRoot: {
            status: response.status,
            success: true,
            data: result,
          },
        }))
      } else {
        const text = await response.text()
        setResults((prev) => ({
          ...prev,
          apiRoot: {
            status: response.status,
            contentType,
            preview: text.substring(0, 500),
          },
        }))
      }
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        apiRoot: {
          error: error.message,
        },
      }))
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Find Correct Tutor Endpoint</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button onClick={testAllEndpoints} disabled={loading} className="bg-black text-white hover:bg-gray-800">
            {loading ? "Testing..." : "Test All Endpoints"}
          </Button>

          <Button onClick={testDjangoRoot} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
            Test Django Root
          </Button>

          <Button onClick={testApiRoot} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
            Test API Root
          </Button>
        </div>

        <div className="space-y-6">
          {Object.entries(results).map(([endpoint, result]) => (
            <div key={endpoint} className="border border-gray-300 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">{endpoint}</h3>

              {result.error ? (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-800 font-medium">Error: {result.error}</p>
                </div>
              ) : result.success ? (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-green-800 font-medium">✅ SUCCESS! Status: {result.status}</p>
                  <p className="text-green-600 text-sm">Content-Type: {result.contentType}</p>
                  <pre className="text-xs text-green-600 mt-2 overflow-auto bg-green-100 p-2 rounded max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-yellow-800 font-medium">Status: {result.status}</p>
                  <p className="text-yellow-600 text-sm">Content-Type: {result.contentType}</p>
                  {result.preview && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-yellow-600">Response Preview</summary>
                      <pre className="text-xs text-yellow-500 mt-2 overflow-auto bg-yellow-100 p-2 rounded max-h-40">
                        {result.preview}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">What to check:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>1. Is your Django server running on localhost:8000?</li>
            <li>2. Did you add the tutor details URL to your Django urls.py?</li>
            <li>3. Is the URL pattern exactly: `path('details/&lt;int:tutor_id&gt;', TutorDetailView.as_view())`?</li>
            <li>4. Are you testing the same Django instance that Postman worked with?</li>
            <li>5. Check Django server logs for any errors</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">Expected Working Endpoint:</h3>
          <p className="text-gray-600 text-sm">
            Based on your Django code, it should be:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">/api/tutors/details/3/</code>
          </p>
          <p className="text-gray-600 text-sm mt-2">
            If none work, check your Django <code>urls.py</code> files to see the actual URL patterns.
          </p>
        </div>
      </div>
    </div>
  )
}
