import type { ServerComponent } from "@/components/component";
import { fetchArmorList } from "@/lib/server/totkDb";
import { ArmorListClient } from "./clientPage";

const ArmorList: ServerComponent = async () => {
  const armorList = await fetchArmorList();

  return (
    <>
      <div className="p-2 md:p-8">
        <h1 className="text-xl font-bold">Armor</h1>
        <p>{armorList.armors.length} armor pieces</p>
        <ArmorListClient armorList={armorList} />
      </div>
    </>
  );
};

export default ArmorList;
