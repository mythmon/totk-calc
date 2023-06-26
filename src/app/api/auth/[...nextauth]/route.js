
import NextAuth from "next-auth";
import { config } from "@/lib/config";

const handler = NextAuth(config.auth);

export { handler as GET, handler as POST }
