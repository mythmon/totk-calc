import "server-only";
import dotenv from "dotenv";

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
  env: env("ENV", "dev"),
};
