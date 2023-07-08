import { handleAuth  } from '@auth0/nextjs-auth0';
import { prepEnv } from "@/lib/server/config";

prepEnv();

export const GET = handleAuth();
