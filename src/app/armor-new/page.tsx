import type { ServerComponent } from "@/components/component";
import { fetchArmorList } from "@/lib/server/totkDb";
import { ArmorListClient } from "./clientPage";

const ArmorList: ServerComponent = async () => {
  const armorList = await fetchArmorList();
  return (
    <>
      <h1 className="text-xl font-bold">Armor</h1>
      <ArmorListClient armorList={armorList} />
    </>
  );
};

export default ArmorList;
