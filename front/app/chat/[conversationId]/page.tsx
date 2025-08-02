"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChatRoom } from "@/components/chat/ChatRoom"

interface ChatPageProps {
  params: {
    conversationId: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const { conversationId } = params

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-black">
            TutorHub
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Chat Interface */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black mb-2">Chat Room</h1>
          <p className="text-gray-600">Conversation ID: {conversationId}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <ChatRoom conversationId={conversationId} />
        </div>
      </main>
    </div>
  )
}
