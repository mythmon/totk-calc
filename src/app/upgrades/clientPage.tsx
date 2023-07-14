"use client";

import type { Component } from "@/components/component";
import type { Armor, ArmorField } from "@/lib/shared/armor";
import { useGetArmorInventoryQuery } from "@/state/services/inventory";
import d3 from "@/lib/shared/d3";
import Image from "next/image";
import { Stars } from "@/components/Stars";
import { useAppDispatch } from "@/state/hooks";
import { modalActions } from "@/state/slices/modal";
import { useCallback, useEffect, useState } from "react";
import type { UpgradeQuery } from "./page";
import Link from "next/link";
import type { Material } from "@/lib/shared/material";
import { Button } from "@/components/form/Button";
import { type UIEvent } from "react";
import { znt } from "@/lib/shared/znt";
import { z } from "zod";
import {
  useGetArmorsQuery,
  useGetMaterialsQuery,
} from "@/state/services/static";

interface UpgradesClientProps {
  query: UpgradeQuery;
}

const SortKey = znt(
  z.union([z.literal("name"), z.literal("type"), z.literal("total")])
);

type SortKey = z.infer<typeof SortKey>;

export const UpgradesClient: Component<UpgradesClientProps> = ({ query }) => {
  const armorInventoryQuery = useGetArmorInventoryQuery();
  const materialsQuery = useGetMaterialsQuery();
  const armorsQuery = useGetArmorsQuery();
  const dispatch = useAppDispatch();

  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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

  const handleSortClick = useCallback(
    (ev: UIEvent<HTMLButtonElement>) => {
      SortKey.parseNt(ev.currentTarget.dataset["sortBy"]).map((key) => {
        if (sortBy === key) {
          setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
        } else {
          setSortBy(key);
          setSortDir(key === "total" ? "desc" : "asc");
        }
      });
    },
    [sortBy]
  );

  const sortIndicator = useCallback(
    (key: SortKey) => {
      if (key === sortBy) {
        return sortDir === "asc" ? "↑" : "↓";
      }
      return null;
    },
    [sortBy, sortDir]
  );

  const inventory = armorInventoryQuery.data?.armor;
  const armors = armorsQuery.data;
  const materials = materialsQuery.data;

  if (
    armorInventoryQuery.isLoading ||
    !inventory ||
    materialsQuery.isLoading ||
    !materials ||
    !armors
  ) {
    return <>Loading...</>;
  }

  const { materialData, armorByActor } = generateData({
    armors,
    inventory,
    materials,
    sortBy,
    sortDir,
  });

  return (
    <>
      <div className="mb-4">
        Sort by:
        <Button onClick={handleSortClick} data-sort-by="name">
          Name {sortIndicator("name")}
        </Button>
        <Button onClick={handleSortClick} data-sort-by="type">
          Type {sortIndicator("type")}
        </Button>
        <Button onClick={handleSortClick} data-sort-by="total">
          Total {sortIndicator("total")}
        </Button>
      </div>

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
          {materialData.map((d) => (
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

interface GenerateDataProps {
  armors: Armor[];
  inventory: Record<string, ArmorField | null>;
  materials: Material[];
  sortBy: SortKey;
  sortDir: "asc" | "desc";
}

function generateData({
  armors,
  inventory,
  materials,
  sortBy,
  sortDir,
}: GenerateDataProps) {
  const armorByActor = Object.fromEntries(armors.map((a) => [a.actorName, a]));

  const upgradeArmors = armors
    .filter((a) => Object.hasOwn(inventory, a.actorName))
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

  const materialsByName = Object.fromEntries(materials.map((m) => [m.name, m]));
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
  )
    .map(([material, data]) => ({
      ...data,
      material: materialsByName[material]!,
    }))
    .filter((d) => !!d.material);

  materialData.sort((a, b) => {
    let rv = 0;
    switch (sortBy) {
      case "name":
      case "type": {
        rv = a.material.sortKeys[sortBy].localeCompare(
          b.material.sortKeys[sortBy]
        );
        break;
      }
      case "total": {
        if (a.total < b.total) {
          rv = -1;
        } else if (a.total > b.total) {
          rv = 1;
        }
        break;
      }
      default:
        throw new Error(`Unknown sort key ${sortBy}`);
    }
    return sortDir === "asc" ? rv : -rv;
  });

  return { materialData, armorByActor };
}
