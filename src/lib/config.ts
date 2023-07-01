import dotenv from "dotenv";
import DiscordProvider from "next-auth/providers/discord";

dotenv.config({ path: ".env.local" });

function env(name: string, defaultValue?: string): string {
  let val = process.env[name];
  if (val === undefined) {
    if (defaultValue) return defaultValue;
    throw new Error(`Missing environment variable ${name}`);
  }
  return val;
}

export const config = {
  auth: {
    providers: [
      DiscordProvider({
        clientId: env("DISCORD_CLIENT_ID"),
        clientSecret: env("DISCORD_CLIENT_SECRET"),
      }),
    ],
  },
  env: env("ENV", "dev"),
};
