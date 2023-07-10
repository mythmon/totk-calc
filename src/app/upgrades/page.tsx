import type { ServerComponent } from "@/components/component";
import { fetchArmorList } from "@/lib/server/totkDb";
import { UpgradesClient } from "./clientPage";
import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";

const Upgrades: ServerComponent = async () => {
  const armorList = await fetchArmorList();
  const session = await getSession();

  if (!session) {
    return redirect("/");
  }

  return (
    <>
      <h1 className="text-xl font-bold">Upgrades</h1>
      <UpgradesClient armorList={armorList} />
    </>
  );
};

export default Upgrades;
