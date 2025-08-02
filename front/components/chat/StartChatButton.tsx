"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { api, storage } from "@/lib/api.js"
import { MessageCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface StartChatButtonProps {
  userType: "tutor" | "student"
  userId: number
  userName?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function StartChatButton({
  userType,
  userId,
  userName = "User",
  variant = "default",
  size = "default",
}: StartChatButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStartChat = async () => {
    try {
      setIsLoading(true)
      const token = storage.getAccessToken()

      if (!token) {
        alert("Please log in to start a chat")
        return
      }

      const response = await api.chat.startChat(userType, userId, token)

      // Extract conversation ID from the chat URL
      const chatUrl = response.chat_url
      const conversationId = chatUrl.split("/").slice(-2, -1)[0] // Get ID from URL

      // Navigate to chat page
      router.push(`/chat/${conversationId}?user=${encodeURIComponent(userName)}`)
    } catch (error) {
      console.error("Failed to start chat:", error)
      alert(`Failed to start chat: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleStartChat} disabled={isLoading} variant={variant} size={size} className="gap-2">
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
      {isLoading ? "Starting..." : "Chat"}
    </Button>
  )
}
