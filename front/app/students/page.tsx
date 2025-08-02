"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { api, storage } from "@/lib/api"
import { StartChatButton } from "@/components/chat/StartChatButton"
import { ChatRoom } from "@/components/chat/ChatRoom"

export default function TestChatPage() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})
  const [testConversationId, setTestConversationId] = useState("")

  const runTest = async (testName, testFunction) => {
    setLoading((prev) => ({ ...prev, [testName]: true }))
    try {
      const result = await testFunction()
      setResults((prev) => ({ ...prev, [testName]: { success: true, data: result } }))
    } catch (error) {
      setResults((prev) => ({ ...prev, [testName]: { success: false, error: error.message } }))
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }))
    }
  }

  const testWebSocketTicket = async () => {
    const token = storage.getAccessToken()
    if (!token) throw new Error("No access token found")

    const response = await api.chat.getTicket(token)
    return response
  }

  const testStartChat = async () => {
    const token = storage.getAccessToken()
    if (!token) throw new Error("No access token found")

    // Test with a sample student ID (you might need to adjust this)
    const response = await api.chat.startChat("student", 1, token)

    // Extract conversation ID for testing
    const chatUrl = response.chat_url
    const conversationId = chatUrl.split("/").slice(-2, -1)[0]
    setTestConversationId(conversationId)

    return response
  }

  const testMessageHistory = async () => {
    if (!testConversationId) throw new Error("No conversation ID available. Run start chat test first.")

    const token = storage.getAccessToken()
    if (!token) throw new Error("No access token found")

    const response = await api.chat.getMessageHistory(testConversationId, token)
    return response
  }

  const ResultDisplay = ({ testName }) => {
    const result = results[testName]
    const isLoading = loading[testName]

    if (isLoading) {
      return <div className="text-blue-600">Running test...</div>
    }

    if (!result) {
      return <div className="text-gray-500">Not tested yet</div>
    }

    if (result.success) {
      return (
        <div className="text-green-600">
          <div className="font-medium">✅ Success</div>
          <pre className="text-xs mt-2 bg-green-50 p-2 rounded overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )
    } else {
      return (
        <div className="text-red-600">
          <div className="font-medium">❌ Failed</div>
          <div className="text-sm mt-1">{result.error}</div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Chat System Test</h1>
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            variant="outline"
            className="border-black text-black hover:bg-black hover:text-white bg-transparent"
          >
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* API Tests */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-black">API Tests</h2>

            {/* WebSocket Ticket Test */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">WebSocket Ticket</h3>
                <Button onClick={() => runTest("ticket", testWebSocketTicket)} disabled={loading.ticket} size="sm">
                  Test
                </Button>
              </div>
              <ResultDisplay testName="ticket" />
            </div>

            {/* Start Chat Test */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Start Chat</h3>
                <Button onClick={() => runTest("startChat", testStartChat)} disabled={loading.startChat} size="sm">
                  Test
                </Button>
              </div>
              <ResultDisplay testName="startChat" />
            </div>

            {/* Message History Test */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Message History</h3>
                <Button
                  onClick={() => runTest("messageHistory", testMessageHistory)}
                  disabled={loading.messageHistory || !testConversationId}
                  size="sm"
                >
                  Test
                </Button>
              </div>
              <ResultDisplay testName="messageHistory" />
            </div>
          </div>

          {/* Component Tests */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-black">Component Tests</h2>

            {/* StartChatButton Test */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-4">StartChatButton Component</h3>
              <div className="space-y-2">
                <StartChatButton userType="student" userId={1} userName="Test Student" variant="default" />
                <StartChatButton userType="tutor" userId={1} userName="Test Tutor" variant="outline" />
              </div>
            </div>

            {/* ChatRoom Test */}
            {testConversationId && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-4">ChatRoom Component</h3>
                <div className="h-64">
                  <ChatRoom conversationId={testConversationId} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
            <li>Make sure you're logged in (have a valid JWT token)</li>
            <li>Test the WebSocket ticket generation first</li>
            <li>Test starting a chat (this will create or find a conversation)</li>
            <li>Test message history loading</li>
            <li>Try the StartChatButton components</li>
            <li>If a conversation ID is available, test the ChatRoom component</li>
          </ol>
        </div>
      </main>
    </div>
  )
}
