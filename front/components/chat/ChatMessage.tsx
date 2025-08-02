interface ChatMessageProps {
  content: string
  senderName: string
  timestamp?: string
  isOwnMessage?: boolean
}

export function ChatMessage({ content, senderName, timestamp, isOwnMessage = false }: ChatMessageProps) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        {!isOwnMessage && <div className="text-xs font-semibold mb-1 opacity-75">{senderName}</div>}
        <div className="text-sm">{content}</div>
        {timestamp && (
          <div className={`text-xs mt-1 ${isOwnMessage ? "text-blue-100" : "text-gray-500"}`}>
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
