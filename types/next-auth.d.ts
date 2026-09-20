import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      sv?: number; // the session version this login was made with (see User.sessionVersion)
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    sessionVersion?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    sv?: number;
  }
}
