"use client";

import type { Component } from "@/components/component";
import type { ArmorListResponse } from "@/lib/shared/armor";
import { useGetArmorInventoryQuery } from "@/state/services/inventory";
import d3 from "@/lib/shared/d3";
import Image from "next/image";
import { Stars } from "@/components/Stars";
import { useAppDispatch } from "@/state/hooks";
import { modalActions } from "@/state/slices/modal";
import { armorActions } from "@/state/slices/armor";
import { useEffect } from "react";
import type { UpgradeQuery } from "./page";
import Link from "next/link";
import { useGetMaterialsQuery } from "@/state/services/materials";

interface UpgradesClientProps {
  armorList: ArmorListResponse;
  query: UpgradeQuery;
}

export const UpgradesClient: Component<UpgradesClientProps> = ({
  armorList,
  query,
}) => {
  const armorInventoryQuery = useGetArmorInventoryQuery();
  const materialsQuery = useGetMaterialsQuery();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(armorActions.setList(armorList.armors));
  }, [dispatch, armorList]);

  useEffect(() => {
    if (query.armor) {
      dispatch(
        modalActions.show({
          modal: "edit-armor",
          id: query.armor,
        })
      );
    } else {
      dispatch(modalActions.close("no armor selected"));
    }
  }, [dispatch, query]);

  const inventory = armorInventoryQuery.data?.armor;
  const materials = materialsQuery.data?.materials;

  if (
    armorInventoryQuery.isLoading ||
    !inventory ||
    materialsQuery.isLoading ||
    !materials
  ) {
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

  materialData.sort((a, b) => a.material.localeCompare(b.material));

  const materialsByName = Object.fromEntries(materials.map((m) => [m.name, m]));

  return (
    <>
      <table className="w-full max-w-2xl">
        <thead>
          <tr>
            <th className="text-left max-w-lg md:max-w-2xl pr-4" colSpan={2}>
              Material
            </th>
            <th className="text-right px-4">Total</th>
            <th className="text-left pl-4">For</th>
          </tr>
        </thead>
        <tbody>
          {materialData
            .map((d) => ({ ...d, material: materialsByName[d.material]! }))
            .filter((d) => !!d.material)
            .map((d) => (
              <tr key={d.material.actorName} className="border-t">
                <td className="py-2 pr-1 align-top w-[32px]">
                  <Image
                    src={d.material.iconUrl}
                    alt=""
                    aria-label="Icon for material"
                    width={32}
                    height={32}
                  />
                </td>
                <td className="pr-4 py-2 max-w-[6rem] md:max-w-[16rem] align-top">
                  {d.material?.name}
                </td>
                <td className="px-4 py-2 min-w-[4rem] text-right align-top">
                  x{d.total}
                </td>
                <td className="pl-4 py-2 align-top">
                  <div className="flex flex-wrap gap-4">
                    {d.for.map((f) => (
                      <Link
                        href={`?armor=${f.armor}`}
                        scroll={false}
                        key={`${f.armor}-${f.level}`}
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
                      </Link>
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
