"use client";

import type { Component } from "@/components/component";
import type { ArmorListResponse } from "@/lib/shared/armor";
import { useGetArmorInventoryQuery } from "@/state/services/totk";
import d3 from "@/lib/shared/d3";
import Image from "next/image";
import { Stars } from "@/components/Stars";
import { useAppDispatch } from "@/state/hooks";
import { modalActions } from "@/state/slices/modal";
import { armorActions } from "@/state/slices/armor";
import { useEffect } from "react";

interface UpgradesClientProps {
  armorList: ArmorListResponse;
}

export const UpgradesClient: Component<UpgradesClientProps> = ({
  armorList,
}) => {
  const armorInventoryQuery = useGetArmorInventoryQuery();
  const inventory = armorInventoryQuery.data?.armor;
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(armorActions.setList(armorList.armors));
  }, [dispatch, armorList]);

  if (armorInventoryQuery.isLoading || !inventory) {
    return <>Loading...</>;
  }

  const armorByActor = Object.fromEntries(
    armorList.armors.map((a) => [a.actorName, a])
  );

  const upgradeArmors = armorList.armors
    .filter((a) =>
      Object.hasOwn(armorInventoryQuery.data?.armor ?? {}, a.actorName)
    )
    .filter((a) => a.upgrades);

  const upgrades = upgradeArmors
    .filter((a) => a.upgrades)
    .flatMap((armor) =>
      armor.upgrades!.map((recipe, index) => ({
        armor: armor.actorName,
        level: index + 1,
        recipe: recipe,
      }))
    )
    .filter((u) => (inventory[u.armor]?.level ?? 0) < u.level);

  const materialData = Array.from(
    d3
      .rollup(
        upgrades.flatMap((u) =>
          u.recipe.map((d) => ({ ...d, armor: u.armor, level: u.level }))
        ),
        (ds) => ({
          total: d3.sum(ds, (d) => d.quantity),
          for: ds.map((d) => ({
            armor: d.armor,
            level: d.level,
            quantity: d.quantity,
          })),
        }),
        (d) => d.material
      )
      .entries()
  ).map(([material, data]) => ({
    material,
    ...data,
  }));

  return (
    <>
      <table className="w-full max-w-2xl">
        <thead>
          <tr>
            <th className="text-left max-w-lg">Material</th>
            <th className="text-right pr-4">Total</th>
            <th className="text-left">For</th>
          </tr>
        </thead>
        <tbody>
          {materialData.map((d) => (
            <tr key={d.material} className="border-t">
              <td className="pr-4 py-2 max-w-[16rem]">{d.material}</td>
              <td className="px-4 py-2 min-w-[4rem] text-right">x{d.total}</td>
              <td className="pl-4 py-2">
                <div className="flex flex-wrap gap-4">
                  {d.for.map((f) => (
                    <button
                      key={`${f.armor}-${f.level}`}
                      onClick={() => {
                        console.log("clicked", f);
                        dispatch(
                          modalActions.show({
                            modal: "edit-armor",
                            id: f.armor,
                          })
                        );
                      }}
                    >
                      {f.quantity}x
                      <Image
                        className="inline"
                        src={
                          armorByActor[f.armor]?.iconUrls[
                            inventory[f.armor]?.dye ?? "Base"
                          ] ?? "/404"
                        }
                        alt={armorByActor[f.armor]?.enName ?? "<unk>"}
                        width={24}
                        height={24}
                      />
                      <Stars count={f.level} size={16} />
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
