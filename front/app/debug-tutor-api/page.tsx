"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { storage } from "../../lib/api"

export default function DebugTutorAPI() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  const testDirectFetch = async () => {
    setLoading(true)
    const token = storage.getAccessToken()

    try {
      console.log("Testing direct fetch to tutor details...")
      console.log("Token:", token ? "Present" : "Missing")

      const response = await fetch("http://localhost:8000/api/tutors/details/3/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      const contentType = response.headers.get("content-type")
      console.log("Content-Type:", contentType)

      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text()
        setResults((prev) => ({
          ...prev,
          directFetch: {
            error: "Received HTML instead of JSON",
            status: response.status,
            contentType,
            htmlPreview: htmlText.substring(0, 500),
          },
        }))
      } else {
        const result = await response.json()
        setResults((prev) => ({
          ...prev,
          directFetch: {
            success: true,
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
          stack: error.stack,
        },
      }))
    }
    setLoading(false)
  }

  const testWithoutAuth = async () => {
    setLoading(true)

    try {
      console.log("Testing without authentication...")

      const response = await fetch("http://localhost:8000/api/tutors/details/3/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)

      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text()
        setResults((prev) => ({
          ...prev,
          noAuth: {
            error: "Received HTML instead of JSON",
            status: response.status,
            contentType,
            htmlPreview: htmlText.substring(0, 500),
          },
        }))
      } else {
        const result = await response.json()
        setResults((prev) => ({
          ...prev,
          noAuth: {
            success: true,
            status: response.status,
            data: result,
          },
        }))
      }
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        noAuth: {
          error: error.message,
        },
      }))
    }
    setLoading(false)
  }

  const testCORS = async () => {
    setLoading(true)

    try {
      console.log("Testing CORS preflight...")

      const response = await fetch("http://localhost:8000/api/tutors/details/3/", {
        method: "OPTIONS",
      })

      console.log("OPTIONS Response status:", response.status)
      console.log("CORS headers:", {
        "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
        "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
        "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
      })

      setResults((prev) => ({
        ...prev,
        cors: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        cors: {
          error: error.message,
        },
      }))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Debug Tutor API Issues</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button onClick={testDirectFetch} disabled={loading} className="bg-black text-white hover:bg-gray-800">
            Test with Auth Token
          </Button>

          <Button onClick={testWithoutAuth} disabled={loading} className="bg-red-600 text-white hover:bg-red-700">
            Test without Auth
          </Button>

          <Button onClick={testCORS} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
            Test CORS
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
                  {result.contentType && <p className="text-red-600">Content-Type: {result.contentType}</p>}
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
                  <p className="text-green-800 font-medium">Success! Status: {result.status}</p>
                  <pre className="text-xs text-green-600 mt-2 overflow-auto bg-green-100 p-2 rounded">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-800 font-medium">Status: {result.status}</p>
                  <pre className="text-xs text-blue-600 mt-2 overflow-auto bg-blue-100 p-2 rounded">
                    {JSON.stringify(result.headers || result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">Common Issues & Solutions:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>
              <strong>HTML instead of JSON:</strong> Usually means CORS issue or Django serving error page
            </li>
            <li>
              <strong>401 Unauthorized:</strong> Token missing or expired
            </li>
            <li>
              <strong>403 Forbidden:</strong> Token valid but no permission
            </li>
            <li>
              <strong>404 Not Found:</strong> Endpoint doesn't exist or tutor ID invalid
            </li>
            <li>
              <strong>CORS Error:</strong> Add your frontend URL to Django CORS_ALLOWED_ORIGINS
            </li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">Current Token Info:</h3>
          <p className="text-sm text-gray-600">Token present: {storage.getAccessToken() ? "✅ Yes" : "❌ No"}</p>
          {storage.getAccessToken() && (
            <p className="text-xs text-gray-500 mt-1 break-all">
              Token: {storage.getAccessToken().substring(0, 50)}...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
