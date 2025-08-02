"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatMessage } from "./ChatMessage"
import ChatWebSocket from "@/lib/websocket"
import { api, storage } from "@/lib/api"

interface ChatRoomProps {
  conversationId: string
  otherUserName?: string
}

export function ChatRoom({ conversationId, otherUserName = "Chat" }: ChatRoomProps) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [status, setStatus] = useState("initializing")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatSocketRef = useRef<ChatWebSocket | null>(null)
  const currentUser = storage.getUser()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = storage.getAccessToken()
        if (!token) {
          setError("Authentication required")
          setIsLoading(false)
          return
        }

        // Load message history
        setStatus("loading history")
        try {
          const history = await api.chat.getMessageHistory(conversationId, token)
          setMessages(history || [])
        } catch (historyError) {
          console.warn("Failed to load message history:", historyError)
        }

        // Initialize WebSocket connection
        chatSocketRef.current = new ChatWebSocket()

        chatSocketRef.current.addStatusHandler((newStatus) => {
          setStatus(newStatus)
          setIsLoading(newStatus === "connecting" || newStatus === "loading history")
        })

        chatSocketRef.current.addMessageHandler((data) => {
          const newMessage = {
            id: Date.now().toString(),
            content: data.content || data.message,
            sender_name: data.sender_name || "Unknown",
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, newMessage])
        })

        await chatSocketRef.current.connect(conversationId, token)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to initialize chat:", error)
        setError(error.message || "Failed to initialize chat")
        setStatus("error")
        setIsLoading(false)
      }
    }

    initializeChat()

    return () => {
      if (chatSocketRef.current) {
        chatSocketRef.current.disconnect()
      }
    }
  }, [conversationId])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatSocketRef.current) return

    // Add optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      sender_name: currentUser?.username || "You",
      timestamp: new Date().toISOString(),
      isOptimistic: true,
    }

    setMessages((prev) => [...prev, optimisticMessage])

    const success = chatSocketRef.current.sendMessage(newMessage.trim())

    if (success) {
      setNewMessage("")
    } else {
      // Remove optimistic message if send failed
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
      setError("Failed to send message")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusColor = () => {
    if (status === "connected") return "text-green-600"
    if (status === "error" || status === "disconnected") return "text-red-600"
    return "text-yellow-600"
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Chat with {otherUserName}</span>
          <div className={`text-sm font-normal ${getStatusColor()}`}>Status: {status}</div>
        </CardTitle>
        <div className="text-xs text-gray-500">Conversation ID: {conversationId}</div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage key={message.id || index} message={message} currentUser={currentUser?.username || "You"} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={status !== "connected"}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim() || status !== "connected"}>
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
