"use server"

import { signOut, unstable_update } from "@/auth"

export async function signOutAction() {
  await signOut({ redirectTo: "/login" })
}

export async function refreshTokensAction(refreshToken: string): Promise<
  | { access_token: string; refresh_token: string; expires_at: number }
  | { error: string }
> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.MPCLUB_CLIENT_ID!,
    client_secret: process.env.MPCLUB_CLIENT_SECRET!,
  })

  const res = await fetch("https://auth.mpclub.dev/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  const data = await res.json()

  if (!res.ok) {
    return { error: data?.error_description ?? data?.error ?? "Token refresh failed" }
  }

  const expires_at = Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600)

  // Persist new tokens into the NextAuth JWT cookie so they survive page reloads
  await unstable_update({ access_token: data.access_token, refresh_token: data.refresh_token, expires_at })

  return { access_token: data.access_token, refresh_token: data.refresh_token, expires_at }
}
