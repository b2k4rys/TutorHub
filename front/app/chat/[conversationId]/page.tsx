"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ChatRoom from "@/components/chat/ChatRoom"
import { Button } from "@/components/ui/button"
import { storage } from "@/lib/api"

interface ChatPageProps {
  params: {
    conversationId: string
  }
}

interface User {
  id: number
  username: string
  user_type: "student" | "tutor"
  first_name?: string
  last_name?: string
}

export default function ChatPage({ params }: ChatPageProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { conversationId } = params

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Check authentication
        const token = storage.getAccessToken()
        if (!token) {
          router.push("/signin")
          return
        }

        // Get user data
        const userData = storage.getUser()
        if (!userData) {
          // Try to fetch user data if not in storage
          try {
            const userResponse = await fetch("http://localhost:8000/api/auth/me/", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            if (userResponse.ok) {
              const fetchedUser = await userResponse.json()
              storage.setUser(fetchedUser)
              setUser(fetchedUser)
            } else {
              throw new Error("Failed to fetch user data")
            }
          } catch (fetchError) {
            console.error("Failed to fetch user:", fetchError)
            router.push("/signin")
            return
          }
        } else {
          setUser(userData)
        }

        // Validate conversation ID format (should be UUID-like)
        if (!conversationId || conversationId.length < 10) {
          setError("Invalid conversation ID")
          return
        }

        console.log("Chat page initialized for conversation:", conversationId)
      } catch (error) {
        console.error("Failed to initialize chat page:", error)
        setError("Failed to initialize chat")
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [router, conversationId])

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

  if (error) {
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
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-black mb-4">Chat Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link href="/dashboard">
            <Button className="bg-black text-white hover:bg-gray-800">Back to Dashboard</Button>
          </Link>
        </main>
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
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                ← Back to Dashboard
              </Button>
            </Link>
            <div className="text-sm text-gray-600">
              {user?.first_name || user?.username || "User"}
              <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">{user?.user_type || "user"}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black mb-2">Chat Room</h1>
          <p className="text-gray-600">Real-time messaging with secure authentication</p>
        </div>

        <ChatRoom conversationId={conversationId} currentUser={user} />

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Debug Info (Development Only):</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Conversation ID: {conversationId}</p>
              <p>
                User: {user?.username} (ID: {user?.id})
              </p>
              <p>User Type: {user?.user_type}</p>
              <p>Token Available: {storage.getAccessToken() ? "Yes" : "No"}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
