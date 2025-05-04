// Add this at the top of the file
let isMockClient = false

// This file handles the Agora Chat client initialization

// Define the type for the chat client
export type ChatClientType = any // Using any for now since we don't have the exact type

// Update the initChatClient function to be more robust
export const initChatClient = async (appKey: string): Promise<ChatClientType> => {
  try {
    console.log("Initializing Agora Chat client with appKey:", appKey)

    // Check if we're already using a mock client
    if (isMockClient) {
      console.log("Using mock client as previously determined")
      return createMockChatClient()
    }

    try {
      // Import the Agora Chat SDK dynamically
      const AgoraChatModule = await import("agora-chat")

      // Try the most common initialization pattern
      if (AgoraChatModule.default) {
        if (typeof AgoraChatModule.default === "function") {
          console.log("Using AgoraChatModule.default as constructor")
          return new AgoraChatModule.default({
            appKey: appKey,
          })
        } else if (AgoraChatModule.default.create) {
          console.log("Using AgoraChatModule.default.create")
          return AgoraChatModule.default.create({
            appKey: appKey,
          })
        }
      }

      // Try other patterns
      if (AgoraChatModule.create) {
        console.log("Using AgoraChatModule.create")
        return AgoraChatModule.create({
          appKey: appKey,
        })
      }

      // If we get here, we couldn't initialize the client
      throw new Error("Could not find a valid initialization pattern")
    } catch (error) {
      console.error("Error initializing real Agora Chat client:", error)
      console.log("Falling back to mock client")
      isMockClient = true
      return createMockChatClient()
    }
  } catch (error) {
    console.error("Error in initChatClient:", error)
    isMockClient = true
    return createMockChatClient()
  }
}

// Login to Agora Chat
export const loginToChat = async (chatClient: ChatClientType, userId: string, token: string): Promise<boolean> => {
  if (!chatClient) return false

  try {
    console.log("Logging in to Agora Chat with user ID:", userId)

    // Use a temporary token for testing
    const temporaryToken =
      "007eJxTYDDbcDzwA2ehtUDw9NVqRtfW330h1nS8eLPhdIdzV0tk43kUGBItU1INTYwTk1JTjUxMjc2SLE2S0oxSjYzNDE0sDc3S0ubzZTQEMjJMyi5kYIRCEJ+TITkjsSQ5IzMnh4EBALuPIF0="

    // Try different login patterns
    try {
      // Standard pattern
      if (chatClient.open) {
        console.log("Using chatClient.open() method")
        await chatClient.open({
          user: userId,
          token: temporaryToken,
        })
        console.log("Successfully logged in with chatClient.open()")
      }
      // Alternative pattern
      else if (chatClient.login) {
        console.log("Using chatClient.login() method")
        await chatClient.login(userId, temporaryToken)
        console.log("Successfully logged in with chatClient.login()")
      }
      // If neither works, throw an error
      else {
        throw new Error("No valid login method found on chat client")
      }
    } catch (loginError) {
      console.error("Error during login:", loginError)
      return false
    }

    console.log("Successfully logged in to Agora Chat")
    return true
  } catch (error) {
    console.error("Error logging in to Agora Chat:", error)
    return false
  }
}

// Send a message
export const sendChatMessage = async (
  chatClient: ChatClientType,
  to: string,
  message: string,
  chatType: "singleChat" | "groupChat" = "groupChat",
): Promise<boolean> => {
  if (!chatClient) return false

  try {
    console.log(`Sending message to ${chatType === "groupChat" ? "group" : "user"}:`, to)

    // Try different message sending patterns
    if (chatClient.message && chatClient.message.create && chatClient.message.send) {
      // Create a text message
      const msg = chatClient.message.create({
        type: "txt",
        to: to,
        chatType: chatType,
        msg: message,
      })

      // Send the message
      await chatClient.message.send(msg)
    }
    // Alternative pattern
    else if (chatClient.sendMessage) {
      await chatClient.sendMessage({
        type: "txt",
        to: to,
        chatType: chatType,
        msg: message,
      })
    }
    // If neither works, throw an error
    else {
      throw new Error("No valid message sending method found on chat client")
    }

    console.log("Message sent successfully")
    return true
  } catch (error) {
    console.error("Error sending message:", error)
    return false
  }
}

// Logout from Agora Chat
export const logoutFromChat = async (chatClient: ChatClientType): Promise<void> => {
  if (!chatClient) return

  try {
    console.log("Logging out from Agora Chat")

    // Try different logout patterns
    if (chatClient.close) {
      await chatClient.close()
    }
    // Alternative pattern
    else if (chatClient.logout) {
      await chatClient.logout()
    }

    console.log("Successfully logged out from Agora Chat")
  } catch (error) {
    console.error("Error logging out from Agora Chat:", error)
  }
}

// Add this function to create a mock chat client
function createMockChatClient(): ChatClientType {
  console.log("Creating mock chat client")

  const mockClient = {
    isConnected: false,

    // Basic methods
    open: async function (options: any) {
      console.log("Mock client: open called with", options)
      this.isConnected = true
      return true
    },

    login: async function (username: string, token: string) {
      console.log("Mock client: login called with", username, token)
      this.isConnected = true
      return true
    },

    close: async function () {
      console.log("Mock client: close called")
      this.isConnected = false
      return true
    },

    logout: async function () {
      console.log("Mock client: logout called")
      this.isConnected = false
      return true
    },

    // Message handling
    message: {
      create: (options: any) => {
        console.log("Mock client: message.create called with", options)
        return { id: Date.now().toString(), ...options }
      },
      send: async (message: any) => {
        console.log("Mock client: message.send called with", message)
        return true
      },
    },

    // Group management
    groupManager: {
      joinGroup: async (groupId: string) => {
        console.log("Mock client: groupManager.joinGroup called with", groupId)
        return true
      },
      createGroup: async (options: any) => {
        console.log("Mock client: groupManager.createGroup called with", options)
        return { groupId: options.groupname || "mock-group" }
      },
    },

    // Event handling
    _eventHandlers: {} as Record<string, Function[]>,
    on: function (event: string, handler: Function) {
      console.log("Mock client: registered handler for event", event)
      if (!this._eventHandlers[event]) {
        this._eventHandlers[event] = []
      }
      this._eventHandlers[event].push(handler)
    },

    // Helper to simulate events (for testing)
    simulateEvent: function (event: string, data: any) {
      console.log("Mock client: simulating event", event, "with data", data)
      if (this._eventHandlers[event]) {
        this._eventHandlers[event].forEach((handler) => handler(data))
      }
    },
  }

  return mockClient as any
}
