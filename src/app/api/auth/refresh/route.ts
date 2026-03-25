import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { refresh_token } = await req.json()

  if (!refresh_token) {
    return NextResponse.json({ error: "refresh_token is required" }, { status: 400 })
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token,
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
    return NextResponse.json({ error: data }, { status: res.status })
  }

  return NextResponse.json(data)
}
