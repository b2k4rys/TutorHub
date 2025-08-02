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
}

export function StartChatButton({ userType, userId, userName, className }: StartChatButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleStartChat = async () => {
    setIsLoading(true)
    setError("")

    try {
      const token = storage.getAccessToken()
      if (!token) {
        setError("Please log in to start a chat")
        setIsLoading(false)
        return
      }

      const response = await api.chat.startChat(userType, userId, token)

      if (response.chat_url) {
        // Extract conversation ID from the chat URL
        const conversationId = response.chat_url.split("/").pop().replace("/", "")
        router.push(`/chat/${conversationId}`)
      } else {
        setError("Failed to create chat")
      }
    } catch (error) {
      console.error("Failed to start chat:", error)
      setError("Failed to start chat. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={handleStartChat} disabled={isLoading} className={className}>
        {isLoading ? "Starting Chat..." : `Chat with ${userName || userType}`}
      </Button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  )
}
