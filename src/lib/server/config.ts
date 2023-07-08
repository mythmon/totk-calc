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

export function getConfig() {
  prepEnv();
  return {
    env: env("ENV", "dev"),
  };
}

export function prepEnv() {
  if (!process.env["AUTH0_BASE_URL"] && process.env["VERCEL_URL"]) {
    process.env["AUTH0_BASE_URL"] = process.env["VERCEL_URL"];
  }
  if (!process.env["NEXT_PUBLIC_AUTH0_BASE_URL"]) {
    process.env["NEXT_PUBLIC_AUTH0_BASE_URL"] = process.env["AUTH0_BASE_URL"];
  }
}
