# MPClub SSO Demo

A Next.js demo application showing how to integrate [MPClub SSO](https://auth.mpclub.dev) (OpenID Connect) into your app using NextAuth v5.

## Tech Stack

- **Next.js** 16.2 (App Router)
- **NextAuth** 5.0 beta (OIDC)
- **React** 19
- **Tailwind CSS** v4
- **TypeScript** 5

## Prerequisites

- Node.js 18+
- An MPClub OAuth application — you need a `client_id` and `client_secret` from the MPClub developer portal

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random secret used to encrypt the NextAuth session cookie. Generate with: `openssl rand -base64 32` |
| `MPCLUB_CLIENT_ID` | OAuth client ID from MPClub developer portal |
| `MPCLUB_CLIENT_SECRET` | OAuth client secret from MPClub developer portal |

## Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) in your browser.

## Authentication Flow

```
User visits /login
      │
      ▼
Clicks "Login with MPClub"
      │
      ▼
Redirected to https://auth.mpclub.dev
      │
      ▼
User authenticates on MPClub
      │
      ▼
Redirected back to /api/auth/callback
      │
      ▼
NextAuth exchanges code for tokens
      │
      ▼
Session stored in encrypted cookie
      │
      ▼
User lands on /dashboard
```

## Pages & Routes

| Path | Description |
|---|---|
| `/login` | Login page with MPClub SSO button |
| `/dashboard` | Protected page — shows user profile and OAuth tokens |
| `GET /api/auth/[...nextauth]` | NextAuth handler (callback, signout, session) |
| `POST /api/auth/refresh` | Token refresh endpoint — accepts `{ refresh_token }` in body |

The `/dashboard` route is protected by middleware. Unauthenticated users are redirected to `/login`.

## Token Management

The dashboard displays:

- **Access token** — short-lived token (1 hour), shown with expiration countdown
- **Refresh token** — long-lived token for getting new access tokens

Use the **Re-authorize** button to manually refresh tokens. The app uses NextAuth's `unstable_update` to update the session in place without a full re-login.

## Integrating MPClub SSO into a New Project

### 1. Install dependencies

```bash
npm install next-auth@beta
```

### 2. Environment variables (`.env`)

```env
AUTH_SECRET=        # openssl rand -base64 32
MPCLUB_CLIENT_ID=   # from MPClub developer portal
MPCLUB_CLIENT_SECRET=
```

### 3. Create `src/auth.ts`

```ts
import NextAuth from "next-auth"

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
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.access_token = account.access_token
        token.refresh_token = account.refresh_token
        token.expires_at = account.expires_at
      }
      return token
    },
    async session({ session, token }) {
      session.access_token = token.access_token as string | undefined
      return session
    },
  },
})
```

### 4. Create `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

### 5. Create `middleware.ts` (protect routes)

```ts
import { auth } from "@/auth"
export default auth
export const config = { matcher: ["/dashboard/:path*"] }
```

### 6. Login button

```tsx
import { signIn } from "@/auth"

<form action={async () => { "use server"; await signIn("mpc-sso") }}>
  <button type="submit">Login with MPClub</button>
</form>
```

### 7. Read session in a Server Component

```ts
import { auth } from "@/auth"

const session = await auth()
// session.user, session.access_token
```

> The `unstable_update` export and the `/api/auth/refresh` route are only needed for manual token refresh — skip them for a basic integration.

---

## Notes

- This project uses **NextAuth v5 beta** (`5.0.0-beta.30`). The API differs from stable v4 — see the [NextAuth v5 migration guide](https://authjs.dev/getting-started/migrating-to-v5) if needed.
- This project uses **Next.js 16** which has breaking changes from earlier versions. Check `node_modules/next/dist/docs/` for up-to-date documentation.
