"use client"

import { useState } from "react"

interface ChatMessageProps {
  message: string
  senderId: number
  senderName: string
  senderType: "student" | "tutor"
  timestamp: string
  isCurrentUser: boolean
}

export function ChatMessage({ message, senderId, senderName, senderType, timestamp, isCurrentUser }: ChatMessageProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return "Now"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getSenderTypeIcon = (type: "student" | "tutor") => {
    return type === "tutor" ? "👨‍🏫" : "👨‍🎓"
  }

  const getSenderTypeColor = (type: "student" | "tutor") => {
    return type === "tutor" ? "bg-blue-500" : "bg-green-500"
  }

  return (
    <div
      className={`flex gap-3 p-4 hover:bg-gray-50 transition-colors ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getSenderTypeColor(
          senderType,
        )}`}
      >
        {getInitials(senderName)}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-xs md:max-w-md ${isCurrentUser ? "text-right" : "text-left"}`}>
        {/* Sender Info */}
        <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
          <span className="text-sm font-medium text-gray-900">{isCurrentUser ? "You" : senderName}</span>
          <span className="text-xs">{getSenderTypeIcon(senderType)}</span>
          <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>
        </div>

        {/* Message Bubble */}
        <div
          className={`inline-block px-4 py-2 rounded-lg max-w-full break-words ${
            isCurrentUser ? "bg-black text-white rounded-br-sm" : "bg-gray-200 text-gray-900 rounded-bl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed">{message}</p>
        </div>

        {/* Detailed Info (shown on click) */}
        {showDetails && (
          <div className={`mt-2 text-xs text-gray-500 ${isCurrentUser ? "text-right" : "text-left"}`}>
            <p>Sender ID: {senderId}</p>
            <p>Type: {senderType}</p>
            <p>Time: {new Date(timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}
