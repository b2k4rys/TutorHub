"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { StartChatButton } from "@/components/chat/StartChatButton"
import { api, storage } from "@/lib/api"

export default function TestChatSystem() {
  const [user, setUser] = useState(null)
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [testUserId, setTestUserId] = useState("1")
  const [testUserType, setTestUserType] = useState("tutor")

  useEffect(() => {
    const userData = storage.getUser()
    setUser(userData)
  }, [])

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(true)
    try {
      const result = await testFunction()
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: true, data: result },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: false, error: error.message },
      }))
    } finally {
      setLoading(false)
    }
  }

  const testWebSocketTicket = async () => {
    const token = storage.getAccessToken()
    if (!token) throw new Error("No access token")

    const response = await fetch("http://localhost:8000/api/ws-ticket/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  const testStartChat = async () => {
    const token = storage.getAccessToken()
    if (!token) throw new Error("No access token")

    return await api.chat.startChat(testUserType, Number.parseInt(testUserId), token)
  }

  const testMessageHistory = async () => {
    const token = storage.getAccessToken()
    if (!token) throw new Error("No access token")

    // Use a sample conversation ID - in real usage this would come from start chat
    const sampleConversationId = "test-conversation-id"
    return await api.chat.getMessageHistory(sampleConversationId, token)
  }

  const TestResult = ({ testName, result }) => {
    if (!result) return null

    return (
      <div
        className={`p-3 rounded-lg border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={result.success ? "text-green-600" : "text-red-600"}>{result.success ? "✅" : "❌"}</span>
          <span className="font-medium">{testName}</span>
        </div>
        {result.success ? (
          <pre className="text-xs text-green-700 bg-green-100 p-2 rounded overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        ) : (
          <p className="text-red-700 text-sm">{result.error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-black">
            TutorHub
          </Link>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">Chat System Test Suite</h1>
          <p className="text-gray-600">
            Test all components of the secure chat system following the three-step process.
          </p>
        </div>

        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>User Type:</strong> {user.user_type}
                </p>
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Token Available:</strong> {storage.getAccessToken() ? "Yes" : "No"}
                </p>
              </div>
            ) : (
              <p className="text-red-600">No user data available. Please sign in first.</p>
            )}
          </CardContent>
        </Card>

        {/* Test Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Test User ID</label>
                <Input
                  type="number"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  placeholder="Enter user ID to test chat with"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Test User Type</label>
                <select
                  value={testUserType}
                  onChange={(e) => setTestUserType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="tutor">Tutor</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Start Chat Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 1: Start Chat Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Test the "Start Chat" functionality that makes an authenticated GET request to create or find a
                conversation.
              </p>

              <div className="flex gap-4">
                <Button
                  onClick={() => runTest("Start Chat API", testStartChat)}
                  disabled={loading}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Test Start Chat API
                </Button>

                <StartChatButton
                  userType={testUserType}
                  userId={Number.parseInt(testUserId)}
                  userName={`Test ${testUserType}`}
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white"
                />
              </div>

              <TestResult testName="Start Chat API" result={testResults["Start Chat API"]} />
            </div>
          </CardContent>
        </Card>

        {/* Step 2: WebSocket Ticket Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 2: WebSocket Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">Test getting a WebSocket ticket for secure real-time connection.</p>

              <Button
                onClick={() => runTest("WebSocket Ticket", testWebSocketTicket)}
                disabled={loading}
                className="bg-black text-white hover:bg-gray-800"
              >
                Test WebSocket Ticket
              </Button>

              <TestResult testName="WebSocket Ticket" result={testResults["WebSocket Ticket"]} />
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Message History Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 3: Message History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">Test loading message history for a conversation.</p>

              <Button
                onClick={() => runTest("Message History", testMessageHistory)}
                disabled={loading}
                className="bg-black text-white hover:bg-gray-800"
              >
                Test Message History
              </Button>

              <TestResult testName="Message History" result={testResults["Message History"]} />
            </div>
          </CardContent>
        </Card>

        {/* Component Tests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Component Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">Test individual chat components and their integration.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/test-chat">
                  <Button
                    variant="outline"
                    className="w-full border-black text-black hover:bg-black hover:text-white bg-transparent"
                  >
                    Test Full Chat Room
                  </Button>
                </Link>

                <Link href="/chat/test-conversation-id">
                  <Button
                    variant="outline"
                    className="w-full border-black text-black hover:bg-black hover:text-white bg-transparent"
                  >
                    Test Chat Page
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints Reference */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Start Chat:</strong>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                  GET /api/chat/start/{testUserType}/{testUserId}/
                </code>
              </div>
              <div>
                <strong>WebSocket Ticket:</strong>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">POST /api/ws-ticket/</code>
              </div>
              <div>
                <strong>Message History:</strong>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                  GET /api/conversations/[conversationId]/messages/
                </code>
              </div>
              <div>
                <strong>WebSocket URL:</strong>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                  ws://localhost:8000/ws/chat/[conversationId]/?ticket=[ticket]
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
