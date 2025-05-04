"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng"
import type { ChatClient } from "agora-chat"
import { Loader2, Crown, Menu, Users, Users2, UserIcon as Female, UserIcon as Male, ChevronDown, SkipForward, Music, ChevronUp, Sparkles, MessageSquare, Plus, Play, Pause, FastForwardIcon as Next, SkipBack, Search, Clock, X, Phone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useMobile } from "@/hooks/use-mobile"
import { EmojiPicker } from "@/components/emoji-picker"
import { Sidebar } from "@/components/sidebar"
import { LoginModal } from "@/components/login-modal"
import { ProfileModal } from "@/components/profile-modal"
import { FriendRequestNotification } from "@/components/friend-request-notification"
import { VipPopup } from "@/components/vip-popup"
import { COUNTRIES, SAMPLE_TRACKS } from "@/lib/constants"
import { CameraView } from "@/components/camera-view"
import { ChatNotification } from "@/components/chat-notification"
import { useHMSVideo } from '@/hooks/use-hms-video';
import {
  createClient,
  createChatClient,
  createLocalTracks,
  findMatch,
  getToken,
  joinChannel,
  loginToChat,
  joinChatGroup,
  sendChatMessage,
  leaveChannel,
  logoutFromChat,
  subscribeToUser,
  type LocalTracks,
} from "@/lib/agora-client"

type Message = {
  id: string
  text: string
  sender: "me" | "stranger"
  timestamp: Date
  username?: string
  isMusic?: boolean
  isEmoji?: boolean
  isMeme?: boolean
  isImage?: boolean
  musicData?: {
    title: string
    artist: string
    albumArt?: string
  }
  memeUrl?: string
  imageUrl?: string
}

type User = {
  username: string
  email?: string
  instagram?: string
  snapchat?: string
  facebook?: string
  discord?: string
  isLoggedIn: boolean
  profileImage?: string
  country?: string
  countryFlag?: string
  countryName?: string
  isVIP?: boolean
  subscriptionDate?: string
}

type Friend = {
  id: string
  name: string
  online: boolean
}

type FriendRequest = {
  id: string
  name: string
}

type Gender = "male" | "female" | "any"

type ChatNotificationType = {
  id: string
  message: string
  sender: string
}

export default function ChatChill() {
  const isMobile = useMobile()
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [peopleSkipped, setPeopleSkipped] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [user, setUser] = useState<User | null>(null)
  const [strangerUsername, setStrangerUsername] = useState("Stranger")
  const [strangerCountry, setStrangerCountry] = useState(COUNTRIES[0])
  const [channelName, setChannelName] = useState("")
  const [userId, setUserId] = useState<number>(0)
  const [friends, setFriends] = useState<Friend[]>([])
  const [showFriends, setShowFriends] = useState(false)
  const [inviteFriendId, setInviteFriendId] = useState<string | null>(null)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showMusicPanel, setShowMusicPanel] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<(typeof SAMPLE_TRACKS)[0] | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [myVolume, setMyVolume] = useState(80)
  const [strangerVolume, setStrangerVolume] = useState(80)
  const [microphoneVolume, setMicrophoneVolume] = useState(80)
  const [speakerVolume, setSpeakerVolume] = useState(80)
  const [onlineUsers, setOnlineUsers] = useState(Math.floor(Math.random() * 4000) + 500)
  const [selectedGender, setSelectedGender] = useState<Gender>("any")
  const [showWaitingScreen, setShowWaitingScreen] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [pendingFriendRequest, setPendingFriendRequest] = useState<FriendRequest | null>(null)
  const [showChat, setShowChat] = useState(true) // Default to true for desktop, will be set based on mobile in useEffect
  const [isVipPopupOpen, setIsVipPopupOpen] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [hasStrangerVideo, setHasStrangerVideo] = useState(false)
  const [showTooltips, setShowTooltips] = useState(true)
  const [isSearchingForStranger, setIsSearchingForStranger] = useState(false)
  const [chatNotifications, setChatNotifications] = useState<ChatNotificationType[]>([])
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [spotifySearchQuery, setSpotifySearchQuery] = useState("")
  const [spotifySearchResults, setSpotifySearchResults] = useState<any[]>([])
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([])
  const [freeSongsRemaining, setFreeSongsRemaining] = useState(5)
  const [spotifyPanelOpen, setSpotifyPanelOpen] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [musicUsageCount, setMusicUsageCount] = useState(0)
  const [isVip, setIsVip] = useState(false)
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)
  const [showFriendsList, setShowFriendsList] = useState(false)
  const [showCountrySelector, setShowCountrySelector] = useState(false)
  const [agoraClient, setAgoraClient] = useState<IAgoraRTCClient | null>(null)
  const [chatClient, setChatClient] = useState<ChatClient | null>(null)
  const [localTracks, setLocalTracks] = useState<LocalTracks>({ videoTrack: null, audioTrack: null })
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [chatGroupId, setChatGroupId] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const { 
    isJoining, 
    localPeer, 
    remotePeers, 
    joinRoom, 
    leaveRoom, 
    toggleAudio: toggleHMSAudio, 
    toggleVideo: toggleHMSVideo
  } = useHMSVideo();

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const friendsListRef = useRef<HTMLDivElement | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // Set showChat based on mobile status
  useEffect(() => {
    if (isMobile) {
      setShowChat(false)
    }
  }, [isMobile])

  // Add debug log
  const addDebugLog = (message: string) => {
    console.log(message) // Also log to console for easier debugging
    setDebugLogs((prev) => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`])
  }

  // Clear debug logs
  const clearDebugLogs = () => {
    setDebugLogs([])
  }

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
    }

    // Load friends
    const storedFriends = localStorage.getItem("friends")
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends))
    } else {
      // Default friends for demo
      const defaultFriends = [
        { id: "1", name: "Alex123", online: true },
        { id: "2", name: "Jordan456", online: false },
        { id: "3", name: "Taylor789", online: true },
        { id: "4", name: "Riley42", online: true },
      ]
      setFriends(defaultFriends)
      localStorage.setItem("friends", JSON.stringify(defaultFriends))
    }

    // Create audio element for music
    audioRef.current = new Audio()
    audioRef.current.addEventListener("ended", () => {
      // Play next track when current one ends
      playNextTrack()
    })

    // Simulate online users count increasing
    const interval = setInterval(() => {
      setOnlineUsers((prev) => {
        const change = Math.floor(Math.random() * 10) - 3
        const newValue = prev + change
        // Keep between 500 and 4500
        return Math.max(500, Math.min(4500, newValue))
      })
    }, 5000)

    // Hide tooltips after 10 seconds
    const tooltipTimer = setTimeout(() => {
      setShowTooltips(false)
    }, 10000)

    // Generate a random user ID for this session
    const newUserId = Math.floor(Math.random() * 100000)
    setUserId(newUserId)

    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Check VIP status
    const savedVipState = localStorage.getItem("isVip")
    if (savedVipState === "true") {
      setIsVip(true)
    }

    // Reset music usage count at midnight
    const now = new Date()
    const lastReset = localStorage.getItem("lastMusicReset")
    if (!lastReset || new Date(lastReset).getDate() !== now.getDate()) {
      localStorage.setItem("musicUsageCount", "0")
      localStorage.setItem("lastMusicReset", now.toString())
      setMusicUsageCount(0)
    } else {
      const savedCount = localStorage.getItem("musicUsageCount")
      if (savedCount) {
        setMusicUsageCount(Number.parseInt(savedCount, 10))
      }
    }

    // Check if we need to reset the free songs counter
    const resetDate = localStorage.getItem("freeSongsResetDate")
    if (resetDate) {
      const lastReset = new Date(resetDate)
      const now = new Date()

      // Reset if it's a new day
      if (
        lastReset.getDate() !== now.getDate() ||
        lastReset.getMonth() !== now.getMonth() ||
        lastReset.getFullYear() !== now.getFullYear()
      ) {
        setFreeSongsRemaining(5)
        localStorage.setItem("freeSongsRemaining", "5")
        localStorage.setItem("freeSongsResetDate", now.toISOString())
      } else {
        // Load saved count
        const savedCount = localStorage.getItem("freeSongsRemaining")
        if (savedCount) {
          setFreeSongsRemaining(Number.parseInt(savedCount))
        }
      }
    } else {
      // First time user
      setFreeSongsRemaining(5)
      localStorage.setItem("freeSongsRemaining", "5")
      localStorage.setItem("freeSongsResetDate", new Date().toISOString())
    }

    const initAgoraClients = async () => {
      try {
        // Initialize RTC client
        const rtcClient = await createClient()
        setAgoraClient(rtcClient)

        // Initialize Chat client
        const chatClientInstance = await createChatClient()
        setChatClient(chatClientInstance)

        // Create local tracks
        const tracks = await createLocalTracks()
        setLocalTracks(tracks)

        // Set up event listeners for RTC client
        if (rtcClient) {
          // Handle user joined event
          rtcClient.on("user-joined", (user) => {
            console.log("User joined:", user.uid)
            setRemoteUsers((prevUsers) => [...prevUsers.filter((u) => u.uid !== user.uid), user])
          })

          // Handle user left event
          rtcClient.on("user-left", (user) => {
            console.log("User left:", user.uid)
            setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid))
          })

          // Handle user published event
          rtcClient.on("user-published", async (user, mediaType) => {
            console.log("User published:", user.uid, mediaType)
            await subscribeToUser(rtcClient, user, mediaType)
            setRemoteUsers((prevUsers) => [...prevUsers.filter((u) => u.uid !== user.uid), user])
          })
        }

        // Set up event listeners for Chat client
        if (chatClientInstance) {
          // Handle text message received event
          chatClientInstance.on("message", (message) => {
            console.log("Message received:", message)
            if (message.type === "txt") {
              // Add the message to your chat
              addMessage(message.msg, "stranger", message.from)
            }
          })
        }
      } catch (error) {
        console.error("Error initializing Agora clients:", error)
        setErrorMessage("Failed to initialize video chat. Please try again.")
      }
    }

    initAgoraClients()

    // Add a simple debug function to check the SDK structure
    const debugAgoraChatSDK = async () => {
      try {
        console.log("=== DEBUG: AGORA CHAT SDK STRUCTURE ===")

        // Try to import the SDK directly
        const AgoraChatModule = await import("agora-chat")

        // Log basic information
        console.log("Module type:", typeof AgoraChatModule)
        console.log("Module keys:", Object.keys(AgoraChatModule))

        // Check if we have a default export
        if (AgoraChatModule.default) {
          console.log("Default export exists, type:", typeof AgoraChatModule.default)
          console.log("Default export keys:", Object.keys(AgoraChatModule.default))

          // Check if default export is a constructor
          if (typeof AgoraChatModule.default === "function") {
            console.log("Default export is a constructor function")
          }
        }

        // Check for specific patterns
        const patterns = [
          { path: "AgoraChatModule.create", exists: !!AgoraChatModule.create },
          {
            path: "AgoraChatModule.default.create",
            exists: !!(AgoraChatModule.default && AgoraChatModule.default.create),
          },
          { path: "AgoraChatModule.ChatClient", exists: !!AgoraChatModule.ChatClient },
          {
            path: "AgoraChatModule.default.ChatClient",
            exists: !!(AgoraChatModule.default && AgoraChatModule.default.ChatClient),
          },
          { path: "AgoraChatModule.connection", exists: !!AgoraChatModule.connection },
          {
            path: "AgoraChatModule.default.connection",
            exists: !!(AgoraChatModule.default && AgoraChatModule.default.connection),
          },
        ]

        console.log("SDK Patterns:", patterns)

        // Check the package version if available
        if (AgoraChatModule.VERSION || (AgoraChatModule.default && AgoraChatModule.default.VERSION)) {
          const version = AgoraChatModule.VERSION || (AgoraChatModule.default && AgoraChatModule.default.VERSION)
          console.log("SDK Version:", version)
        }

        console.log("=== END DEBUG ===")
        return true
      } catch (error) {
        console.error("Error in debug function:", error)
        return false
      }
    }

    // Call the debug function
    debugAgoraChatSDK()

    // Clean up on unmount
    return () => {
      const cleanup = async () => {
        if (agoraClient) {
          await leaveChannel(agoraClient, localTracks)
        }
        if (chatClient) {
          await logoutFromChat(chatClient)
        }
      }
      cleanup()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      clearInterval(interval)
      clearTimeout(tooltipTimer)
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Handle clicks outside the friends list to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (friendsListRef.current && !friendsListRef.current.contains(event.target as Node)) {
        setShowFriends(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Apply volume changes to audio elements
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = myVolume / 100
    }
  }, [myVolume])

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Set country from user profile if available
  useEffect(() => {
    if (user?.country) {
      const userCountry = COUNTRIES.find((c) => c.code === user.country)
      if (userCountry) {
        setSelectedCountry(userCountry)
      }
    }
  }, [user])

  // Save login state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString())
    localStorage.setItem("isVip", isVip.toString())
  }, [isLoggedIn, isVip])

  // Save music usage count to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("musicUsageCount", musicUsageCount.toString())
  }, [musicUsageCount])

  // Skip to next person
  const skipToNext = async () => {
    // First leave the current room
    await leaveRoom();

    // Reset state
    setMessages([]);
    setInviteFriendId(null);
    setErrorMessage(null);
    setHasStrangerVideo(false);
    setIsConnected(false);
    setIsConnecting(true);
    setIsSearchingForStranger(true);
    setRemoteUsers([]);

    // Start a new chat
    await startChat();

    setPeopleSkipped((prev) => prev + 1);
  };

  // Generate random stranger info
  const generateRandomStranger = () => {
    const names = ["Alex", "Jordan", "Taylor", "Casey", "Riley", "Morgan", "Jamie", "Quinn"]
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomNum = Math.floor(Math.random() * names.length)
    setStrangerUsername(`${randomName}${randomNum}`)

    // Assign a random country to the stranger
    const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]
    setStrangerCountry(randomCountry)
  }

  // Start chat
  const startChat = async () => {
    // Hide the waiting screen to show the videos
    setShowWaitingScreen(false);
    setIsConnecting(true);
    setIsSearchingForStranger(true);

    try {
      // Join the 100ms room
      await joinRoom(user?.username || 'Guest');
      
      // Generate random stranger info for now
      generateRandomStranger();

      // Update state
      setIsConnected(true);
      setIsConnecting(false);
      setIsSearchingForStranger(false);

      // Add a welcome message
      addMessage("Connected! Say hello to your chat partner.", "stranger", "System");

      // Simulate stranger video after a delay
      setTimeout(() => {
        setHasStrangerVideo(true);
      }, 2000);
    } catch (error) {
      console.error("Error starting chat:", error);
      setIsConnecting(false);
      setIsSearchingForStranger(false);
      addMessage("Error connecting to chat. Please try again.", "stranger", "System");
    }
  };

  // Function to join a video chat
  const joinVideoChat = async (channelName: string, userId: number) => {
    try {
      if (!agoraClient) {
        throw new Error("Agora client not initialized")
      }

      // Get a token for the channel
      const { token, uid } = await getToken(channelName)
      console.log("Got token:", token, "uid:", uid)

      // Join the channel
      const joined = await joinChannel(agoraClient, channelName, token, uid, localTracks)
      if (!joined) {
        throw new Error("Failed to join channel")
      }

      // Set channel name and user ID
      setChannelName(channelName)
      setUserId(uid)

      // Login to Agora Chat
      if (chatClient) {
        const loggedIn = await loginToChat(chatClient, uid.toString())
        if (loggedIn) {
          // Join or create a chat group for this channel
          const groupId = await joinChatGroup(chatClient, channelName)
          if (groupId) {
            setChatGroupId(groupId)
          }
        }
      }

      // Generate random stranger info for now
      // In a real app, this would come from the other user's profile
      generateRandomStranger()

      // Update state
      setIsConnected(true)
      setIsConnecting(false)
      setIsSearchingForStranger(false)

      // Add a welcome message
      addMessage("Connected! Say hello to your chat partner.", "stranger", "System")

      // Simulate stranger video after a delay
      // In a real app, this would happen when the remote user publishes their video
      setTimeout(() => {
        setHasStrangerVideo(true)
      }, 2000)
    } catch (error) {
      console.error("Error joining video chat:", error)
      setIsConnecting(false)
      setIsSearchingForStranger(false)
      addMessage("Error joining chat. Please try again.", "stranger", "System")
    }
  }

  // Stop the chat - MODIFIED to just stop searching but keep showing yourself
  const stopChat = async () => {
    // Leave the 100ms room
    await leaveRoom();

    // Update state
    setIsConnected(false);
    setIsSearchingForStranger(false);
    setHasStrangerVideo(false);
    setRemoteUsers([]);
    addDebugLog("Chat stopped, but camera still active");

    // Show a message that we've stopped searching
    addMessage("Stopped searching. Click Start to begin looking for someone new.", "stranger", "System");
  };

  // Send a message
  const sendMessage = () => {
    if (messageInput.trim() && isConnected) {
      // Add the message to our local state
      addMessage(messageInput, "me", user?.username || "You")

      // Send the message via Agora Chat
      if (chatClient && chatGroupId) {
        sendChatMessage(chatClient, chatGroupId, messageInput).catch((error) => {
          console.error("Error sending chat message:", error)
          addMessage("Failed to send message. Please try again.", "stranger", "System")
        })
      }

      // Clear the input
      setMessageInput("")
    }
  }

  // Add a message to the chat
  const addMessage = (
    text: string,
    sender: "me" | "stranger",
    username?: string,
    isMusic?: boolean,
    isEmoji?: boolean,
    isMeme?: boolean,
    isImage?: boolean,
    musicData?: any,
    memeUrl?: string,
    imageUrl?: string,
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      username,
      isMusic,
      isEmoji,
      isMeme,
      isImage,
      musicData,
      memeUrl,
      imageUrl,
    }

    setMessages((prev) => [...prev, newMessage])

    // If on mobile and the message is from stranger, show notification
    if (isMobile && sender === "stranger" && username !== "System" && !showChat) {
      const notification: ChatNotificationType = {
        id: Date.now().toString(),
        message: text,
        sender: username || "Stranger",
      }
      setChatNotifications((prev) => [...prev, notification])
    }
  }

  // Change country
  const changeCountry = (country: (typeof COUNTRIES)[0]) => {
    setSelectedCountry(country)
    addDebugLog(`Country changed to: ${country.name}`)
    // In a real app, this would filter users by country
    skipToNext()
  }

  // Handle Enter key in chat input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  const toggleFriendsList = () => {
    if (isMobile) {
      setShowFriends(!showFriends)
    } else {
      // For desktop, show a popup
      setShowFriendsList(true)
    }
  }

  // Invite friend to chat
  const inviteFriend = async (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId)
    if (!friend) return

    // Leave current channel
    setMessages([])
    setErrorMessage(null)

    // Join the friend channel
    setIsConnecting(true)
    setStrangerUsername(friend.name)
    setInviteFriendId(friendId)
    setShowWaitingScreen(true)
    setHasStrangerVideo(false)
    addDebugLog(`Inviting friend: ${friend.name}`)

    // Hide friends dropdown after clicking
    setShowFriends(false)

    // Simulate friend receiving notification
    setTimeout(() => {
      setPendingFriendRequest({
        id: userId.toString(),
        name: user?.username || "You",
      })
    }, 1000)

    // Simulate connection
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)
      setShowWaitingScreen(false)

      // Add welcome message
      addMessage(`Starting chat with ${friend.name}`, "stranger", "System")

      // Simulate friend video
      setTimeout(() => {
        setHasStrangerVideo(true)
      }, 1500)
    }, 2000)
  }

  // Call a friend
  const handleCallFriend = async (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId)
    if (!friend) return

    // Leave current channel
    setMessages([])
    setErrorMessage(null)

    // Join the friend channel
    setIsConnecting(true)
    setStrangerUsername(friend.name)
    setInviteFriendId(friendId)
    setShowWaitingScreen(false)
    setHasStrangerVideo(false)
    addDebugLog(`Calling friend: ${friend.name}`)

    // Hide friends dropdown after clicking
    setShowFriends(false)

    // Simulate friend receiving call
    setTimeout(() => {
      setPendingFriendRequest({
        id: userId.toString(),
        name: user?.username || "You",
      })
    }, 1000)

    // Simulate connection
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)
      setShowWaitingScreen(false)

      // Add welcome message
      addMessage(`Voice call with ${friend.name} connected`, "stranger", "System")

      // Simulate friend video
      setTimeout(() => {
        setHasStrangerVideo(true)
      }, 1500)
    }, 2000)
  }

  // Handle friend request response
  const handleFriendRequestAccept = () => {
    addDebugLog("Friend request accepted")
    // In a real app, this would connect the users
    addMessage("Friend request accepted. You are now connected.", "stranger", "System")
  }

  const handleFriendRequestDecline = () => {
    addDebugLog("Friend request declined")
    // In a real app, this would notify the sender
    addMessage("Friend request declined.", "stranger", "System")
  }

  // Update the toggleMusicPanel function to show blurred content with VIP popup inside
  const toggleMusicPanel = () => {
    setShowMusicPanel(!showMusicPanel)

    if (!isPlayingMusic && showMusicPanel) {
      setIsPlayingMusic(true)
      addMessage("Music sharing is now enabled. Select a track to play.", "stranger", "System")
    }
  }

  const connectToSpotify = async () => {
    // In a real implementation, this would redirect to Spotify OAuth
    // For now, we'll simulate a successful connection
    const fakeToken = "simulated-spotify-token-" + Math.random().toString(36).substring(2, 15)
    setSpotifyToken(fakeToken)

    // Load some fake playlists
    setSpotifyPlaylists([
      {
        id: "1",
        name: "My Favorites",
        image: "https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526",
        tracks: 24,
      },
      {
        id: "2",
        name: "Chill Vibes",
        image: "https://i.scdn.co/image/ab67616d0000b273c6f7af36eccd256b4d13cdee",
        tracks: 18,
      },
      {
        id: "3",
        name: "Workout Mix",
        image: "https://i.scdn.co/image/ab67616d0000b273da5d5aeeabacacc1263c0f4b",
        tracks: 32,
      },
    ])

    addDebugLog("Connected to Spotify")
  }

  const searchSpotify = (query: string) => {
    if (!query.trim()) {
      setSpotifySearchResults([])
      return
    }

    // Simulate search results
    const results = SAMPLE_TRACKS.filter(
      (track) =>
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase()),
    )

    setSpotifySearchResults(results)
    addDebugLog(`Searched Spotify for: ${query}`)
  }

  const playSpotifyTrack = (track: any) => {
    // Check if user has free songs remaining or is VIP
    if (!user?.isVIP && freeSongsRemaining <= 0) {
      setIsVipPopupOpen(true)
      return
    }

    // Play the track
    playTrack(track)

    // Decrement free songs if not VIP
    if (!user?.isVIP) {
      setFreeSongsRemaining((prev) => prev - 1)

      // Store in localStorage to persist between sessions
      localStorage.setItem("freeSongsRemaining", String(freeSongsRemaining - 1))
      localStorage.setItem("freeSongsResetDate", new Date().toISOString())
    }
  }

  // Handle file selection
  const handleFileSelect = (file: File, preview: string) => {
    if (isConnected) {
      addMessage("", "me", user?.username || "You", false, false, false, true, undefined, undefined, preview)

      // Simulate a response
      setTimeout(() => {
        addMessage("Nice pic! 👍", "stranger", strangerUsername)
      }, 1500)
    }
  }

  // Send friend request
  const sendFriendRequest = (username: string) => {
    if (!user) {
      // Prompt to login
      addMessage("Please sign in to add friends", "stranger", "System")
      setIsLoginModalOpen(true)
      return
    }

    // In a real app, this would send an API request
    console.log(`Friend request sent to ${username}`)
    addDebugLog(`Friend request sent to: ${username}`)

    // Show a temporary notification
    addMessage(`Friend request sent to ${username}`, "stranger", "System")

    // For demo purposes, add them to friends list after a delay
    setTimeout(() => {
      const newFriend = {
        id: Date.now().toString(),
        name: username,
        online: true,
      }

      const updatedFriends = [...friends, newFriend]
      setFriends(updatedFriends)
      localStorage.setItem("friends", JSON.stringify(updatedFriends))
    }, 2000)
  }

  // Share social media
  const shareSocialMedia = (platform: string) => {
    if (!user) return

    let username = ""
    let platformName = ""

    switch (platform) {
      case "instagram":
        username = user.instagram || ""
        platformName = "Instagram"
        break
      case "snapchat":
        username = user.snapchat || ""
        platformName = "Snapchat"
        break
      case "facebook":
        username = user.facebook || ""
        platformName = "Facebook"
        break
      case "discord":
        username = user.discord || ""
        platformName = "Discord"
        break
      default:
        return
    }

    if (!username) return

    // Add message to chat
    addMessage(`My ${platformName}: ${username}`, "me", user.username || "You")
  }

  // Handle login
  const handleLoginSuccess = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
    setIsLoggedIn(true)

    // Load friends from localStorage or create default if not exists
    const storedFriends = localStorage.getItem("friends")
    if (!storedFriends) {
      // Default friends for demo
      const defaultFriends = [
        { id: "1", name: "Alex123", online: true },
        { id: "2", name: "Jordan456", online: false },
        { id: "3", name: "Taylor789", online: true },
        { id: "4", name: "Riley42", online: true },
      ]
      setFriends(defaultFriends)
      localStorage.setItem("friends", JSON.stringify(defaultFriends))
    }

    addDebugLog(`User logged in: ${userData.username}`)
  }

  // Handle profile update
  const handleProfileUpdate = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
    addDebugLog(`Profile updated for: ${userData.username}`)
  }

  // Handle logout
  const handleLogoutSuccess = () => {
    localStorage.removeItem("user")
    setUser(null)
    setIsLoggedIn(false)
    setIsSidebarOpen(false)
    addDebugLog("User logged out")
  }

  const handleSubscribe = () => {
    const updatedUser = {
      ...user,
      isVIP: true,
      subscriptionDate: new Date().toISOString(),
    }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setIsVipPopupOpen(false)
    setIsVip(true)
  }

  // Remove chat notification
  const removeChatNotification = (id: string) => {
    setChatNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Handle country selection - VIP feature
  const handleCountrySelect = () => {
    // For mobile, keep the existing dropdown implementation
    if (isMobile) {
      // Create a dropdown menu with countries
      const dropdown = document.createElement("select")
      dropdown.className = "absolute bottom-20 left-0 right-0 mx-auto w-3/4 bg-gray-800 text-white p-2 rounded-lg z-50"

      COUNTRIES.forEach((country) => {
        const option = document.createElement("option")
        option.value = country.code
        option.text = `${country.flag} ${country.name}`
        dropdown.appendChild(option)
      })

      dropdown.value = selectedCountry.code
      dropdown.addEventListener("change", (e) => {
        const selected = COUNTRIES.find((c) => c.code === (e.target as HTMLSelectElement).value)
        if (selected) {
          setSelectedCountry(selected)
          document.body.removeChild(dropdown)
        }
      })

      document.body.appendChild(dropdown)
      dropdown.focus()

      // Remove dropdown when clicking outside
      setTimeout(() => {
        const clickHandler = () => {
          if (document.body.contains(dropdown)) {
            document.body.removeChild(dropdown)
            document.removeEventListener("click", clickHandler)
          }
        }
        document.addEventListener("click", clickHandler)
      }, 100)
    } else {
      // For desktop, show a modal popup similar to the friends list
      setShowCountrySelector(true)
    }
  }

  const handleEmojiMemeSelect = (value: string, isEmoji?: boolean, isMeme?: boolean) => {
    if (isConnected) {
      if (isEmoji) {
        addMessage(value, "me", user?.username || "You", false, true, false)
      } else if (isMeme) {
        addMessage("", "me", user?.username || "You", false, false, true, false, undefined, value)
      }
    }
  }

  const playTrack = (track: any) => {
    if (audioRef.current) {
      audioRef.current.src = track.url
      audioRef.current.play()
      setIsAudioPlaying(true)
      setCurrentTrack(track)
      addMessage(`Now playing: ${track.title} by ${track.artist}`, "stranger", "System", true, false, false, false, {
        title: track.title,
        artist: track.artist,
        albumArt: track.albumArt,
      })
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause()
        setIsAudioPlaying(false)
      } else {
        audioRef.current.play()
        setIsAudioPlaying(true)
      }
    }
  }

  const playNextTrack = () => {
    if (currentTrack) {
      const currentIndex = SAMPLE_TRACKS.findIndex((track) => track.id === currentTrack.id)
      const nextIndex = (currentIndex + 1) % SAMPLE_TRACKS.length
      playTrack(SAMPLE_TRACKS[nextIndex])
    }
  }

  const playPrevTrack = () => {
    if (currentTrack) {
      const currentIndex = SAMPLE_TRACKS.findIndex((track) => track.id === currentTrack.id)
      const prevIndex = (currentIndex - 1 + SAMPLE_TRACKS.length) % SAMPLE_TRACKS.length
      playTrack(SAMPLE_TRACKS[prevIndex])
    }
  }

  const handleStartChat = () => {
    // Remove the login check
    // if (!isLoggedIn) {
    //   setIsLoginModalOpen(true)
    //   return
    // }
    startChat()
  }

  const handleStopChat = () => {
    stopChat()
  }

  const toggleMusic = () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true)
      return
    }

    if (!isVip && musicUsageCount >= 5) {
      setIsVipPopupOpen(true)
      return
    }

    if (!isVip) {
      setMusicUsageCount((prev) => prev + 1)
    }

    setShowMusicPanel(!showMusicPanel)
  }

  const callFriend = (friend: Friend) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true)
      return
    }

    // Close the friends list
    setShowFriendsList(false)

    // Connect to the friend
    handleCallFriend(friend.id)
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="mb-8 flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="ChatChill Logo"
            width={500}
            height={250}
            className={isMobile ? "w-64" : "w-96"}
          />
        </div>
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      </div>
    )
  }

  // Function to render the local video
  const renderLocalVideo = () => {
    return (
      <CameraView
        isLocal={true}
        username={user?.username || "You"}
        countryFlag={selectedCountry.flag}
        isActive={true}
        profileImage={user?.profileImage}
        videoTrack={localTracks.videoTrack}
        audioTrack={localTracks.audioTrack}
      />
    )
  }

  // Function to render the remote video
  const renderRemoteVideo = () => {
    // Find the first remote user with a video track
    const remoteUser = remoteUsers.find((user) => user.videoTrack)

    return (
      <CameraView
        isLocal={false}
        username={strangerUsername}
        countryFlag={strangerCountry.flag}
        isActive={hasStrangerVideo && isConnected}
        videoTrack={remoteUser?.videoTrack}
        audioTrack={remoteUser?.audioTrack}
      />
    )
  }

  const toggleAudioAction = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    toggleHMSAudio(!newState); // Note the inversion - isMuted true means audio disabled
    addDebugLog(`Microphone ${isMuted ? "enabled" : "muted"}`);
  };

  const toggleVideoAction = () => {
    const newState = !isVideoOff;
    setIsVideoOff(newState);
    toggleHMSVideo(!newState); // Note the inversion - isVideoOff true means video disabled
    addDebugLog(`Camera ${isVideoOff ? "enabled" : "disabled"}`);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <style jsx global>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out forwards;
        }

        .no-outline-button {
          border: none;
          outline: none;
          box-shadow: none;
        }
      `}</style>

      {/* Fixed logo in top left corner - only visible on desktop */}
      {!isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Image src="/images/logo.png" alt="ChatChill Logo" width={200} height={80} className="h-24 w-auto" priority />
        </div>
      )}

      {/* Fixed header with menu buttons - MOBILE ONLY */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-2 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="ChatChill Logo" width={200} height={80} className="h-24 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 border-0"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="h-5 w-5 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-full border-0 ${user?.isVIP ? "bg-yellow-500 text-black" : "bg-black/30 hover:bg-black/50"}`}
              onClick={() => setIsVipPopupOpen(true)}
            >
              <Crown className={`h-5 w-5 ${user?.isVIP ? "text-black" : "text-yellow-500"}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 border-0"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      )}

      {/* Main content area - videos and chat */}
      <div className="flex flex-1">
        {/* Videos container - left side */}
        <div className={`flex flex-col ${isMobile ? "w-full pt-14" : showChat ? "w-[calc(100%-320px)]" : "w-full"}`}>
          {/* Videos row - column on mobile */}
          <div className="flex flex-col md:flex-row flex-1">
            {/* Stranger video - top on mobile, left on desktop */}
            <div className="relative w-full md:w-1/2 h-1/2 md:h-full bg-black">
              {showWaitingScreen ? (
                <div className="flex h-full flex-col items-center justify-center p-4">
                  <div className="flex items-center gap-3 text-green-500 mb-8">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-xl font-medium">{onlineUsers.toLocaleString()} users online</p>
                  </div>
                  {!user ? (
                    <div className="flex flex-col items-center gap-4 mb-8">
                      <Button
                        className="bg-yellow-500 text-black hover:bg-yellow-600 px-8 max-w-[200px]"
                        onClick={() => setIsLoginModalOpen(true)}
                      >
                        Sign In / Create Account
                      </Button>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <a href="#" className="inline-block h-12" aria-label="Download on the App Store">
                          <div className="flex items-center justify-center h-full px-4 py-2 bg-black text-white rounded-lg border border-gray-700">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="mr-2">
                              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.33-.89 3.55-.77 1.5.16 2.63.77 3.38 1.95-3.03 1.72-2.39 5.8.84 6.75-.61 1.62-1.42 3.26-2.85 4.24zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.01-1.76 4.04-3.74 4.25z" />
                            </svg>
                            <span>App Store</span>
                          </div>
                        </a>
                        <a href="#" className="inline-block h-12" aria-label="Get it on Google Play">
                          <div className="flex items-center justify-center h-full px-4 py-2 bg-black text-white rounded-lg border border-gray-700">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                              <path d="M3.609 1.814L13.792 12 3.609 22.186c-.181.181-.29.435-.29.71 0 .544.46 1.004 1.004 1.004.275 0 .529-.109.71-.29l10.8-10.8c.181-.181.29-.435.29-.71s-.109-.529-.29-.71l-10.8-10.8c-.181-.181-.435-.29-.71-.29-.544 0-1.004.46-1.004 1.004 0 .275.109.529.29.71z" />
                            </svg>
                            <span>Google Play</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 mb-8">
                      {!user.isVIP && (
                        <Button
                          onClick={() => setIsVipPopupOpen(true)}
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-medium"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Upgrade to VIP
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-full">
                  {/* Searching overlay */}
                  {isSearchingForStranger && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                      <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
                      <p className="text-xl font-medium text-white mb-2">Searching for someone to chat with...</p>
                      <p className="text-gray-400">This may take a moment</p>
                    </div>
                  )}
                  {renderRemoteVideo()}
                </div>
              )}

              {isConnected && (
                <div className="absolute bottom-4 left-4 text-sm text-gray-400">Click to end the current chat</div>
              )}
            </div>

            {/* User video - bottom on mobile, right on desktop */}
            <div className="relative w-full md:w-1/2 h-1/2 md:h-full bg-black">
              {renderLocalVideo()}

              {/* Top menu buttons - DESKTOP ONLY */}
              {!isMobile && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button
                    className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center"
                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <button
                    className={`h-10 w-10 rounded-full ${user?.isVIP ? "bg-yellow-500 text-black" : "bg-black/50 backdrop-blur-sm text-white"} flex items-center justify-center`}
                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                    onClick={() => setIsVipPopupOpen(true)}
                  >
                    <Crown className={`h-5 w-5 ${user?.isVIP ? "text-black" : "text-yellow-500"}`} />
                  </button>
                  <button
                    className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center"
                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom controls - always visible */}
          <div className="bg-gray-900 border-t border-gray-800 sticky bottom-0 left-0 right-0 z-10">
            <div className="grid grid-cols-2 gap-2 p-2">
              <Button
                variant="default"
                className="h-12 bg-green-500 hover:bg-green-600 flex items-center justify-center"
                onClick={showWaitingScreen ? handleStartChat : skipToNext}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <SkipForward className="mr-2 h-5 w-5" />
                )}
                {showWaitingScreen ? "Start" : "Next Chat"}
              </Button>
              <Button
                variant="default"
                className="h-12 bg-red-500 hover:bg-red-600 flex items-center justify-center"
                onClick={handleStopChat}
              >
                Stop
              </Button>

              <Button
                variant="outline"
                className={`h-12 bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white ${isMobile ? "border-0" : ""}`}
                onClick={handleCountrySelect}
              >
                <span className="text-xl mr-2">{selectedCountry.flag}</span>
                <span>Country</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`h-12 w-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white ${isMobile ? "border-0" : ""}`}
                  >
                    {selectedGender === "male" ? (
                      <Male className="mr-2 h-5 w-5 text-blue-400" />
                    ) : selectedGender === "female" ? (
                      <Female className="mr-2 h-5 w-5 text-pink-400" />
                    ) : (
                      <Users2 className="mr-2 h-5 w-5 text-purple-400" />
                    )}
                    <span>I am</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                  <DropdownMenuItem
                    onClick={() => setSelectedGender("male")}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-700"
                  >
                    <Male className="h-5 w-5 text-blue-400" />
                    <span>Male</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedGender("female")}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-700"
                  >
                    <Female className="h-5 w-5 text-pink-400" />
                    <span>Female</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedGender("any")}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-700"
                  >
                    <Users2 className="h-5 w-5 text-purple-400" />
                    <span>Any</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant={showFriends ? "default" : "outline"}
                className={`h-12 ${showFriends ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-800 hover:bg-gray-700"} flex items-center justify-center text-white ${isMobile ? "border-0" : ""}`}
                onClick={toggleFriendsList}
              >
                <Users className="mr-2 h-5 w-5" />
                <span>Friends</span>
                <span className="ml-2">
                  {showFriends ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </Button>

              <Button
                variant={spotifyPanelOpen ? "default" : "outline"}
                className={`h-12 w-full ${spotifyPanelOpen ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-gray-700"} flex items-center justify-center text-white ${isMobile ? "border-0" : ""}`}
                onClick={() => setSpotifyPanelOpen(!spotifyPanelOpen)}
              >
                <Music className="mr-2 h-5 w-5" />
                <span>Music</span>
                {user?.isVIP ? null : <span className="ml-1 text-xs text-gray-400">({freeSongsRemaining} free)</span>}
              </Button>
            </div>

            {showFriends && (
              <div
                ref={friendsListRef}
                className="fixed left-0 right-0 bottom-[calc(100%-50vh)] md:bottom-full z-20 bg-gray-800 border border-gray-700 rounded-t-lg shadow-lg max-h-[50vh] md:max-h-80 overflow-y-auto w-full md:w-[calc(100%-320px)]"
              >
                <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium">Friends ({friends.length})</h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Friend</span>
                  </Button>
                </div>
                <div className="divide-y divide-gray-700">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center font-medium">
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${friend.online ? "bg-green-500" : "bg-gray-500"}`}
                          ></span>
                        </div>
                        <span>{friend.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {friend.online && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-green-500"
                            onClick={() => callFriend(friend)}
                          >
                            <Phone className="h-4 w-4" />
                            <span>Call</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => inviteFriend(friend.id)}
                          disabled={!friend.online}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Chat</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat panel - right side for desktop, slide-in for mobile */}
        {!isMobile && showChat && (
          <div className="hidden md:flex md:flex-col w-80 bg-gray-800 border-gray-700 border-l">
            <div className="border-gray-700 border-b p-3 flex items-center justify-between">
              <h2 className="font-medium">
                {isConnected ? `Speaking with ${strangerUsername}` : `Welcome, ${user?.username || "Guest"}`}
              </h2>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-sm">
                    {isConnected ? "No messages yet. Say hello!" : "Connect with someone to start chatting"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col">
                      {message.sender === "stranger" && message.username !== "System" && (
                        <div className="mb-1 flex items-center gap-2">
                          <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-700">
                            <div className="h-full w-full flex items-center justify-center text-white font-bold">
                              {message.username?.charAt(0).toUpperCase() || "S"}
                            </div>
                          </div>
                          <span className="text-sm font-medium">{message.username}</span>
                          {message.sender === "stranger" && message.username !== "System" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-auto h-6 rounded-full bg-yellow-500 px-2 py-0 text-xs text-black hover:bg-yellow-600"
                              onClick={() => sendFriendRequest(message.username || "Unknown")}
                            >
                              +Invite
                            </Button>
                          )}
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[90%] rounded-lg p-2 text-sm",
                          message.sender === "me" ? "ml-auto bg-gray-700" : "bg-gray-700",
                          message.username === "System" ? "bg-gray-600 text-gray-300" : "",
                        )}
                      >
                        {message.isMusic && message.musicData ? (
                          <div className="flex flex-col">
                            <p className="mb-2">{message.text}</p>
                            <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-md">
                              <img
                                src={message.musicData.albumArt || "/placeholder.svg"}
                                alt={message.musicData.title}
                                className="h-10 w-10 rounded-md"
                              />
                              <div>
                                <p className="font-medium text-xs">{message.musicData.title}</p>
                                <p className="text-xs text-gray-400">{message.musicData.artist}</p>
                              </div>
                            </div>
                          </div>
                        ) : message.isEmoji ? (
                          <span className="text-2xl">{message.text}</span>
                        ) : message.isMeme ? (
                          <div className="w-full overflow-hidden rounded-md">
                            <img src={message.memeUrl || "/placeholder.svg"} alt="Meme" className="w-full h-auto" />
                          </div>
                        ) : message.isImage ? (
                          <div className="w-full overflow-hidden rounded-md">
                            <img
                              src={message.imageUrl || "/placeholder.svg"}
                              alt="Shared image"
                              className="w-full h-auto"
                            />
                          </div>
                        ) : (
                          message.text
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="border-t border-gray-700 p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  disabled={!isConnected}
                  className="bg-gray-700 border-gray-600 focus-visible:ring-gray-500 text-white"
                />
                <EmojiPicker onSelect={handleEmojiMemeSelect} />
                <Button
                  variant="default"
                  size="icon"
                  className="h-10 w-10 bg-yellow-500 hover:bg-yellow-600 text-black"
                  onClick={sendMessage}
                  disabled={!isConnected || !messageInput.trim()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile chat panel - slide from left */}
        {isMobile && showChat && (
          <div className="fixed inset-0 z-30 flex">
            <div className="w-full max-w-[85%] bg-gray-900 h-full flex flex-col animate-slide-in-left">
              <div className="flex items-center justify-between p-3 border-b border-gray-800">
                <h2 className="font-medium">
                  {isConnected ? `Speaking with ${strangerUsername}` : `Welcome, ${user?.username || "Guest"}`}
                </h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => setShowChat(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-sm">
                      {isConnected ? "No messages yet. Say hello!" : "Connect with someone to start chatting"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((message) => (
                      <div key={message.id} className="flex flex-col">
                        {message.sender === "stranger" && message.username !== "System" && (
                          <div className="mb-1 flex items-center gap-2">
                            <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-700">
                              <div className="h-full w-full flex items-center justify-center text-white font-bold">
                                {message.username?.charAt(0).toUpperCase() || "S"}
                              </div>
                            </div>
                            <span className="text-sm font-medium">{message.username}</span>
                            {message.sender === "stranger" && message.username !== "System" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-auto h-6 rounded-full bg-yellow-500 px-2 py-0 text-xs text-black hover:bg-yellow-600"
                                onClick={() => sendFriendRequest(message.username || "Unknown")}
                              >
                                +Invite
                              </Button>
                            )}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[90%] rounded-lg p-2 text-sm",
                            message.sender === "me" ? "ml-auto bg-gray-700" : "bg-gray-700",
                            message.username === "System" ? "bg-gray-600 text-gray-300" : "",
                          )}
                        >
                          {message.isMusic && message.musicData ? (
                            <div className="flex flex-col">
                              <p className="mb-2">{message.text}</p>
                              <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-md">
                                <img
                                  src={message.musicData.albumArt || "/placeholder.svg"}
                                  alt={message.musicData.title}
                                  className="h-10 w-10 rounded-md"
                                />
                                <div>
                                  <p className="font-medium text-xs">{message.musicData.title}</p>
                                  <p className="text-xs text-gray-400">{message.musicData.artist}</p>
                                </div>
                              </div>
                            </div>
                          ) : message.isEmoji ? (
                            <span className="text-2xl">{message.text}</span>
                          ) : message.isMeme ? (
                            <div className="w-full overflow-hidden rounded-md">
                              <img src={message.memeUrl || "/placeholder.svg"} alt="Meme" className="w-full h-auto" />
                            </div>
                          ) : message.isImage ? (
                            <div className="w-full overflow-hidden rounded-md">
                              <img
                                src={message.imageUrl || "/placeholder.svg"}
                                alt="Shared image"
                                className="w-full h-auto"
                              />
                            </div>
                          ) : (
                            message.text
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                    className="bg-gray-700 border-gray-600 focus-visible:ring-gray-500 text-white"
                  />
                  <EmojiPicker onSelect={handleEmojiMemeSelect} />
                  <Button
                    variant="default"
                    size="icon"
                    className="h-10 w-10 bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={sendMessage}
                    disabled={!isConnected || !messageInput.trim()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-black/50 flex-1" onClick={() => setShowChat(false)}></div>
          </div>
        )}

        {/* Spotify Panel */}
        {spotifyPanelOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-medium flex items-center">
                  <Music className="mr-2 h-5 w-5 text-green-500" />
                  Spotify Music
                </h2>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSpotifyPanelOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {!spotifyToken ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                    <p className="text-center text-gray-400 mb-4">
                      Connect your Spotify account to play and share music with your chat partner.
                    </p>
                    <Button onClick={connectToSpotify} className="bg-green-500 hover:bg-green-600 text-white">
                      Connect to Spotify
                    </Button>
                    {!user?.isVIP && (
                      <p className="text-sm text-gray-500 mt-2">
                        Free users get 5 songs per day. Upgrade to VIP for unlimited music!
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Search for songs, artists, or albums"
                          value={spotifySearchQuery}
                          onChange={(e) => {
                            setSpotifySearchQuery(e.target.value)
                            searchSpotify(e.target.value)
                          }}
                          className="pl-10 bg-gray-800 border-gray-700"
                        />
                      </div>

                      {spotifySearchResults.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-3">Search Results</h3>
                          <div className="grid gap-2">
                            {spotifySearchResults.map((track) => (
                              <div
                                key={track.id}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer"
                                onClick={() => playSpotifyTrack(track)}
                              >
                                <img
                                  src={track.albumArt || "/placeholder.svg"}
                                  alt={track.title}
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{track.title}</p>
                                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Play className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-medium mb-3">Your Playlists</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {spotifyPlaylists.map((playlist) => (
                            <div
                              key={playlist.id}
                              className="bg-gray-800 rounded-md overflow-hidden hover:bg-gray-750 cursor-pointer"
                            >
                              <img
                                src={playlist.image || "/placeholder.svg"}
                                alt={playlist.name}
                                className="w-full aspect-square object-cover"
                              />
                              <div className="p-3">
                                <p className="font-medium truncate">{playlist.name}</p>
                                <p className="text-xs text-gray-400">{playlist.tracks} tracks</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-3">Recommended Tracks</h3>
                      <div className="grid gap-2">
                        {SAMPLE_TRACKS.map((track) => (
                          <div
                            key={track.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer"
                            onClick={() => playSpotifyTrack(track)}
                          >
                            <img
                              src={track.albumArt || "/placeholder.svg"}
                              alt={track.title}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{track.title}</p>
                              <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {currentTrack && (
                <div className="border-t border-gray-700 p-3 bg-gray-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentTrack.albumArt || "/placeholder.svg"}
                      alt={currentTrack.title}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{currentTrack.title}</p>
                      <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={playPrevTrack}>
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 bg-green-500 text-white hover:bg-green-600 rounded-full"
                        onClick={togglePlayPause}
                      >
                        {isAudioPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={playNextTrack}>
                        <Next className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!user?.isVIP && (
                <div className="border-t border-gray-700 p-3 bg-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{freeSongsRemaining} free songs remaining today</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-yellow-500 text-black hover:bg-yellow-600"
                    onClick={() => setIsVipPopupOpen(true)}
                  >
                    <Crown className="mr-1 h-4 w-4" />
                    Upgrade to VIP
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
          onLogout={handleLogoutSuccess}
          microphoneVolume={microphoneVolume}
          speakerVolume={speakerVolume}
          onMicrophoneVolumeChange={setMicrophoneVolume}
          onSpeakerVolumeChange={setSpeakerVolume}
          debugLogs={debugLogs}
          clearDebugLogs={clearDebugLogs}
          onEditProfile={() => {
            setIsSidebarOpen(false)
            user ? setIsProfileModalOpen(true) : setIsLoginModalOpen(true)
          }}
        />

        {/* Login Modal */}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLoginSuccess} />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleProfileUpdate}
          user={user}
        />

        {/* Friend Request Notification */}
        {pendingFriendRequest && (
          <FriendRequestNotification
            friendName={pendingFriendRequest.name}
            onAccept={handleFriendRequestAccept}
            onDecline={handleFriendRequestDecline}
          />
        )}

        {/* VIP Popup */}
        <VipPopup
          isOpen={isVipPopupOpen}
          onClose={() => setIsVipPopupOpen(false)}
          onSubscribe={handleSubscribe}
          isVIP={user?.isVIP || false}
          subscriptionDate={user?.subscriptionDate}
        />

        {/* Chat notifications for mobile */}
        {chatNotifications.map((notification) => (
          <ChatNotification
            key={notification.id}
            message={notification.message}
            sender={notification.sender}
            onOpen={() => setShowChat(true)}
            onDismiss={() => removeChatNotification(notification.id)}
            autoDismiss={true}
            dismissTimeout={3000}
          />
        ))}

        {/* Hidden audio element for music playback */}
        <audio ref={audioRef} className="hidden" />

        {/* Desktop Friends List Popup */}
        {!isMobile && showFriendsList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-medium">Friends ({friends.length})</h2>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowFriendsList(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search friends..."
                    className="w-full pl-10 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {friends.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">You don't have any friends yet</div>
                ) : (
                  <div className="divide-y divide-gray-700">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${friend.online ? "bg-green-500" : "bg-gray-500"}`}
                            ></span>
                          </div>
                          <div>
                            <p className="font-medium">{friend.name}</p>
                            <p className="text-xs text-gray-400">{friend.online ? "Online" : "Offline"}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {friend.online && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-gray-700 hover:bg-gray-700 text-green-500"
                              onClick={() => callFriend(friend)}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent border-gray-700 hover:bg-gray-700"
                            onClick={() => inviteFriend(friend.id)}
                            disabled={!friend.online}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Country Selector Popup */}
        {!isMobile && showCountrySelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-medium">Select Country</h2>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowCountrySelector(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    className="w-full pl-10 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {COUNTRIES.map((country) => (
                    <div
                      key={country.code}
                      className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        setSelectedCountry(country)
                        setShowCountrySelector(false)
                      }}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <span className="text-white">{country.name}</span>
                      {country.code === selectedCountry.code && (
                        <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
