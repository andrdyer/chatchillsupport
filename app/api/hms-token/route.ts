import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/hms-token"

export async function POST(req: NextRequest) {
  try {
    const { roomId, role, userId, userName } = await req.json()

    if (!roomId || !role) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const token = await generateToken({
      roomId,
      role,
      userId,
      userName,
    })

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error generating token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
