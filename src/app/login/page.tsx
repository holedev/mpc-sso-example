import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
      <div className="text-center w-80">
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 8px 32px rgba(124,58,237,0.4)" }}
        >
          M
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-1">MPClub SSO Demo</h1>
        <p className="text-sm text-slate-400 mb-8">Đăng nhập để tiếp tục</p>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(167,139,250,0.25)" }}
        >
          <form action={async () => { "use server"; await signIn("mpc-sso", { redirectTo: "/dashboard" }) }}>
            <button
              type="submit"
              className="w-full text-white text-sm font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}
            >
              <span className="text-lg">🔐</span>
              Đăng nhập với MPClub SSO
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
