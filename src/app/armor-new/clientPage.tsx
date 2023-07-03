"use client";

import type { Component } from "@/components/component";
import Image from "next/image";
import { type Armor, type ArmorListResponse } from "@/lib/totkDb";
import { InventoryArmorRes } from "../api/inventory/armor/types";
import { signIn, useSession } from "next-auth/react";
import { useGetPatchQuery } from "@/lib/react-query";

interface ArmorListClientProps {
  armorList: ArmorListResponse;
}

export const ArmorListClient: Component<ArmorListClientProps> = ({
  armorList,
}) => {
  const session = useSession();
  const anonymous = session.status === "unauthenticated";

  const armorInventoryQuery = useGetPatchQuery<InventoryArmorRes>({
    endpoint: "/api/inventory/armor",
    enabled: !anonymous,
  });

  if (armorInventoryQuery.isError) {
    throw armorInventoryQuery.error;
  }

  if (anonymous) {
    return (
      <p>
        <button onClick={() => signIn("discord")}>Sign in</button>
        to start tracking armors.
      </p>
    );
  }

  const collectedArmors = armorList.armors.filter((a) =>
    Object.hasOwn(armorInventoryQuery.data?.armor ?? {}, a.actorName)
  );

  return (
    <>
      <h1 className="text-xl font-bold">Armor</h1>

      {armorInventoryQuery.isLoading ? (
        <>Loading...</>
      ) : (
        <>
          <div className="mb-4">
            <p>
              You&apos;ve collected {collectedArmors.length} armor pieces.
              <button className="py-1 px-2 m-1 border bg-slate-200">
                Add another
              </button>
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {collectedArmors.map((armor) => (
              <ArmorCard key={armor.actorName} armor={armor} />
            ))}
          </div>
        </>
      )}
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
