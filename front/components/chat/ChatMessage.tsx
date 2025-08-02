"use client"

import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: string
  senderId: number
  senderName: string
  senderType: "student" | "tutor"
  timestamp: string
  isCurrentUser: boolean
  isOptimistic?: boolean
}

export function ChatMessage({
  message,
  senderId,
  senderName,
  senderType,
  timestamp,
  isCurrentUser,
  isOptimistic = false,
}: ChatMessageProps) {
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
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getSenderTypeIcon = (type: string) => {
    switch (type) {
      case "tutor":
        return "👨‍🏫"
      case "student":
        return "🎓"
      default:
        return "👤"
    }
  }

  return (
    <div
      className={cn(
        "flex gap-3 p-4 hover:bg-gray-50 transition-colors",
        isCurrentUser && "flex-row-reverse",
        isOptimistic && "opacity-70",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
          isCurrentUser ? "bg-green-500" : "bg-blue-500",
        )}
      >
        {getInitials(senderName)}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 min-w-0", isCurrentUser && "text-right")}>
        {/* Sender Info */}
        <div className={cn("flex items-center gap-2 mb-1", isCurrentUser && "justify-end")}>
          <span className="font-medium text-gray-900">{isCurrentUser ? "You" : senderName}</span>
          <span className="text-xs">{getSenderTypeIcon(senderType)}</span>
          <span className="text-xs text-gray-500">
            {formatTime(timestamp)}
            {isOptimistic && " (sending...)"}
          </span>
        </div>

        {/* Message Text */}
        <div
          className={cn(
            "inline-block max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg text-sm break-words",
            isCurrentUser ? "bg-black text-white rounded-br-sm" : "bg-gray-200 text-gray-900 rounded-bl-sm",
          )}
        >
          {message}
        </div>
      </div>
    </div>
  )
}
