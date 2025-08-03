"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ChatRoom from "@/components/chat/ChatRoom"
import { storage } from "@/lib/api"

interface User {
  id: string | number
  username: string
  user_type: string
  first_name: string
  last_name: string
}

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const conversationId = params.conversationId as string

  useEffect(() => {
    const token = storage.getAccessToken()
    const userData = storage.getUser()

    console.log("=== CHAT PAGE DEBUG ===")
    console.log("Token exists:", !!token)
    console.log("User data from storage:", userData)

    if (!token) {
      router.push("/signin")
      return
    }

    if (!userData) {
      setError("User data not found. Please sign in again.")
      setLoading(false)
      return
    }

    // Ensure user has required fields
    const processedUser: User = {
      id: userData.id || userData.user_id || "",
      username: userData.username || "",
      user_type: userData.user_type || userData.role || "student",
      first_name: userData.first_name || "",
      last_name: userData.last_name || "",
    }

    console.log("Processed user data:", processedUser)

    if (!processedUser.id || !processedUser.username) {
      setError("Invalid user data. Please sign in again.")
      setLoading(false)
      return
    }

    setCurrentUser(processedUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error || !currentUser) {
    return (
      <div className="min-h-screen bg-white">
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
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-black mb-4">Chat Error</h1>
          <p className="text-gray-600 mb-8">{error || "Unable to load chat."}</p>
          <Link href="/signin">
            <Button className="bg-black text-white hover:bg-gray-800">Sign In Again</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-black">
            TutorHub
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Chat Header */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Chat Room</h1>
          <p className="text-gray-600">Real-time messaging with secure authentication</p>
        </div>

        {/* Chat Component */}
        <ChatRoom conversationId={conversationId} currentUser={currentUser} />

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <p className="text-sm text-gray-600 mb-2">Conversation ID: {conversationId}</p>
            <p className="text-sm text-gray-600 mb-2">
              User: {currentUser.username} (ID: {currentUser.id})
            </p>
            <p className="text-sm text-gray-600 mb-2">User Type: {currentUser.user_type}</p>
            <p className="text-sm text-gray-600 mb-2">Token Available: {!!storage.getAccessToken() ? "Yes" : "No"}</p>
          </div>
        )}
      </div>
    </div>
  )
}
