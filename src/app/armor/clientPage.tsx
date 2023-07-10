"use client";

import type { Component } from "@/components/component";
import Image from "next/image";
import { type Armor, type ArmorListResponse } from "@/lib/shared/armor";
import { Button } from "@/components/form/Button";
import { useAppDispatch } from "@/state/hooks";
import { modalActions } from "@/state/slices/modal";
import { useEffect } from "react";
import { armorActions } from "@/state/slices/armor";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useGetArmorInventoryQuery } from "@/state/services/totk";
import Link from "next/link";
import type { ArmorListQuery } from "./page";

interface ArmorListClientProps {
  armorList: ArmorListResponse;
  query: ArmorListQuery;
}

export const ArmorListClient: Component<ArmorListClientProps> = ({
  armorList,
  query,
}) => {
  const session = useUser();
  const dispatch = useAppDispatch();

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

  useEffect(() => {
    dispatch(armorActions.setList(armorList.armors));
  }, [dispatch, armorList]);

  const armorInventoryQuery = useGetArmorInventoryQuery(undefined, {
    skip: !session.user,
  });

  const loading =
    session.isLoading || (session.user && armorInventoryQuery.isLoading);

  if (armorInventoryQuery.isError) {
    throw armorInventoryQuery.error;
  }

  const collectedArmors = armorList.armors.filter((a) =>
    Object.hasOwn(armorInventoryQuery.data?.armor ?? {}, a.actorName)
  );

  if (loading) {
    return <>Loading...</>;
  }

  if (!session.user) {
    return (
      <p>
        <a href="/api/auth/login">Login</a> to start tracking armors.
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
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {collectedArmors.map((armor) => (
          <ArmorCard key={armor.actorName} armor={armor} />
        ))}
      </div>
    </>
  );
};

interface ArmorCardProps {
  armor: Armor;
}

const ArmorCard: Component<ArmorCardProps> = ({ armor }) => {
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
          src={armor.iconUrls["Base"]!}
        />
      </div>
    </Link>
  );
};
