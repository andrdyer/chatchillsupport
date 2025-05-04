// A minimal implementation that can be used as a fallback
// This doesn't rely on the actual SDK but provides the same interface

export type MinimalChatClient = {
  isConnected: boolean
  open: (options: any) => Promise<boolean>
  login: (username: string, token: string) => Promise<boolean>
  message: {
    create: (options: any) => any
    send: (message: any) => Promise<boolean>
  }
  groupManager: {
    joinGroup: (groupId: string) => Promise<boolean>
    createGroup: (options: any) => Promise<any>
  }
  close: () => Promise<boolean>
  logout: () => Promise<boolean>
  on: (event: string, callback: Function) => void
  simulateMessageReceived: (message: any) => void
}

export function createMinimalChatClient(): MinimalChatClient {
  console.log("Creating minimal chat client (fallback implementation)")

  return {
    isConnected: false,

    // Login methods
    open: async function (options: any) {
      console.log("Minimal chat client: open called with", options)
      this.isConnected = true
      return true
    },

    login: async function (username: string, token: string) {
      console.log("Minimal chat client: login called with", username, token)
      this.isConnected = true
      return true
    },

    // Message methods
    message: {
      create: (options: any) => {
        console.log("Minimal chat client: message.create called with", options)
        return { id: "minimal-message-" + Date.now(), ...options }
      },
      send: async (message: any) => {
        console.log("Minimal chat client: message.send called with", message)
        return true
      },
    },

    // Group methods
    groupManager: {
      joinGroup: async (groupId: string) => {
        console.log("Minimal chat client: joinGroup called with", groupId)
        return true
      },
      createGroup: async (options: any) => {
        console.log("Minimal chat client: createGroup called with", options)
        return { groupId: options.groupname }
      },
    },

    // Logout methods
    close: async function () {
      console.log("Minimal chat client: close called")
      this.isConnected = false
      return true
    },

    logout: async function () {
      console.log("Minimal chat client: logout called")
      this.isConnected = false
      return true
    },

    // Event handling
    eventHandlers: {} as Record<string, Function[]>,
    on: function (event: string, callback: Function) {
      console.log("Minimal chat client: registered event handler for", event)
      if (!this.eventHandlers) {
        this.eventHandlers = {}
      }
      if (!this.eventHandlers[event]) {
        this.eventHandlers[event] = []
      }
      this.eventHandlers[event].push(callback)
    },

    // Method to simulate receiving a message (for testing)
    simulateMessageReceived: function (message: any) {
      console.log("Minimal chat client: simulating message received", message)
      if (this.eventHandlers && this.eventHandlers["message"]) {
        this.eventHandlers["message"].forEach((handler) => handler(message))
      }
    },
  }
}
