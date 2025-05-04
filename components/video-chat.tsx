"use client"
import { useEffect } from "react"
import { useHMSActions, useHMSStore, selectIsConnectedToRoom } from "@100mslive/react-sdk"

export default function VideoChat({
  authToken,
  userName = "Guest",
}: {
  authToken: string
  userName?: string
}) {
  const hmsActions = useHMSActions()
  const isConnected = useHMSStore(selectIsConnectedToRoom)

  useEffect(() => {
    if (!isConnected && authToken) {
      hmsActions.join({ userName, authToken }).catch((err) => console.error("JOIN ERROR:", err))
    }
  }, [authToken, isConnected, hmsActions, userName])

  if (!isConnected) {
    return <div className="text-white text-lg p-6">Joining room…</div>
  }

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">✅ You're Connected</h1>
      {/* Add video tiles here */}
    </div>
  )
}
