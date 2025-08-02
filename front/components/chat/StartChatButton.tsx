"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { api, storage } from "@/lib/api"

interface StartChatButtonProps {
  userType: "student" | "tutor"
  userId: number
  userName?: string
  className?: string
  variant?: "default" | "outline"
  size?: "sm" | "default" | "lg"
  disabled?: boolean
}

export function StartChatButton({
  userType,
  userId,
  userName,
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
}: StartChatButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleStartChat = async () => {
    try {
      setLoading(true)
      setError("")

      // Step 1: Check authentication
      const token = storage.getAccessToken()
      if (!token) {
        router.push("/signin")
        return
      }

      console.log(`Starting chat with ${userType} ${userId}`)

      // Step 2: Make authenticated request to start chat
      const response = await api.chat.startChat(userType, userId, token)
      console.log("Start chat response:", response)

      // Step 3: Extract conversation ID and navigate
      if (response.chat_url) {
        // Extract conversation ID from URL
        // Expected format: http://127.0.0.1:8000/api/chat/a1b2-c3d4-e5f6-7890/
        const urlParts = response.chat_url.split("/")
        const conversationId = urlParts[urlParts.length - 2] // Get the UUID part

        if (conversationId && conversationId !== "chat") {
          console.log("Navigating to conversation:", conversationId)
          router.push(`/chat/${conversationId}`)
        } else {
          throw new Error("Invalid conversation ID received from server")
        }
      } else {
        throw new Error("No chat URL received from server")
      }
    } catch (error) {
      console.error("Failed to start chat:", error)
      setError(error.message || "Failed to start chat")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleStartChat}
        disabled={loading || disabled}
        variant={variant}
        size={size}
        className={`${className} ${loading ? "opacity-50" : ""}`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            Starting Chat...
          </div>
        ) : (
          <>💬 {userName ? `Chat with ${userName}` : "Start Chat"}</>
        )}
      </Button>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
          <p className="text-red-800 text-xs">{error}</p>
          <Button onClick={() => setError("")} variant="outline" size="sm" className="mt-1 h-6 text-xs">
            Dismiss
          </Button>
        </div>
      )}
    </div>
  )
}
