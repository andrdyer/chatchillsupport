// This is a simple test file to check Agora Chat SDK initialization
// You can run this separately to test just the SDK initialization

export async function testAgoraChatSDK() {
  try {
    console.log("=== TESTING AGORA CHAT SDK INITIALIZATION ===")

    // Import the SDK
    console.log("Importing Agora Chat SDK...")
    const AgoraChatModule = await import("agora-chat")

    // Log the structure
    console.log("SDK imported successfully")
    console.log("Module type:", typeof AgoraChatModule)
    console.log("Module keys:", Object.keys(AgoraChatModule))

    // Check for default export
    if (AgoraChatModule.default) {
      console.log("Default export exists, type:", typeof AgoraChatModule.default)
      console.log("Default export keys:", Object.keys(AgoraChatModule.default))
    }

    // Try to initialize with different patterns
    const appKey = "411335512#1539074" // Your app key
    let client = null

    // Try pattern 1: AgoraChat constructor
    try {
      console.log("Trying pattern 1: new AgoraChat()")
      if (typeof AgoraChatModule.default === "function") {
        client = new AgoraChatModule.default({ appKey })
        console.log("Pattern 1 succeeded!")
        return client
      }
    } catch (e) {
      console.log("Pattern 1 failed:", e)
    }

    // Try pattern 2: create method
    try {
      console.log("Trying pattern 2: AgoraChat.create()")
      const AgoraChat = AgoraChatModule.default || AgoraChatModule
      if (AgoraChat.create) {
        client = AgoraChat.create({ appKey })
        console.log("Pattern 2 succeeded!")
        return client
      }
    } catch (e) {
      console.log("Pattern 2 failed:", e)
    }

    // Try pattern 3: ChatClient constructor
    try {
      console.log("Trying pattern 3: new ChatClient()")
      const ChatClient = AgoraChatModule.ChatClient || (AgoraChatModule.default && AgoraChatModule.default.ChatClient)
      if (ChatClient) {
        client = new ChatClient({ appKey })
        console.log("Pattern 3 succeeded!")
        return client
      }
    } catch (e) {
      console.log("Pattern 3 failed:", e)
    }

    // Try pattern 4: connection.create
    try {
      console.log("Trying pattern 4: connection.create()")
      const connection = AgoraChatModule.connection || (AgoraChatModule.default && AgoraChatModule.default.connection)
      if (connection && connection.create) {
        client = connection.create({ appKey })
        console.log("Pattern 4 succeeded!")
        return client
      }
    } catch (e) {
      console.log("Pattern 4 failed:", e)
    }

    console.log("All initialization patterns failed")
    return null
  } catch (error) {
    console.error("Error in test function:", error)
    return null
  }
}

// You can call this function from your app to test the SDK
// Example:
// import { testAgoraChatSDK } from './test-agora-chat';
// testAgoraChatSDK().then(client => {
//   if (client) {
//     console.log("SDK initialized successfully!");
//   } else {
//     console.log("SDK initialization failed");
//   }
// });
