import { storage } from "./api"

class ChatWebSocket {
  constructor(conversationId, onMessage, onStatusChange) {
    this.conversationId = conversationId
    // Wrap the original onMessage to inject our latency calculation
    this.originalOnMessage = onMessage
    this.onStatusChange = onStatusChange
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.isConnecting = false
    this.shouldReconnect = true
    this.ticket = null
  }

  async connect() {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true
    this.onStatusChange("connecting")

    try {
      // Step 1: Get WebSocket ticket with JWT authentication
      const token = storage.getAccessToken()
      if (!token) {
        throw new Error("No access token available")
      }

      console.log("🎫 Getting WebSocket ticket...")
      const response = await fetch("http://localhost:8000/api/ws-ticket/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Failed to get WebSocket ticket: ${response.status} - ${errorData.detail || response.statusText}`,
        )
      }

      const data = await response.json()
      this.ticket = data.ticket
      console.log("✅ WebSocket ticket obtained successfully")

      // Step 2: Connect to WebSocket using the ticket
      const wsScheme = window.location.protocol === "https:" ? "wss" : "ws"
      const wsUrl = `${wsScheme}://localhost:8000/ws/chat/${this.conversationId}/?ticket=${this.ticket}`

      console.log("🔌 Connecting to WebSocket:", wsUrl)
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log("✅ WebSocket connected successfully")
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.onStatusChange("connected")
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("📨 WebSocket message received:", data)

          // --- Latency Measurement Calculation ---
          const clientSendTimestamp = data['client_send_timestamp'];
          const serverReceiveTimestamp = data['server_receive_timestamp'];
          const serverSendTimestamp = data['server_send_timestamp'];
          const clientReceiveTimestamp = Date.now(); // Timestamp when message is received by client

          if (clientSendTimestamp) {
              const rtt = clientReceiveTimestamp - clientSendTimestamp;
              console.log(`⏱️ Message Round-trip Latency: ${rtt} ms`);

              if (serverReceiveTimestamp && serverSendTimestamp) {
                  const clientToServerLatency = serverReceiveTimestamp - clientSendTimestamp;
                  const serverProcessingTime = serverSendTimestamp - serverReceiveTimestamp;
                  const serverToClientLatency = clientReceiveTimestamp - serverSendTimestamp;
                  console.log(`  Client->Server: ${clientToServerLatency} ms`);
                  console.log(`  Server Processing: ${serverProcessingTime} ms`);
                  console.log(`  Server->Client: ${serverToClientLatency} ms`);
              }
          }
          // --- End Latency Measurement Calculation ---

          // Pass the message data to the original onMessage callback
          this.originalOnMessage(data)
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error)
        }
      }

      this.socket.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason)
        this.isConnecting = false
        this.onStatusChange("disconnected")

        // Only attempt reconnection for certain close codes
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          // Don't reconnect immediately for authentication failures
          if (event.code === 4003 || event.code === 4004) {
            console.log("❌ Authentication failed, not attempting reconnection")
            this.onStatusChange("authentication_failed")
            return
          }
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = (error) => {
        console.error("❌ WebSocket error:", error)
        this.isConnecting = false
        this.onStatusChange("error")

        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }
    } catch (error) {
      console.error("❌ Failed to connect to WebSocket:", error)
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

    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)
    this.onStatusChange("reconnecting")

    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect()
      }
    }, delay)
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // --- Latency Measurement Addition ---
      const messageData = { 
        message: message,
        client_send_timestamp: Date.now() // Add the client-side timestamp here
      }
      // --- End Latency Measurement Addition ---
      console.log("📤 Sending message:", messageData)
      this.socket.send(JSON.stringify(messageData))
      return true
    }
    console.warn("⚠️ Cannot send message: WebSocket not connected")
    return false
  }

  disconnect() {
    console.log("🔌 Disconnecting WebSocket...")
    this.shouldReconnect = false
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  getConnectionStatus() {
    if (!this.socket) return "disconnected"

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return "connecting"
      case WebSocket.OPEN:
        return "connected"
      case WebSocket.CLOSING:
        return "disconnecting"
      case WebSocket.CLOSED:
        return "disconnected"
      default:
        return "unknown"
    }
  }
}

export default ChatWebSocket;
