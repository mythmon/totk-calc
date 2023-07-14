"use client";

import type { ServerComponent } from "@/components/component";
import { DyedArmorSelector } from "./dyedArmorSelector";
import { useGetArmorsQuery } from "@/state/services/static";

const DyePage: ServerComponent = async () => {
  const armorQuery = useGetArmorsQuery();

  if (armorQuery.isLoading) {
    return <>Loading...</>;
  }
  const armors = armorQuery.data!;

  return (
    <div className="p-2 md:p-8">
      <h1 className="text-xl font-bold">Dyes</h1>
      <div className="grid grid-cols-[minmax(200px,340px),130px] gap-4">
        <DyedArmorSelector armors={armors} slot={"head"} />
        <DyedArmorSelector armors={armors} slot={"upper"} />
        <DyedArmorSelector armors={armors} slot={"lower"} />
      </div>
    </div>
  );
};

export default DyePage;
