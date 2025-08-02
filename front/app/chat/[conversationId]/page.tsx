"use client"
import { ChatRoom } from "@/components/chat/ChatRoom"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface ChatPageProps {
  params: {
    conversationId: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button onClick={() => router.back()} variant="outline" className="mb-4">
            ← Back
          </Button>
        </div>

        <ChatRoom conversationId={params.conversationId} />
      </div>
    </div>
  )
}
