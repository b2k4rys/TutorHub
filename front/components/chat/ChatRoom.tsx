"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatMessage } from "./ChatMessage"
import ChatWebSocket from "@/lib/websocket.js"
import { api, storage } from "@/lib/api.js"
import { Send, Loader2 } from "lucide-react"

interface Message {
  id?: number
  content: string
  sender_name: string
  timestamp?: string
}

interface ChatRoomProps {
  conversationId: string
  otherUserName?: string
}

export function ChatRoom({ conversationId, otherUserName = "Chat" }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [status, setStatus] = useState("Initializing...")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

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
          setStatus("Error: No authentication token found")
          setIsLoading(false)
          return
        }

        // Load message history
        setStatus("Loading message history...")
        try {
          const history = await api.chat.getMessageHistory(conversationId, token)
          setMessages(history)
          setStatus("History loaded")
        } catch (error) {
          console.error("Failed to load message history:", error)
          setStatus("Failed to load history, but continuing...")
        }

        // Initialize WebSocket connection
        chatSocketRef.current = new ChatWebSocket()

        chatSocketRef.current.onStatus((newStatus) => {
          setStatus(newStatus)
          setIsLoading(newStatus.includes("Connecting") || newStatus.includes("Getting"))
        })

        chatSocketRef.current.onMessage((data) => {
          const newMessage: Message = {
            content: data.content,
            sender_name: data.sender_name,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, newMessage])
        })

        await chatSocketRef.current.connect(conversationId, token)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to initialize chat:", error)
        setStatus(`Error: ${error.message}`)
        setIsLoading(false)
      }
    }

    initializeChat()

    // Cleanup on unmount
    return () => {
      if (chatSocketRef.current) {
        chatSocketRef.current.disconnect()
      }
    }
  }, [conversationId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatSocketRef.current || isSending) return

    setIsSending(true)
    const success = chatSocketRef.current.sendMessage(newMessage.trim())

    if (success) {
      // Add optimistic message
      const optimisticMessage: Message = {
        content: newMessage.trim(),
        sender_name: currentUser?.username || "You",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimisticMessage])
      setNewMessage("")
    } else {
      setStatus("Failed to send message - not connected")
    }

    setIsSending(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusColor = () => {
    if (status.includes("Connected")) return "text-green-600"
    if (status.includes("Error") || status.includes("Failed")) return "text-red-600"
    if (status.includes("Connecting") || status.includes("Loading")) return "text-blue-600"
    return "text-gray-600"
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Chat with {otherUserName}</span>
          <div className={`text-sm font-normal ${getStatusColor()}`}>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
            {status}
          </div>
        </CardTitle>
        <div className="text-xs text-gray-500">Conversation ID: {conversationId}</div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={index}
                content={message.content}
                senderName={message.sender_name}
                timestamp={message.timestamp}
                isOwnMessage={message.sender_name === currentUser?.username}
              />
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
              disabled={isLoading || !status.includes("Connected")}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading || !status.includes("Connected") || isSending}
              size="icon"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
