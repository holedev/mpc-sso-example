import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardClient from "./DashboardClient"

export default async function Dashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const initials = session.user?.name?.charAt(0)?.toUpperCase() ?? "?"

  return (
    <main className="min-h-screen p-6" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            M
          </div>
          <span className="text-purple-300 font-bold text-base">MPClub SSO Demo</span>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #4ade80" }} title="Connected" />
      </nav>

      <DashboardClient
        name={session.user?.name}
        email={session.user?.email}
        initials={initials}
        initialAccessToken={session.access_token}
        initialRefreshToken={session.refresh_token}
        initialExpiresAt={session.expires_at}
      />
    </main>
  )
}
