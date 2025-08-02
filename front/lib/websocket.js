import { storage } from "./api"

class ChatWebSocket {
  constructor(conversationId, onMessage, onStatusChange) {
    this.conversationId = conversationId
    this.onMessage = onMessage
    this.onStatusChange = onStatusChange
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.isConnecting = false
    this.shouldReconnect = true
  }

  async connect() {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true
    this.onStatusChange("connecting")

    try {
      // Get WebSocket ticket
      const token = storage.getAccessToken()
      if (!token) {
        throw new Error("No access token available")
      }

      const response = await fetch("http://localhost:8000/api/ws-ticket/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to get WebSocket ticket")
      }

      const data = await response.json()
      const ticket = data.ticket

      // Connect to WebSocket
      const wsScheme = window.location.protocol === "https:" ? "wss" : "ws"
      const wsUrl = `${wsScheme}://localhost:8000/ws/chat/${this.conversationId}/?ticket=${ticket}`

      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log("WebSocket connected")
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.onStatusChange("connected")
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.onMessage(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.socket.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason)
        this.isConnecting = false
        this.onStatusChange("disconnected")

        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.isConnecting = false
        this.onStatusChange("error")
      }
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
      this.isConnecting = false
      this.onStatusChange("error")

      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)
    this.onStatusChange("reconnecting")

    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect()
      }
    }, delay)
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message }))
      return true
    }
    return false
  }

  disconnect() {
    this.shouldReconnect = false
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

export default ChatWebSocket
