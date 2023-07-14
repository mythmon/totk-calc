import type { ServerComponent } from "@/components/component";
import { UpgradesClient } from "./clientPage";
import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { znt } from "@/lib/shared/znt";
import z from "zod";

const UpgradeQuery = znt(
  z.object({
    armor: z.optional(z.string()),
  })
);

export type UpgradeQuery = z.infer<typeof UpgradeQuery>;

const Upgrades: ServerComponent<{
  searchParams: Record<string, string>;
}> = async ({ searchParams }) => {
  const session = await getSession();

  if (!session) {
    return redirect("/");
  }

  const query: UpgradeQuery = UpgradeQuery.parseNt(searchParams).unwrapOr({});

  return (
    <>
      <h1 className="text-xl font-bold">Upgrades</h1>
      <UpgradesClient query={query} />
    </>
  );
};

export default Upgrades;
