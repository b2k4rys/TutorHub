import { Card, CardContent } from "@/components/ui/card"

export default function ChatLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-4xl mx-auto h-[600px] flex items-center justify-center">
          <CardContent>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading chat...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
