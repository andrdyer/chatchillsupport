"use client"

import { Crown, X, Sparkles, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VipPopupProps {
  isOpen: boolean
  onClose: () => void
  onSubscribe: () => void
  isVIP: boolean
  subscriptionDate?: string
}

export function VipPopup({ isOpen, onClose, onSubscribe, isVIP, subscriptionDate }: VipPopupProps) {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-gray-900 border-none text-white max-w-md rounded-lg overflow-hidden shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Close button - ONLY ONE */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full h-7 w-7 p-0 bg-black/40 z-10 hover:bg-black/60"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Content with gradient background */}
        <div className="relative z-1 p-6 pt-12">
          {/* Header with animated crown */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-full shadow-lg animate-pulse">
              <Crown className="h-8 w-8 text-black" />
            </div>
          </div>

          <h2 className="text-center text-2xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
            ChatChill VIP
          </h2>

          <p className="text-center text-gray-300 mb-6">Video & Chill With Randos in Premium Style</p>

          {isVIP ? (
            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-400 flex items-center justify-center">
                <Crown className="mr-2 h-5 w-5" />
                Active VIP Subscription
              </h3>
              <div className="flex justify-center mt-2">
                <div className="px-3 py-1 bg-black/30 rounded-full text-sm text-green-300">
                  Subscribed since: {formatDate(subscriptionDate)}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-1 rounded-full">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                  <p>Filter users by gender, country, and interests</p>
                </div>
                <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg">
                  <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-1 rounded-full">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                  <p>Music control - override other users' music</p>
                </div>
                <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-1 rounded-full">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                  <p>Ad-free experience with priority matching</p>
                </div>
                <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-1 rounded-full">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                  <p>Exclusive profile badge and chat effects</p>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-lg mb-6 border border-gray-700/50">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-gray-200 flex items-center">
                    <Star className="mr-2 h-4 w-4 text-yellow-400" />
                    Monthly subscription
                  </h3>
                  <span className="text-xl font-bold text-white">$3.99</span>
                </div>
                <p className="text-xs text-gray-400">Cancel anytime. Billed monthly.</p>
              </div>

              <Button
                className="w-full h-12 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold rounded-lg shadow-lg transition-all duration-300 hover:shadow-yellow-500/20 hover:shadow-xl"
                onClick={onSubscribe}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Upgrade to VIP Now
              </Button>
            </>
          )}
        </div>

        {/* Decorative bottom elements */}
        <div className="h-2 w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600"></div>
      </div>
    </div>
  )
}
