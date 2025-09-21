import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // Add id property in Session
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
  // Add id property in User
  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  // Add id property in JWT
  interface JWT extends DefaultJWT {
    id: string;
  }
}
