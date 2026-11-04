import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const protectedPaths = [
        "/dashboard",
        "/practice",
        "/test",
        "/results",
        "/profile",
        "/admin",
      ];
      const needsAuth = protectedPaths.some((p) => pathname.startsWith(p));

      if (needsAuth && !isLoggedIn) return false;
      if (pathname.startsWith("/admin") && isLoggedIn && role !== "admin") {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }
      if ((pathname === "/login" || pathname === "/signup") && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
