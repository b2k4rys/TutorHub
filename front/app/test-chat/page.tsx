"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StartChatButton from "@/components/chat/StartChatButton"
import ChatRoom from "@/components/chat/ChatRoom"
import { api, storage } from "@/lib/api"

export default function TestChatPage() {
  const [ticketResult, setTicketResult] = useState(null)
  const [chatResult, setChatResult] = useState(null)
  const [historyResult, setHistoryResult] = useState(null)
  const [loading, setLoading] = useState({})
  const [testUserId, setTestUserId] = useState("1")
  const [testUserType, setTestUserType] = useState("student")
  const [testConversationId, setTestConversationId] = useState("")

  const setLoadingState = (key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }))
  }

  const testWebSocketTicket = async () => {
    try {
      setLoadingState("ticket", true)
      const token = storage.getAccessToken()

      if (!token) {
        throw new Error("No access token found. Please login first.")
      }

      const result = await api.chat.getWebSocketTicket(token)
      setTicketResult({ success: true, data: result })
    } catch (error) {
      setTicketResult({ success: false, error: error.message })
    } finally {
      setLoadingState("ticket", false)
    }
  }

  const testStartChat = async () => {
    try {
      setLoadingState("chat", true)
      const token = storage.getAccessToken()

      if (!token) {
        throw new Error("No access token found. Please login first.")
      }

      const result = await api.chat.startChat(testUserType, Number.parseInt(testUserId), token)
      setChatResult({ success: true, data: result })
    } catch (error) {
      setChatResult({ success: false, error: error.message })
    } finally {
      setLoadingState("chat", false)
    }
  }

  const testMessageHistory = async () => {
    try {
      setLoadingState("history", true)
      const token = storage.getAccessToken()

      if (!token) {
        throw new Error("No access token found. Please login first.")
      }

      if (!testConversationId) {
        throw new Error("Please enter a conversation ID")
      }

      const result = await api.chat.getMessageHistory(testConversationId, token)
      setHistoryResult({ success: true, data: result })
    } catch (error) {
      setHistoryResult({ success: false, error: error.message })
    } finally {
      setLoadingState("history", false)
    }
  }

  const ResultDisplay = ({ result, title }) => {
    if (!result) return null

    return (
      <div
        className={`mt-4 p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
      >
        <h4 className={`font-semibold ${result.success ? "text-green-800" : "text-red-800"}`}>
          {title} {result.success ? "Success" : "Error"}
        </h4>
        <pre className={`mt-2 text-sm ${result.success ? "text-green-700" : "text-red-700"} overflow-auto`}>
          {JSON.stringify(result.success ? result.data : result.error, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-black">
            TutorHub - Chat Testing
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
        <div className="grid lg:grid-cols-2 gap-8">
          {/* API Tests */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. WebSocket Ticket Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Test getting a WebSocket authentication ticket</p>
                <Button
                  onClick={testWebSocketTicket}
                  disabled={loading.ticket}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {loading.ticket ? "Testing..." : "Test WebSocket Ticket"}
                </Button>
                <ResultDisplay result={ticketResult} title="WebSocket Ticket" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Start Chat Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Test starting a chat with another user</p>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Type:</label>
                    <select
                      value={testUserType}
                      onChange={(e) => setTestUserType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID:</label>
                    <Input
                      value={testUserId}
                      onChange={(e) => setTestUserId(e.target.value)}
                      placeholder="Enter user ID"
                    />
                  </div>
                </div>
                <Button
                  onClick={testStartChat}
                  disabled={loading.chat}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {loading.chat ? "Testing..." : "Test Start Chat"}
                </Button>
                <ResultDisplay result={chatResult} title="Start Chat" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Message History Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Test loading message history for a conversation</p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conversation ID:</label>
                  <Input
                    value={testConversationId}
                    onChange={(e) => setTestConversationId(e.target.value)}
                    placeholder="Enter conversation UUID"
                  />
                </div>
                <Button
                  onClick={testMessageHistory}
                  disabled={loading.history}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {loading.history ? "Testing..." : "Test Message History"}
                </Button>
                <ResultDisplay result={historyResult} title="Message History" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. StartChatButton Component Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Test the StartChatButton component</p>
                <div className="space-y-3">
                  <StartChatButton userType="student" userId={1} userName="Test Student" />
                  <StartChatButton userType="tutor" userId={1} userName="Test Tutor" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Chat Test */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>5. Live Chat Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Test the ChatRoom component with a sample conversation</p>
                {testConversationId ? (
                  <ChatRoom conversationId={testConversationId} currentUser={storage.getUser()?.username} />
                ) : (
                  <div className="text-center py-8 text-gray-500">Enter a conversation ID above to test live chat</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <strong>1. WebSocket Ticket:</strong> This should return a ticket UUID that can be used for WebSocket
                authentication.
              </div>
              <div>
                <strong>2. Start Chat:</strong> This should return a chat URL with a conversation ID. Use this ID for
                testing message history and live chat.
              </div>
              <div>
                <strong>3. Message History:</strong> Enter a valid conversation ID to load previous messages.
              </div>
              <div>
                <strong>4. StartChatButton:</strong> These buttons should navigate to a chat room when clicked.
              </div>
              <div>
                <strong>5. Live Chat:</strong> Enter a conversation ID to test real-time messaging.
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
