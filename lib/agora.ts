import type { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"

export interface IAgoraRTCClient {
  join(appId: string, channel: string, token: string | null, uid: number | null): Promise<number>
  leave(): Promise<void>
  publish(tracks: any): Promise<void>
  unpublish(tracks: any): Promise<void>
  subscribe(user: IAgoraRTCRemoteUser, mediaType: "audio" | "video"): Promise<void>
  unsubscribe(user: IAgoraRTCRemoteUser, mediaType: "audio" | "video"): Promise<void>
  on(event: string, callback: (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => void): void
  off(event: string, callback: (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => void): void
  removeAllListeners(): void
  setClientRole(role: "audience" | "host"): Promise<void>
  setRemoteVideoStreamType(user: IAgoraRTCRemoteUser, streamType: 0 | 1): Promise<void>
}

export interface IAgoraRTCRemoteUser {
  uid: number
  audioTrack: any
  videoTrack: any
  hasAudio: boolean
  hasVideo: boolean
  setVolume(volume: number): void
}

export type LocalTracks = {
  videoTrack: ICameraVideoTrack | null
  audioTrack: IMicrophoneAudioTrack | null
}
