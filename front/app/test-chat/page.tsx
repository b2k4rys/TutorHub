"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api, storage } from "@/lib/api.js"
import { StartChatButton } from "@/components/chat/StartChatButton"

export default function TestChatPage() {
  const [wsTicket, setWsTicket] = useState("")
  const [chatUrl, setChatUrl] = useState("")
  const [testUserId, setTestUserId] = useState("1")
  const [testUserType, setTestUserType] = useState<"tutor" | "student">("student")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = storage.getUser()
    setUser(currentUser)
  }, [])

  const testWebSocketTicket = async () => {
    try {
      setIsLoading(true)
      setError("")
      const token = storage.getAccessToken()

      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await api.chat.getWebSocketTicket(token)
      setWsTicket(response.ticket)
      console.log("WebSocket ticket:", response)
    } catch (error) {
      setError(`Failed to get WebSocket ticket: ${error.message}`)
      console.error("WebSocket ticket error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testStartChat = async () => {
    try {
      setIsLoading(true)
      setError("")
      const token = storage.getAccessToken()

      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await api.chat.startChat(testUserType, Number.parseInt(testUserId), token)
      setChatUrl(response.chat_url)
      console.log("Start chat response:", response)
    } catch (error) {
      setError(`Failed to start chat: ${error.message}`)
      console.error("Start chat error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Chat System Test</h1>

        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div>
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>User Type:</strong> {user.user_type}
                </p>
              </div>
            ) : (
              <p className="text-red-600">No user logged in</p>
            )}
          </CardContent>
        </Card>

        {/* WebSocket Ticket Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>WebSocket Ticket Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testWebSocketTicket} disabled={isLoading}>
              Get WebSocket Ticket
            </Button>
            {wsTicket && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm">
                  <strong>Ticket:</strong> {wsTicket}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Start Chat Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Start Chat Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">User Type:</label>
                <select
                  value={testUserType}
                  onChange={(e) => setTestUserType(e.target.value as "tutor" | "student")}
                  className="border rounded px-3 py-2"
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">User ID:</label>
                <Input
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  placeholder="Enter user ID"
                  className="w-32"
                />
              </div>
            </div>
            <Button onClick={testStartChat} disabled={isLoading}>
              Start Chat
            </Button>
            {chatUrl && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm">
                  <strong>Chat URL:</strong> {chatUrl}
                </p>
                <Button
                  onClick={() => {
                    const conversationId = chatUrl.split("/").slice(-2, -1)[0]
                    window.open(`/chat/${conversationId}?user=Test User`, "_blank")
                  }}
                  className="mt-2"
                  size="sm"
                >
                  Open Chat
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Start Chat Button Component Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Start Chat Button Component Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <StartChatButton userType="student" userId={1} userName="Test Student" variant="default" />
              <StartChatButton userType="tutor" userId={1} userName="Test Tutor" variant="outline" />
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
