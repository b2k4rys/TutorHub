class ChatWebSocket {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.messageHandlers = []
    this.statusHandlers = []
    this.conversationId = null
  }

  async connect(conversationId, token) {
    this.conversationId = conversationId

    try {
      // Get WebSocket ticket
      const { api } = await import("./api.js")
      const ticketResponse = await api.chat.getTicket(token)
      const ticket = ticketResponse.ticket

      // Create WebSocket connection
      const wsScheme = window.location.protocol === "https:" ? "wss" : "ws"
      const wsUrl = `${wsScheme}://${window.location.host.replace(":3000", ":8000")}/ws/chat/${conversationId}/?ticket=${ticket}`

      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = (event) => {
        console.log("WebSocket connected")
        this.isConnected = true
        this.reconnectAttempts = 0
        this.notifyStatusHandlers("connected")
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.notifyMessageHandlers(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.socket.onclose = (event) => {
        console.log("WebSocket disconnected")
        this.isConnected = false
        this.notifyStatusHandlers("disconnected")

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(token)
        }
      }

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.notifyStatusHandlers("error")
      }
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
      this.notifyStatusHandlers("error")
      throw error
    }
  }

  scheduleReconnect(token) {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    )

    setTimeout(() => {
      if (this.conversationId) {
        this.connect(this.conversationId, token)
      }
    }, delay)
  }

  sendMessage(message) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({ message }))
      return true
    }
    return false
  }

  onMessage(handler) {
    this.messageHandlers.push(handler)
  }

  onStatus(handler) {
    this.statusHandlers.push(handler)
  }

  notifyMessageHandlers(data) {
    this.messageHandlers.forEach((handler) => handler(data))
  }

  notifyStatusHandlers(status) {
    this.statusHandlers.forEach((handler) => handler(status))
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.isConnected = false
    this.conversationId = null
  }
}

export { ChatWebSocket }
