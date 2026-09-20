// The web address people use to reach the app. Set NEXTAUTH_URL to your real domain once it is online.
// Passport QR codes and share links are built from it.
export const publicOrigin = () => (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
