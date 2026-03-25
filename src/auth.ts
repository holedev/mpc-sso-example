import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    access_token?: string
    refresh_token?: string
    expires_at?: number
  }
}

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  providers: [
    {
      id: "mpc-sso",
      name: "MPClub SSO",
      type: "oidc",
      issuer: "https://auth.mpclub.dev",
      clientId: process.env.MPCLUB_CLIENT_ID,
      clientSecret: process.env.MPCLUB_CLIENT_SECRET,
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
    },
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, trigger, session }) {
      if (account) {
        token.access_token = account.access_token
        token.refresh_token = account.refresh_token
        token.expires_at = account.expires_at
      }
      // Persist new tokens when unstable_update() is called after a manual refresh
      if (trigger === "update" && session) {
        if (session.access_token) token.access_token = session.access_token
        if (session.refresh_token) token.refresh_token = session.refresh_token
        if (session.expires_at) token.expires_at = session.expires_at
      }

      // Auto-refresh when access token is expired
      if (token.expires_at && Date.now() >= (token.expires_at as number) * 1000) {
        try {
          const params = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: token.refresh_token as string,
            client_id: process.env.MPCLUB_CLIENT_ID!,
            client_secret: process.env.MPCLUB_CLIENT_SECRET!,
          })

          const res = await fetch("https://auth.mpclub.dev/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
          })

          const newTokens = await res.json()
          if (!res.ok) throw newTokens
          token.access_token = newTokens.access_token
          token.refresh_token = newTokens.refresh_token ?? token.refresh_token
          token.expires_at = Math.floor(Date.now() / 1000) + newTokens.expires_in
        } catch {
          // Refresh failed — force re-login on next request
          token.access_token = undefined
          token.refresh_token = undefined
          token.expires_at = undefined
        }
      }
      return token
    },
    async session({ session, token }) {
      session.access_token = token.access_token as string | undefined
      session.refresh_token = token.refresh_token as string | undefined
      session.expires_at = token.expires_at as number | undefined
      return session
    },
  },
})
