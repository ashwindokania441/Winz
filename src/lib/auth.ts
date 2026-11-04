import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier || "").trim();
        const password = String(credentials?.password || "");
        if (!identifier || !password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: identifier } },
              { username: { equals: identifier } },
            ],
          },
        });

        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
});
