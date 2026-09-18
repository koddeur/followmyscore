import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function uniqueUsernameFrom(seed: string): Promise<string> {
  const base = seed.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 20) || "user";

  let candidate = base;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    const suffixStr = String(suffix);
    candidate = `${base.slice(0, 24 - suffixStr.length - 1)}-${suffixStr}`;
    suffix += 1;
  }
  return candidate;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email ou nom d'utilisateur", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.identifier;
        const password = credentials?.password;
        if (typeof identifier !== "string" || typeof password !== "string") {
          return null;
        }

        const normalized = identifier.trim().toLowerCase();
        const user = await prisma.user.findFirst({
          where: { OR: [{ email: normalized }, { username: normalized }] },
        });
        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username,
        };
      },
    }),
    Google({}),
    Facebook({}),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") return true;

      // OAuth sign-in: link to an existing account by email, or create one
      // on the fly — there is no separate "sign up" step for OAuth.
      const email = user.email?.toLowerCase();
      if (!email) return false;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        // The OAuth provider already vouches for this email — treat that as
        // proof of ownership even if the account was created (and never
        // verified) via the credentials flow.
        if (!existing.emailVerified) {
          await prisma.user.update({ where: { id: existing.id }, data: { emailVerified: new Date() } });
        }
        return true;
      }

      const username = await uniqueUsernameFrom(email.split("@")[0] ?? "user");
      await prisma.user.create({
        data: {
          name: user.name?.trim() || email.split("@")[0],
          username,
          email,
          avatarUrl: user.image ?? null,
          role: "USER",
          emailVerified: new Date(),
        },
      });
      return true;
    },
    async jwt({ token, user, account }) {
      let userId: string | undefined = token.id;

      if (user) {
        if (account?.provider && account.provider !== "credentials") {
          // The `id` on `user` here is the provider's own subject id, not
          // ours — resolve our internal id via the email the signIn
          // callback just linked or created above.
          const dbUser = user.email
            ? await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } })
            : null;
          userId = dbUser?.id;
        } else {
          userId = user.id;
        }
      }
      if (!userId) return token;

      // Re-read from the DB on every request (not just at sign-in) so a
      // profile update (name, role, username) shows up immediately without
      // requiring the user to log out and back in.
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (dbUser) {
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.username = dbUser.username;
        token.name = dbUser.name;
        token.isEmailVerified = dbUser.emailVerified !== null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.name = token.name ?? session.user.name;
        session.user.isEmailVerified = token.isEmailVerified ?? false;
      }
      return session;
    },
  },
});
