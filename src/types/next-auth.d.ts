import type { DefaultSession } from "next-auth";
import type { Role } from "../../generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: Role;
    username: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      username: string;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string;
    isEmailVerified: boolean;
  }
}
