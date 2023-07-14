"use client";

import type { Component } from "@/components/component";
import Image from "next/image";
import { DyeColor, type Armor } from "@/lib/shared/armor";
import { Button } from "@/components/form/Button";
import { useAppDispatch } from "@/state/hooks";
import { modalActions } from "@/state/slices/modal";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useGetArmorInventoryQuery } from "@/state/services/inventory";
import Link from "next/link";
import type { ArmorListQuery } from "./page";
import { useGetArmorsQuery } from "@/state/services/static";
import { znt } from "@/lib/shared/znt";
import { z } from "zod";
import { type UIEvent } from "react";

interface ArmorListClientProps {
  query: ArmorListQuery;
}

const SortKey = znt(
  z.union([z.literal("name"), z.literal("bodyPart"), z.literal("set")])
);

type SortKey = z.infer<typeof SortKey>;

export const ArmorListClient: Component<ArmorListClientProps> = ({ query }) => {
  const session = useUser();
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
      const key = SortKey.parse(ev.currentTarget.dataset["sortBy"]);
      if (sortBy === key) {
        setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(key);
        setSortDir("asc");
      }
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

  const armorsQuery = useGetArmorsQuery();
  const armorInventoryQuery = useGetArmorInventoryQuery(undefined, {
    skip: !session.user,
  });

  const loading =
    session.isLoading ||
    (session.user && armorInventoryQuery.isLoading) ||
    armorsQuery.isLoading;
  if (loading) {
    return <>Loading...</>;
  }

  if (armorInventoryQuery.isError) {
    throw armorInventoryQuery.error;
  }

  const armors = armorsQuery.data ?? [];
  const inventory = armorInventoryQuery.data?.armor ?? {};

  const collectedArmors = armors.filter((a) =>
    Object.hasOwn(inventory, a.actorName)
  );
  collectedArmors.sort((a, b) => {
    let rv = 0;
    rv = a.sortKeys[sortBy].localeCompare(b.sortKeys[sortBy]);
    return sortDir === "asc" ? rv : -rv;
  });

  if (!session.user) {
    return (
      <p>
        <a className="underline text-blue-700" href="/api/auth/login">
          Login
        </a>{" "}
        to start tracking armors.
      </p>
    );
  }

  return (
    <>
      <div className="mb-4">
        <p>
          You&apos;ve collected {collectedArmors.length} armor pieces.
          <Button
            onClick={() => dispatch(modalActions.show({ modal: "add-armor" }))}
          >
            Add another
          </Button>
        </p>
      </div>

      <div className="mb-4">
        Sort by:
        <Button onClick={handleSortClick} data-sort-by="name">
          Name {sortIndicator("name")}
        </Button>
        <Button onClick={handleSortClick} data-sort-by="set">
          Set {sortIndicator("set")}
        </Button>
        <Button onClick={handleSortClick} data-sort-by="bodyPart">
          Body Part {sortIndicator("bodyPart")}
        </Button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {collectedArmors.map((armor) => (
          <ArmorCard
            key={armor.actorName}
            armor={armor}
            dye={inventory?.[armor.actorName]?.dye ?? "Base"}
          />
        ))}
      </div>
    </>
  );
};

interface ArmorCardProps {
  armor: Armor;
  dye: DyeColor;
}

const ArmorCard: Component<ArmorCardProps> = ({ armor, dye }) => {
  return (
    <Link href={`?armor=${armor.actorName}`} scroll={false}>
      <div className="bg-gray-200 rounded-lg p-2 pb-3 flex flex-col h-56">
        <h2 className="font-bold text-center">
          {armor.enName ?? armor.actorName}
        </h2>
        {armor.setEnName && (
          <h3 className="text-center italic">{armor.setEnName}</h3>
        )}
        <div className="flex-grow min-h-[0.5rem]" />
        <Image
          className="m-auto"
          width={128}
          height={128}
          alt={armor.enName}
          src={armor.iconUrls[dye]!}
        />
      </div>
    </Link>
  );
};
