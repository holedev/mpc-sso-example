"use client"

import { useState } from "react"

interface TokenCardProps {
  label: string
  token?: string
  badge: string
  badgeColor?: "green" | "purple"
  expiresAt?: number
}

export default function TokenCard({ label, token, badge, badgeColor = "green", expiresAt }: TokenCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = async () => {
    if (!token) return
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const expiryLabel = expiresAt
    ? (() => {
        const secsLeft = expiresAt - Math.floor(Date.now() / 1000)
        if (secsLeft <= 0) return "Expired"
        const m = Math.floor(secsLeft / 60)
        const s = secsLeft % 60
        return `Expires in ${m}m ${s}s`
      })()
    : "Long-lived · used to re-authorize"

  const badgeStyles =
    badgeColor === "green"
      ? "bg-green-500/15 text-green-400 border border-green-500/30"
      : "bg-purple-500/15 text-purple-300 border border-purple-500/30"

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-purple-200/20 rounded-2xl p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-1">{label}</div>
          <div className="text-slate-500 text-xs">{expiryLabel}</div>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full ${badgeStyles}`}>{badge}</span>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left bg-black/35 rounded-lg px-3 py-2.5 font-mono text-xs text-purple-300 break-all leading-relaxed cursor-pointer hover:bg-black/50 transition-colors"
        style={{ maxHeight: expanded ? "none" : "4rem", overflow: "hidden" }}
        title={expanded ? "Click to collapse" : "Click to expand"}
      >
        {token ?? "—"}
      </button>

      <div className="mt-3">
        <button
          onClick={handleCopy}
          disabled={!token}
          className="bg-linear-to-r from-purple-700 to-purple-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  )
}
