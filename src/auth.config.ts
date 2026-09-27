import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        return null // Implemented in auth.ts (Node runtime)
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.jobTitle = (user as any).jobTitle
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.jobTitle = token.jobTitle as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig
