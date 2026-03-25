"use client"

import { useState } from "react"
import TokenCard from "./TokenCard"
import ReauthorizeButton from "./ReauthorizeButton"
import { signOutAction } from "./actions"

interface DashboardClientProps {
  name?: string | null
  email?: string | null
  initials: string
  initialAccessToken?: string
  initialRefreshToken?: string
  initialExpiresAt?: number
}

export default function DashboardClient({
  name,
  email,
  initials,
  initialAccessToken,
  initialRefreshToken,
  initialExpiresAt,
}: DashboardClientProps) {
  const [accessToken, setAccessToken] = useState(initialAccessToken)
  const [refreshToken, setRefreshToken] = useState(initialRefreshToken)
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt)

  const handleNewTokens = (newAccessToken: string, newRefreshToken?: string, newExpiresAt?: number) => {
    setAccessToken(newAccessToken)
    if (newRefreshToken) setRefreshToken(newRefreshToken)
    if (newExpiresAt !== undefined) setExpiresAt(newExpiresAt)
  }

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "400px 1fr", alignItems: "start" }}>

      {/* Left: Profile card */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(167,139,250,0.2)" }}
      >
        <div
          className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}
        >
          {initials}
        </div>
        <div className="text-slate-100 text-sm font-semibold mb-0.5">{name}</div>
        <div className="text-slate-400 text-xs mb-5">{email}</div>

        <ReauthorizeButton refreshToken={refreshToken} onNewTokens={handleNewTokens} />

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full text-purple-200 text-sm py-2.5 rounded-xl mt-2 hover:bg-white/5 transition-colors"
            style={{ border: "1px solid rgba(124,58,237,0.4)" }}
          >
            Đăng xuất
          </button>
        </form>
      </div>

      {/* Right: Token cards */}
      <div className="flex flex-col gap-4">
        <TokenCard
          label="Access Token"
          token={accessToken}
          badge="Active"
          badgeColor="green"
          expiresAt={expiresAt}
        />
        <TokenCard
          label="Refresh Token"
          token={refreshToken}
          badge="Stored"
          badgeColor="purple"
        />
      </div>

    </div>
  )
}
