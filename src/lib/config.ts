function env(name: string): string {
  let val = process.env[name];
  if (val === undefined)
    throw new Error(`Missing environment variable ${name}`);
  return val;
}

export const config = {
  discord: {
    clientId: env("DISCORD_CLIENT_ID"),
    clientSecret: env("DISCORD_CLIENT_SECRET"),
  },
};
