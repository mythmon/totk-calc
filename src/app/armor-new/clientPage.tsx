"use client";

import type { Component } from "@/components/component";
import Image from "next/image";
import { type Armor, type ArmorListResponse } from "@/lib/server/totkDb";
import { Button } from "@/components/form/Button";
import { useAppDispatch } from "@/state/hooks";
import { modalActions } from "@/state/slices/modal";
import { useEffect } from "react";
import { armorActions } from "@/state/slices/armor";
import { useArmorInventoryQuery } from "@/lib/client/hooks/useArmorInventory";
import { useUser } from "@auth0/nextjs-auth0/client";

interface ArmorListClientProps {
  armorList: ArmorListResponse;
}

export const ArmorListClient: Component<ArmorListClientProps> = ({
  armorList,
}) => {
  const session = useUser();

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(armorActions.setList(armorList.armors));
  }, [dispatch, armorList]);

  const armorInventoryQuery = useArmorInventoryQuery();

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
          <Button onClick={() => dispatch(modalActions.showModal("add-armor"))}>
            Add another
          </Button>
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
    <div className="bg-gray-200 rounded-lg p-2 pb-3 flex flex-col">
      <h2 className="font-bold text-center">
        {armor.enName ?? armor.actorName}
      </h2>
      <div className="flex-grow min-h-[0.5rem]" />
      {armor.setEnName && (
        <h3 className="text-center italic">{armor.setEnName}</h3>
      )}
      <Image
        className="m-auto"
        width={128}
        height={128}
        alt={armor.enName}
        src={armor.iconUrls["Base"]!}
      />
    </div>
  );
};
