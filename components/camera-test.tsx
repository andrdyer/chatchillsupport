"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CameraView } from "./camera-view"

export function CameraTest() {
  const [cameraActive, setCameraActive] = useState(false)

  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <h2 className="text-xl font-bold">Camera Test</h2>

      <div className="w-full max-w-md h-80 bg-gray-900 rounded-lg overflow-hidden">
        <CameraView isLocal={true} username="Test User" countryFlag="🇺🇸" isActive={cameraActive} />
      </div>

      <Button onClick={() => setCameraActive(!cameraActive)} className="bg-yellow-500 text-black hover:bg-yellow-600">
        {cameraActive ? "Stop Camera" : "Start Camera"}
      </Button>

      <div className="text-sm text-gray-400 mt-4">
        <p>If you can't see your camera:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Make sure you've granted camera permissions in your browser</li>
          <li>Try refreshing the page</li>
          <li>Check if another application is using your camera</li>
          <li>Try a different browser</li>
        </ul>
      </div>
    </div>
  )
}
