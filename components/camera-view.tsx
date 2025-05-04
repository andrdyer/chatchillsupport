"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useHMSStore, selectLocalPeerID, selectCameraStreamByPeerID } from '@100mslive/react-sdk';

export function CameraView({
  isLocal,
  username = "User",
  countryFlag,
  isActive,
  profileImage,
  videoTrack: propVideoTrack,
  audioTrack,
  remotePeerId,
}: {
  isLocal: boolean;
  username: string;
  countryFlag: string;
  isActive: boolean;
  profileImage?: string;
  videoTrack?: any;
  audioTrack?: any;
  remotePeerId?: string;
}) {
  const videoRef = useRef<HTMLDivElement>(null)
  const localPeerId = useHMSStore(selectLocalPeerID);
  const videoTrack = useHMSStore(selectCameraStreamByPeerID(isLocal ? localPeerId : remotePeerId));

  // Play video track when it changes or when component mounts
  useEffect(() => {
    if (!videoRef.current || !videoTrack || !isActive) return

    // Play the video track in the container
    try {
      videoTrack.play(videoRef.current)
    } catch (error) {
      console.error("Error playing video track:", error)
    }

    // Clean up when component unmounts or track changes
    return () => {
      try {
        if (videoTrack) {
          videoTrack.stop()
        }
      } catch (error) {
        console.error("Error stopping video track:", error)
      }
    }
  }, [videoTrack, isActive])

  // Play audio track when it changes or when component mounts
  useEffect(() => {
    if (!audioTrack || !isActive) return

    // Play the audio track
    try {
      if (!isLocal) {
        audioTrack.play()
      }
    } catch (error) {
      console.error("Error playing audio track:", error)
    }

    // Clean up when component unmounts or track changes
    return () => {
      try {
        if (audioTrack && !isLocal) {
          audioTrack.stop()
        }
      } catch (error) {
        console.error("Error stopping audio track:", error)
      }
    }
  }, [audioTrack, isActive, isLocal])

  return (
    <div className="relative h-full">
      {/* Video container */}
      <div ref={videoRef} className={cn("h-full w-full bg-black", !isActive && "flex items-center justify-center")}>
        {!isActive && (
          <div className="flex flex-col items-center justify-center">
            {profileImage ? (
              <Image
                src={profileImage || "/placeholder.svg"}
                alt={username}
                width={120}
                height={120}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-700 text-3xl font-bold text-white">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="mt-2 text-lg font-medium text-white">{username}</p>
          </div>
        )}
      </div>

      {/* Username and country overlay */}
      {isActive && (
        <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1 backdrop-blur-sm">
          <span className="font-medium text-white">{username}</span>
          {countryFlag && <span className="text-lg">{countryFlag}</span>}
        </div>
      )}
    </div>
  )
}
