import "server-only";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Google vërteton identitetin e punonjësit të servisit. Rolin e lexojmë nga Neon.
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    // Google pyet gjithmonë për llogarinë, edhe kur një është e hapur: pas daljes mund të hyhet me një tjetër.
    authorization: { params: { prompt: "select_account" } },
  })],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
