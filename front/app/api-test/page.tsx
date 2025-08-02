"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ApiTest() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  const testLoginWithFormData = async () => {
    setLoading(true)
    try {
      // Test with form-data (like Postman)
      const formData = new FormData()
      formData.append("username", "b2k4rys")
      formData.append("password", "05Beka05")

      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        body: formData, // No Content-Type header - let browser set it
      })

      const result = await response.json()

      setResults((prev) => ({
        ...prev,
        "form-data-test": {
          status: response.status,
          statusText: response.statusText,
          data: result,
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        "form-data-test": {
          error: error.message,
        },
      }))
    }
    setLoading(false)
  }

  const testLoginWithJSON = async () => {
    setLoading(true)
    try {
      // Test with JSON
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "b2k4rys",
          password: "05Beka05",
        }),
      })

      const result = await response.json()

      setResults((prev) => ({
        ...prev,
        "json-test": {
          status: response.status,
          statusText: response.statusText,
          data: result,
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        "json-test": {
          error: error.message,
        },
      }))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">API Format Test</h1>

        <div className="space-y-4 mb-8">
          <Button
            onClick={testLoginWithFormData}
            disabled={loading}
            className="bg-green-600 text-white hover:bg-green-700 mr-4"
          >
            Test Login with Form-Data (Should Work)
          </Button>

          <Button
            onClick={testLoginWithJSON}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-700 mr-4"
          >
            Test Login with JSON (Might Fail)
          </Button>
        </div>

        <div className="space-y-6">
          {Object.entries(results).map(([testName, result]) => (
            <div key={testName} className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2 capitalize">{testName.replace("-", " ")}</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">What This Test Shows:</h3>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>Form-Data test should return JWT tokens (access & refresh)</li>
            <li>JSON test might fail or return an error</li>
            <li>This confirms your Django API expects form-data, not JSON</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
