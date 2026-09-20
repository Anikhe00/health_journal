import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// No landing page yet: send people to their timeline, or to login.
export default async function Home() {
  const session = await getServerSession(authOptions);
  redirect(session ? "/dashboard" : "/login");
}
