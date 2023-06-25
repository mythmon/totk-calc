
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { config } from "@/lib/config";

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: config.discord.clientId,
      clientSecret: config.discord.clientSecret,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify",
    }),
  ],
});

export { handler as GET, handler as POST }
