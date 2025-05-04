"use client"

import { HMSRoomProvider } from "@100mslive/react-sdk"
import type { ReactNode } from "react"

export default function HMSProvider({ children }: { children: ReactNode }) {
  return <HMSRoomProvider>{children}</HMSRoomProvider>
}
