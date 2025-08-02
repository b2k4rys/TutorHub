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
  currentUser?: {
    id: number
    username: string
    user_type: "student" | "tutor"
    first_name?: string
    last_name?: string
  }
}

interface Message {
  id: string
  message: string
  sender_id: number
  sender_name: string
  sender_type: "student" | "tutor"
  timestamp: string
  isOptimistic?: boolean
}

export default function ChatRoom({ conversationId, currentUser }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [connectionStatus, setConnectionStatus] = useState("disconnected")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const websocketRef = useRef<ChatWebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simple function to check if message is from current user
  const isFromCurrentUser = (message: Message): boolean => {
    if (!currentUser) return false

    // Primary check: user ID
    if (currentUser.id && message.sender_id) {
      return Number(currentUser.id) === Number(message.sender_id)
    }

    // Fallback: username
    if (currentUser.username && message.sender_name) {
      return currentUser.username.toLowerCase() === message.sender_name.toLowerCase()
    }

    return false
  }

  // Load message history when component mounts
  useEffect(() => {
    const loadMessageHistory = async () => {
      try {
        setLoading(true)
        const token = storage.getAccessToken()
        if (!token) {
          throw new Error("No access token available")
        }

        console.log("Loading message history for conversation:", conversationId)
        const history = await api.chat.getMessageHistory(conversationId, token)
        console.log("Raw message history:", history)

        if (history && Array.isArray(history)) {
          const processedHistory: Message[] = history.map((msg, index) => ({
            id: msg.id || `history-${index}`,
            message: msg.message || msg.content || "",
            sender_id: Number(msg.sender_id || msg.sender?.id || 0),
            sender_name: msg.sender_name || msg.sender?.username || `User ${msg.sender_id}`,
            sender_type: msg.sender_type || msg.sender?.user_type || "student",
            timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),
            isOptimistic: false,
          }))

          console.log("Processed message history:", processedHistory)
          setMessages(processedHistory)
        }
      } catch (error) {
        console.error("Failed to load message history:", error)
        setError(`Failed to load chat history: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (conversationId) {
      loadMessageHistory()
    }
  }, [conversationId])

  // Initialize WebSocket connection
  useEffect(() => {
    if (!conversationId || !currentUser) return

    const handleMessage = (data: any) => {
      console.log("Received WebSocket message:", data)

      const newMessage: Message = {
        id: data.id || `ws-${Date.now()}`,
        message: data.message,
        sender_id: Number(data.sender_id),
        sender_name: data.sender_name || `User ${data.sender_id}`,
        sender_type: data.sender_type || "student",
        timestamp: data.timestamp || new Date().toISOString(),
        isOptimistic: false,
      }

      // Check if this is from the current user
      const isOwnMessage = isFromCurrentUser(newMessage)
      console.log("Is own message?", isOwnMessage, {
        currentUserId: currentUser.id,
        messageUserId: newMessage.sender_id,
        currentUsername: currentUser.username,
        messageSender: newMessage.sender_name,
      })

      if (isOwnMessage) {
        console.log("Replacing optimistic message with real one")
        setMessages((prev) => {
          // Remove optimistic messages and add the real one
          const withoutOptimistic = prev.filter((msg) => !msg.isOptimistic)

          // Check if we already have this exact message
          const exists = withoutOptimistic.some(
            (msg) =>
              msg.id === newMessage.id ||
              (msg.message === newMessage.message &&
                msg.sender_id === newMessage.sender_id &&
                Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 5000),
          )

          if (exists) {
            console.log("Message already exists, not adding")
            return withoutOptimistic
          }

          return [...withoutOptimistic, newMessage]
        })
      } else {
        console.log("Adding message from other user")
        setMessages((prev) => {
          // Check for duplicates
          const exists = prev.some(
            (msg) =>
              msg.id === newMessage.id ||
              (msg.message === newMessage.message &&
                msg.sender_id === newMessage.sender_id &&
                Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 1000),
          )

          if (exists) {
            console.log("Duplicate message, ignoring")
            return prev
          }

          return [...prev, newMessage]
        })
      }
    }

    const handleStatusChange = (status: string) => {
      console.log("Connection status changed:", status)
      setConnectionStatus(status)

      if (status === "authentication_failed") {
        setError("Authentication failed. Please refresh the page and try again.")
      } else if (status === "error") {
        setError("Connection error. Attempting to reconnect...")
      } else if (status === "connected") {
        setError("")
      }
    }

    // Create and connect WebSocket
    websocketRef.current = new ChatWebSocket(conversationId, handleMessage, handleStatusChange)
    websocketRef.current.connect()

    // Cleanup on unmount
    return () => {
      if (websocketRef.current) {
        websocketRef.current.disconnect()
        websocketRef.current = null
      }
    }
  }, [conversationId, currentUser])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || sendingMessage || !currentUser) return

    const messageText = newMessage.trim()
    const optimisticId = `optimistic-${Date.now()}`

    setNewMessage("")
    setSendingMessage(true)

    try {
      // Add optimistic message immediately
      const optimisticMessage: Message = {
        id: optimisticId,
        message: messageText,
        sender_id: currentUser.id,
        sender_name: currentUser.username,
        sender_type: currentUser.user_type,
        timestamp: new Date().toISOString(),
        isOptimistic: true,
      }

      console.log("Adding optimistic message:", optimisticMessage)
      setMessages((prev) => [...prev, optimisticMessage])

      // Send message through WebSocket
      if (websocketRef.current && connectionStatus === "connected") {
        const success = websocketRef.current.sendMessage(messageText)

        if (!success) {
          throw new Error("Failed to send message through WebSocket")
        }
      } else {
        throw new Error("WebSocket not connected")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setError(`Failed to send message: ${error.message}`)
      setNewMessage(messageText)

      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
    } finally {
      setSendingMessage(false)
      inputRef.current?.focus()
    }
  }

  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case "connecting":
        return { text: "Connecting...", color: "text-yellow-600", icon: "🔄" }
      case "connected":
        return { text: "Connected", color: "text-green-600", icon: "🟢" }
      case "reconnecting":
        return { text: "Reconnecting...", color: "text-yellow-600", icon: "🔄" }
      case "authentication_failed":
        return { text: "Authentication Failed", color: "text-red-600", icon: "🔴" }
      case "error":
        return { text: "Connection Error", color: "text-red-600", icon: "🔴" }
      default:
        return { text: "Disconnected", color: "text-gray-600", icon: "⚫" }
    }
  }

  const status = getConnectionStatusDisplay()

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading chat...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Chat Room</CardTitle>
          <div className={`flex items-center gap-2 text-sm ${status.color}`}>
            <span>{status.icon}</span>
            <span>{status.text}</span>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages Area */}
        <div className="h-96 overflow-y-auto border-b">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => {
                const isCurrentUserMessage = isFromCurrentUser(message)
                console.log(`Rendering message ${message.id}: isCurrentUser=${isCurrentUserMessage}`, {
                  messageId: message.id,
                  senderId: message.sender_id,
                  senderName: message.sender_name,
                  currentUserId: currentUser?.id,
                  currentUsername: currentUser?.username,
                })

                return (
                  <ChatMessage
                    key={message.id}
                    message={message.message}
                    senderId={message.sender_id}
                    senderName={message.sender_name}
                    senderType={message.sender_type}
                    timestamp={message.timestamp}
                    isCurrentUser={isCurrentUserMessage}
                    isOptimistic={message.isOptimistic}
                  />
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder={connectionStatus === "connected" ? "Type your message..." : "Connecting to chat..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={connectionStatus !== "connected" || sendingMessage}
              className="flex-1"
              maxLength={1000}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || connectionStatus !== "connected" || sendingMessage}
              className="bg-black text-white hover:bg-gray-800"
            >
              {sendingMessage ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending
                </div>
              ) : (
                "Send"
              )}
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Conversation ID: {conversationId}</span>
            <span>{newMessage.length}/1000</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
