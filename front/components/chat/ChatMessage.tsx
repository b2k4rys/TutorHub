interface ChatMessageProps {
  message: {
    content: string
    sender_name: string
    timestamp?: string
    isOptimistic?: boolean
  }
  currentUser: string
}

export function ChatMessage({ message, currentUser }: ChatMessageProps) {
  const isOwnMessage = message.sender_name === currentUser || message.sender_name === "You"

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage ? "bg-black text-white" : "bg-gray-200 text-gray-800"
        } ${message.isOptimistic ? "opacity-70" : ""}`}
      >
        {!isOwnMessage && <div className="text-xs font-semibold mb-1 text-gray-600">{message.sender_name}</div>}
        <div className="text-sm">{message.content}</div>
        {message.timestamp && (
          <div className={`text-xs mt-1 ${isOwnMessage ? "text-gray-300" : "text-gray-500"}`}>
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  )
}
