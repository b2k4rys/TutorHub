"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api, storage } from "../../lib/api"

export default function Messages() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = storage.getAccessToken()
    const userData = storage.getUser()

    if (!token) {
      router.push("/signin")
      return
    }

    setUser(userData)
    loadChats(token)
  }, [router])

  const loadChats = async (token) => {
    try {
      setLoading(true)
      const chatsData = await api.chat.getAllChats(token)
      console.log("All chats data:", chatsData)
      setChats(Array.isArray(chatsData) ? chatsData : [])
    } catch (error) {
      console.error("Failed to load chats:", error)
      setError("Failed to load messages: " + error.message)
      setChats([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return ""
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
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
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Messages Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Messages</h1>
          <p className="text-xl text-gray-600">Your conversations with tutors and students</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {chats.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-black mb-4">No Messages Yet</h2>
            <p className="text-gray-600 mb-8">
              You haven't started any conversations yet. Connect with tutors and students to begin messaging.
            </p>
            <Link href="/dashboard">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">Back to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  // Navigate to chat room - you'll need to implement this route
                  router.push(`/chat/${chat.id}`)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">
                        {chat.other_participant?.user?.first_name?.[0] ||
                          chat.other_participant?.user?.username?.[0] ||
                          "?"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        {chat.other_participant?.user?.first_name && chat.other_participant?.user?.last_name
                          ? `${chat.other_participant.user.first_name} ${chat.other_participant.user.last_name}`
                          : chat.other_participant?.user?.username || "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-600">@{chat.other_participant?.user?.username || "unknown"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatDate(chat.updated_at || chat.created_at)}</p>
                    {chat.unread_count > 0 && (
                      <span className="inline-block bg-black text-white text-xs px-2 py-1 rounded-full mt-1">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </div>

                {chat.last_message && (
                  <div className="mt-3 pl-16">
                    <p className="text-gray-600 text-sm line-clamp-2">{chat.last_message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && chats.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <p className="text-sm text-gray-600 mb-2">Total Chats: {chats.length}</p>
            <pre className="text-xs text-gray-600 overflow-auto">{JSON.stringify(chats[0], null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
