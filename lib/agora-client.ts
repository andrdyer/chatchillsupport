import type { IAgoraRTCClient, IAgoraRTCRemoteUser, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"
import {
  initChatClient,
  loginToChat as loginToChatService,
  sendChatMessage as sendChatMessageService,
  logoutFromChat as logoutFromChatService,
  type ChatClientType,
} from "./agora-chat-client"

// Agora credentials
export const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || ""
export const AGORA_CHAT_APP_KEY = "411335512#1539074"

// Track types for better type safety
export type LocalTracks = {
  videoTrack: ICameraVideoTrack | null
  audioTrack: IMicrophoneAudioTrack | null
}

// Create and initialize the Agora RTC client
export const createClient = async (): Promise<IAgoraRTCClient | null> => {
  if (typeof window === "undefined") return null

  try {
    const AgoraRTC = (await import("agora-rtc-sdk-ng")).default
    return AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  } catch (error) {
    console.error("Error creating Agora client:", error)
    return null
  }
}

// Create and initialize the Agora Chat client
export const createChatClient = async (): Promise<ChatClientType | null> => {
  if (typeof window === "undefined") return null

  try {
    // First try to use the real SDK
    try {
      console.log("Attempting to initialize real Agora Chat client")
      const client = await initChatClient(AGORA_CHAT_APP_KEY)
      console.log("Successfully initialized real Agora Chat client")
      return client
    } catch (sdkError) {
      console.error("Failed to initialize real Agora Chat client:", sdkError)

      // Fall back to the simplified mock client
      console.log("Falling back to simplified mock client")
      return await createSimplifiedChatClient()
    }
  } catch (error) {
    console.error("Error creating chat client:", error)
    return null
  }
}

// Create local tracks with better fallbacks
export const createLocalTracks = async (): Promise<LocalTracks> => {
  if (typeof window === "undefined") {
    return { videoTrack: null, audioTrack: null }
  }

  try {
    const AgoraRTC = (await import("agora-rtc-sdk-ng")).default
    console.log("Creating camera and microphone tracks...")

    // Try to get actual camera access
    try {
      // Try with getUserMedia first to ensure permissions
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      console.log("Permission granted for camera and microphone")

      // Now try to create the actual tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
      console.log("Successfully created both audio and video tracks")
      return { audioTrack, videoTrack }
    } catch (mediaError) {
      console.error("Media access error:", mediaError)
      return { videoTrack: null, audioTrack: null }
    }
  } catch (error) {
    console.error("Error creating local tracks:", error)
    return { videoTrack: null, audioTrack: null }
  }
}

// Find a match and get a channel name
export const findMatch = async (): Promise<{ status: string; userId: string; channelName?: string }> => {
  try {
    const response = await fetch("/api/match", { method: "POST" })
    if (!response.ok) {
      throw new Error(`Match API error: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error finding match:", error)
    throw error
  }
}

// Update the getToken function to use our API endpoint
export const getToken = async (channelName: string): Promise<{ token: string; uid: number }> => {
  try {
    // Call our token API endpoint
    const response = await fetch(`/api/token?channelName=${encodeURIComponent(channelName)}`)

    if (!response.ok) {
      throw new Error(`Token API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Got token from API for channel:", channelName, "uid:", data.uid)

    return {
      token: data.token,
      uid: data.uid,
    }
  } catch (error) {
    console.error("Error in getToken:", error)

    // Fallback to a local temporary token if the API fails
    console.warn("Falling back to local temporary token generation")
    const uid = Math.floor(Math.random() * 999999)

    // Generate a simple local token (this is NOT secure)
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || ""
    const timestamp = Date.now()
    const simpleToken = btoa(`${appId}:${channelName}:${uid}:${timestamp}`)

    return {
      token: simpleToken,
      uid,
    }
  }
}

// Get a chat token for a user
export const getChatToken = async (username: string): Promise<{ accessToken: string; expireTimestamp: number }> => {
  try {
    const response = await fetch("/api/chat-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    })
    if (!response.ok) {
      throw new Error(`Chat token API error: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error getting chat token:", error)
    throw error
  }
}

// Join a channel with token
export const joinChannel = async (
  client: IAgoraRTCClient,
  channelName: string,
  token: string,
  uid: number,
  tracks: LocalTracks,
): Promise<boolean> => {
  if (!client) return false

  try {
    console.log("Joining channel:", channelName, "with UID:", uid)
    console.log("Using token:", token.substring(0, 20) + "...")

    try {
      // Join with the token
      await client.join(AGORA_APP_ID, channelName, token, uid)
      console.log("Successfully joined channel:", channelName)
    } catch (joinError) {
      console.error("Error joining channel:", joinError)
      return false
    }

    // Only try to publish tracks that exist
    const tracksToPublish = []
    if (tracks.audioTrack) {
      console.log("Adding audio track to publish")
      tracksToPublish.push(tracks.audioTrack)
    }
    if (tracks.videoTrack) {
      console.log("Adding video track to publish")
      tracksToPublish.push(tracks.videoTrack)
    }

    if (tracksToPublish.length > 0) {
      try {
        console.log("Publishing", tracksToPublish.length, "tracks")
        await client.publish(tracksToPublish)
        console.log("Successfully published tracks")
      } catch (publishError) {
        console.error("Error publishing tracks:", publishError)
        // Continue anyway
      }
    } else {
      console.warn("No tracks to publish")
    }

    return true
  } catch (error) {
    console.error("Error in joinChannel:", error)
    return false
  }
}

// Login to Agora Chat
export const loginToChat = async (chatClient: ChatClientType | null, userId: string): Promise<boolean> => {
  if (!chatClient) return false

  try {
    // Get a chat token for this user
    const { accessToken } = await getChatToken(userId)

    // Use our dedicated function to login
    return await loginToChatService(chatClient, userId, accessToken)
  } catch (error) {
    console.error("Error logging in to Agora Chat:", error)
    return false
  }
}

// Join a chat group for the channel
export const joinChatGroup = async (chatClient: ChatClientType | null, channelName: string): Promise<string | null> => {
  if (!chatClient) return null

  try {
    console.log("Joining chat group for channel:", channelName)

    // Use the channel name as the group ID
    const groupId = channelName

    // Try to join the group
    try {
      await chatClient.groupManager.joinGroup(groupId)
      console.log("Successfully joined chat group:", groupId)
    } catch (joinError) {
      // If the group doesn't exist, create it
      console.log("Group doesn't exist, creating it:", groupId)
      await chatClient.groupManager.createGroup({
        groupname: channelName,
        desc: `Chat group for channel ${channelName}`,
        public: true,
        approval: false,
      })
      console.log("Successfully created chat group:", groupId)
    }

    return groupId
  } catch (error) {
    console.error("Error joining/creating chat group:", error)
    return null
  }
}

// Send a message to a chat group
export const sendChatMessage = async (
  chatClient: ChatClientType | null,
  groupId: string,
  message: string,
): Promise<boolean> => {
  if (!chatClient) return false

  try {
    // Use our dedicated function to send a message
    return await sendChatMessageService(chatClient, groupId, message)
  } catch (error) {
    console.error("Error sending message to group:", error)
    return false
  }
}

// Leave the channel and clean up
export const leaveChannel = async (client: IAgoraRTCClient | null, tracks: LocalTracks): Promise<void> => {
  if (!client) return

  try {
    console.log("Leaving channel and cleaning up tracks")

    // Check if client is joined before trying to unpublish
    const isJoined = client.connectionState === "CONNECTED"

    // Close and stop tracks regardless of unpublish result
    if (tracks.videoTrack) {
      try {
        console.log("Stopping video track")
        tracks.videoTrack.stop()
        tracks.videoTrack.close()
      } catch (videoError) {
        console.error("Error closing video track:", videoError)
      }
    }

    if (tracks.audioTrack) {
      try {
        console.log("Stopping audio track")
        tracks.audioTrack.stop()
        tracks.audioTrack.close()
      } catch (audioError) {
        console.error("Error closing audio track:", audioError)
      }
    }

    // Try to leave the channel if client is joined
    if (isJoined) {
      try {
        console.log("Leaving channel")
        await client.leave()
        console.log("Left channel successfully")
      } catch (leaveError) {
        console.error("Error leaving channel:", leaveError)
      }
    }
  } catch (error) {
    console.error("Error during channel leave:", error)
  }
}

// Logout from Agora Chat
export const logoutFromChat = async (chatClient: ChatClientType | null): Promise<void> => {
  if (!chatClient) return

  try {
    // Use our dedicated function to logout
    await logoutFromChatService(chatClient)
  } catch (error) {
    console.error("Error logging out from Agora Chat:", error)
  }
}

// Subscribe to a remote user
export const subscribeToUser = async (
  client: IAgoraRTCClient,
  user: IAgoraRTCRemoteUser,
  mediaType: "audio" | "video",
): Promise<void> => {
  try {
    await client.subscribe(user, mediaType)
    console.log("Successfully subscribed to", mediaType, "from user:", user.uid)

    if (mediaType === "audio" && user.audioTrack) {
      user.audioTrack.play()
      console.log("Remote audio track playing")
    }
  } catch (error) {
    console.error("Error subscribing to user:", error)
  }
}

// Add a function to check if the Agora Chat SDK is properly loaded
export const checkAgoraChatSDK = async (): Promise<boolean> => {
  try {
    console.log("Checking Agora Chat SDK...")

    // Try to import the SDK
    const AgoraChatModule = await import("agora-chat")

    // Log what we found
    console.log("Agora Chat module imported successfully")
    console.log("Module keys:", Object.keys(AgoraChatModule))

    if (AgoraChatModule.default) {
      console.log("Default export exists")
      console.log("Default export type:", typeof AgoraChatModule.default)
      console.log("Default export keys:", Object.keys(AgoraChatModule.default))
    }

    // Check for specific expected properties/methods
    const hasCreate = AgoraChatModule.create || (AgoraChatModule.default && AgoraChatModule.default.create)

    const hasConnection = AgoraChatModule.connection || (AgoraChatModule.default && AgoraChatModule.default.connection)

    const hasChatClient = AgoraChatModule.ChatClient || (AgoraChatModule.default && AgoraChatModule.default.ChatClient)

    console.log("Has create method:", !!hasCreate)
    console.log("Has connection property:", !!hasConnection)
    console.log("Has ChatClient class:", !!hasChatClient)

    return !!(hasCreate || hasConnection || hasChatClient)
  } catch (error) {
    console.error("Error checking Agora Chat SDK:", error)
    return false
  }
}

// Add this function at the end of the file

// Create a simplified version that doesn't rely on the chat client
export const createSimplifiedChatClient = async (): Promise<any> => {
  if (typeof window === "undefined") return null

  try {
    console.log("Creating simplified chat client")

    // Create a simple mock client that logs operations but doesn't actually use the SDK
    const mockClient = {
      isConnected: false,

      // Mock login function
      open: async function (options: any) {
        console.log("Mock chat client: open called with", options)
        this.isConnected = true
        return true
      },

      login: async function (username: string, token: string) {
        console.log("Mock chat client: login called with", username, token)
        this.isConnected = true
        return true
      },

      // Mock message functions
      message: {
        create: (options: any) => {
          console.log("Mock chat client: message.create called with", options)
          return { id: "mock-message-" + Date.now(), ...options }
        },
        send: async (message: any) => {
          console.log("Mock chat client: message.send called with", message)
          return true
        },
      },

      // Mock group manager
      groupManager: {
        joinGroup: async (groupId: string) => {
          console.log("Mock chat client: joinGroup called with", groupId)
          return true
        },
        createGroup: async (options: any) => {
          console.log("Mock chat client: createGroup called with", options)
          return { groupId: options.groupname }
        },
      },

      // Mock close function
      close: async function () {
        console.log("Mock chat client: close called")
        this.isConnected = false
        return true
      },

      logout: async function () {
        console.log("Mock chat client: logout called")
        this.isConnected = false
        return true
      },

      // Add event listener capability
      eventHandlers: {} as Record<string, Function[]>,
      on: function (event: string, callback: Function) {
        console.log("Mock chat client: registered event handler for", event)
        if (!this.eventHandlers[event]) {
          this.eventHandlers[event] = []
        }
        this.eventHandlers[event].push(callback)
      },

      // Method to simulate receiving a message (for testing)
      simulateMessageReceived: function (message: any) {
        console.log("Mock chat client: simulating message received", message)
        if (this.eventHandlers["message"]) {
          this.eventHandlers["message"].forEach((handler) => handler(message))
        }
      },
    }

    console.log("Created simplified mock chat client")
    return mockClient
  } catch (error) {
    console.error("Error creating simplified chat client:", error)
    return null
  }
}
