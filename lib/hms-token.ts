import axios from "axios"

const HMS_API_BASE_URL = "https://api.100ms.live/v2"

type TokenOptions = {
  roomId: string
  role: "host" | "guest"
  userId?: string
  userName?: string
}

export async function generateToken({ roomId, role, userId, userName }: TokenOptions): Promise<string> {
  try {
    const managementToken = process.env["100MS_MANAGEMENT_TOKEN"] || ""

    const response = await axios.post(
      `${HMS_API_BASE_URL}/rooms/${roomId}/auth-token`,
      {
        user_id: userId || `user-${Math.random().toString(36).substring(2, 7)}`,
        role,
        room_id: roomId,
        type: "app",
        userName,
      },
      {
        headers: {
          Authorization: `Bearer ${managementToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data.token
  } catch (error) {
    console.error("Token generation failed:", error)
    throw new Error("Failed to generate token")
  }
}
