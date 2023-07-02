import type { ServerComponent } from "@/components/component";
import { fetchArmorList } from "@/lib/totkDb";
import { DyedArmorSelector } from "./dyedArmorSelector";

const DyePage: ServerComponent = async () => {
  const armorList = await fetchArmorList();

  return (
    <div className="p-2 md:p-8">
      <h1 className="text-xl font-bold">Dyes</h1>
      <div className="grid grid-cols-[min-content,_130px] gap-4">
        <DyedArmorSelector armorData={armorList} slot={"head"} />
        <DyedArmorSelector armorData={armorList} slot={"upper"} />
        <DyedArmorSelector armorData={armorList} slot={"lower"} />
      </div>
    </div>
  );
};

export default DyePage;
