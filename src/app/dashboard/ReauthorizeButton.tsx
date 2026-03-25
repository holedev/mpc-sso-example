"use client"

import { useState } from "react"
import { refreshTokensAction } from "./actions"

interface ReauthorizeButtonProps {
  refreshToken?: string
  onNewTokens?: (accessToken: string, refreshToken?: string, expiresAt?: number) => void
}

export default function ReauthorizeButton({ refreshToken, onNewTokens }: ReauthorizeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  // Track the latest refresh token — rotates after each successful use
  const [currentRefreshToken, setCurrentRefreshToken] = useState(refreshToken)

  const handleReauthorize = async () => {
    if (!currentRefreshToken) return
    setLoading(true)
    setNewToken(null)
    setError(null)

    try {
      const result = await refreshTokensAction(currentRefreshToken)
      if ("error" in result) {
        setError(result.error)
      } else {
        setNewToken(result.access_token)
        setCurrentRefreshToken(result.refresh_token)
        onNewTokens?.(result.access_token, result.refresh_token, result.expires_at)
      }
    } catch {
      setError("Network error — could not reach auth server")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!newToken) return
    await navigator.clipboard.writeText(newToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full">
      <button
        onClick={handleReauthorize}
        disabled={loading || !currentRefreshToken}
        className="w-full bg-gradient-to-r from-purple-700 to-purple-500 text-white text-sm font-semibold py-2.5 rounded-xl mb-2 disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-purple-700/30"
      >
        {loading ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Refreshing…
          </>
        ) : (
          <>🔄 Re-authorize</>
        )}
      </button>

      {newToken && (
        <div className="mt-2 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
          <div className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1.5">New Access Token</div>
          <div className="font-mono text-xs text-green-300 break-all leading-relaxed bg-black/30 rounded-lg px-2.5 py-2 max-h-16 overflow-hidden">
            {newToken}
          </div>
          <button
            onClick={handleCopy}
            className="mt-2 bg-green-500/20 text-green-300 border border-green-500/30 text-xs px-3 py-1 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <div className="text-red-400 text-xs">{error}</div>
        </div>
      )}
    </div>
  )
}
