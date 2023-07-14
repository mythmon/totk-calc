import type { ServerComponent } from "@/components/component";
import { ArmorListClient } from "./clientPage";
import { znt } from "@/lib/shared/znt";
import z from "zod";

const ArmorListQuery = znt(
  z.object({
    armor: z.optional(z.string()),
  })
);

export type ArmorListQuery = z.infer<typeof ArmorListQuery>;

const ArmorList: ServerComponent<{
  searchParams: Record<string, string>;
}> = async ({ searchParams }) => {
  const query: ArmorListQuery = ArmorListQuery.parseNt(searchParams).unwrapOr(
    {}
  );

  return (
    <>
      <h1 className="text-xl font-bold">Armor</h1>
      <ArmorListClient query={query} />
    </>
  );
};

export default ArmorList;
