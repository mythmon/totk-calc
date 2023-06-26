import type { ServerComponent } from "@/components/component";
import { fetchArmorList } from "@/lib/totkDb";
import { ArmorListClient } from "./clientPage";

const ArmorList: ServerComponent = async () => {
  const armorList = await fetchArmorList();
  return <ArmorListClient armorList={armorList} />;
};

export default ArmorList;
