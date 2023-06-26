
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { config } from "@/lib/config";

const handler = NextAuth(config.auth);

export { handler as GET, handler as POST }
