'use client';

import type { Component } from "@/components/component";
import Image from "next/image";
import { ArmorIcon, RupeeIcon } from "@/components/icons";
import d3 from "@/lib/shared/d3";
import cx from "classnames";
import { type Armor, type ArmorListResponse } from "@/lib/server/totkDb";
import { InventoryArmorRes } from "../api/inventory/armor/types";
import { ArmorLevelManager } from "@/components/armorLevelManager";
import { useGetPatchQuery } from "@/lib/client/hooks/react-query";
import type { ArmorField } from "@/lib/shared/armor";
import { useUser } from "@auth0/nextjs-auth0/client";

interface ArmorListClientProps {
  armorList: ArmorListResponse;
}

export const ArmorListClient: Component<ArmorListClientProps> = ({
  armorList,
}) => {
  const armorsBySet = d3.group(armorList.armors, (d) => d.setEnName);
  const session = useUser();

  const armorInventoryQuery = useGetPatchQuery<InventoryArmorRes>({
    endpoint: "/api/inventory/armor",
    enabled: !!session.user,
  });

  const loading =
    session.isLoading || (session.user && armorInventoryQuery.isLoading);

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {Array.from(armorsBySet.entries(), ([setName, armors]) => {
        armors = d3.sort(armors, (d) =>
          ["head", "upper", "lower"].indexOf(d.slot)
        );
        if (!setName || armors.length === 1) {
          return armors.map((armor) => (
            <ArmorCard
              key={`armor-${armor.actorName}`}
              armor={armor}
              showSet={false}
            />
          ));
        } else {
          return (
            <ArmorSetCard
              key={`set-${setName}`}
              name={setName}
              armors={armors}
              anonymous={!!session.user}
              inventory={armorInventoryQuery.data?.armor ?? null}
              mutateHaveLevel={async (patch) => {
                await armorInventoryQuery.mutate({ armor: patch });
              }}
            />
          );
        }
      })}
    </div>
  );
};

interface ArmorCardProps {
  armor: Armor;
  showSet?: boolean;
}

const ArmorCard: Component<ArmorCardProps> = ({ armor, showSet = true }) => {
  const hasUpgrades = !!armor.hasUpgrades;
  return (
    <div className="bg-gray-200 rounded-lg p-2 pb-3 flex flex-col w-full sm:w-64">
      <h2 className="font-bold text-center">
        {armor.enName ?? armor.actorName}
      </h2>
      {armor.setEnName && showSet && (
        <h3 className="text-center italic">{armor.setEnName}</h3>
      )}
      <div className="flex-grow min-h-[1rem]" />
      <Image
        className="m-auto"
        width={128}
        height={128}
        alt={armor.enName}
        src={armor.iconUrls["Base"]!}
      />
      <div className="flex-grow min-h-[1rem]" />
      {hasUpgrades ? (
        <div className="grid grid-cols-6 justify-items-center">
          <div className="contents">
            <div className="col-start-2">-</div>
            <div>★</div>
            <div>★</div>
            <div>★</div>
            <div>★</div>
          </div>
          <hr className="col-span-6 border-b border-slate-300 w-8/12 my-1" />
          <div className="contents">
            <ArmorIcon width="24" height="24" />
            {armor.defenses.map((def, i) => (
              <div key={`def-${i}`}>{def}</div>
            ))}
          </div>
          <hr className="col-span-6 border-b border-slate-300 w-8/12 my-1" />
          <div className="contents">
            <RupeeIcon width="24" height="24" />
            {armor.sellingPrices.map((pri, i) => (
              <div key={`sell-rupee-${i}`}>{pri}</div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-3 min-h-[4rem] pt-4">
          <div className="flex w-full gap-2">
            <div className="flex-grow text-center">
              <ArmorIcon className="inline" width="24" height="24" /> ️
              {armor.defenses[0]}
            </div>
            <div className="flex-grow text-center">
              <RupeeIcon className="inline" width="24" height="24" />{" "}
              {armor.sellingPrices[0]}
            </div>
          </div>
          <div className="text-center font-light text-sm text-gray-600">
            (no upgrades)
          </div>
        </div>
      )}
    </div>
  );
};

interface ArmorSetCardProps {
  name: string;
  armors: Armor[];
  anonymous: boolean;
  inventory: Record<string, ArmorField | null> | null;
  mutateHaveLevel: (patch: Record<string, ArmorField | null>) => Promise<void>;
}

const ArmorSetCard: Component<ArmorSetCardProps> = (props) => {
  if (props.armors.length != 3) {
    return (
      <>
        {props.armors.map((armor) => (
          <ArmorCard key={armor.actorName} armor={armor} />
        ))}
      </>
    );
  }

  const hasUpgrades = !!props.armors.every((a) => a.hasUpgrades);
  if (hasUpgrades) {
    return (
      <ArmorSetUpgradesCard
        key={`armor-set-${props.armors[0]?.belongingSet}`}
        {...props}
      />
    );
  } else {
    return (
      <ArmorSetNoUpgradesCard
        key={`armor-set-${props.armors[0]?.belongingSet}`}
        {...props}
      />
    );
  }
};

const ArmorSetUpgradesCard: Component<ArmorSetCardProps> = ({
  name,
  armors,
  anonymous,
  inventory,
  mutateHaveLevel,
}) => {
  return (
    <div
      className={cx(
        "bg-gray-200 rounded-lg p-2 pb-3",
        "w-full md:w-[28rem]",
        "grid grid-rows-[auto,repeat(9,auto)]",
        "grid-cols-[minmax(64px,auto),8px,repeat(6,auto)]",
        "gap-x-2 md:gap-x-4 gap-y-2",
        "text-sm md:text-base"
      )}
    >
      <h2 className="font-bold col-span-3">{name}</h2>
      <div className="contents">
        <div className="text-center">-</div>
        <div className="text-center">★</div>
        <div className="text-center">★</div>
        <div className="text-center">★</div>
        <div className="text-center">★</div>
      </div>
      {armors.map((armor) => (
        <>
          <hr
            key={`armor-hr-${armor.actorName}`}
            className="col-start-1 col-end-[-1] border-b border-slate-300 w-full my-1 col-span-9"
          />
          <div key={`armor-${armor.actorName}`} className="contents">
            <div className="col-start-1 row-span-3 text-center">
              <Image
                src={armor.iconUrls["Base"]!}
                width={96}
                height={96}
                alt={armor.enName}
              />
            </div>
            <div className="col-start-3 col-span-6 font-medium">
              {armor.enName}
              {!anonymous && (
                <ArmorLevelManager
                  haveLevel={inventory?.[armor.actorName]?.level ?? null}
                  hasUpgrades={true}
                  setLevel={async (newLevel) =>
                    mutateHaveLevel({
                      [armor.actorName]: newLevel
                        ? {
                            level: newLevel,
                            dye: inventory![armor.actorName]!.dye,
                          }
                        : null,
                    })
                  }
                />
              )}
            </div>
            <div className="contents">
              <ArmorIcon className="col-start-3" width="24" height="24" />
              {armor.defenses.map((def, i) => (
                <div key={`def-${i}`} className="text-center">
                  {def}
                </div>
              ))}
            </div>
            <div className="contents">
              <RupeeIcon className="col-start-3" width="24" height="24" />
              {armor.sellingPrices.map((pri, i) => (
                <div key={`sell-rupee-${i}`} className="text-center">
                  {pri}
                </div>
              ))}
            </div>
          </div>
        </>
      ))}
    </div>
  );
};

const ArmorSetNoUpgradesCard: Component<ArmorSetCardProps> = ({
  name,
  armors,
}) => {
  return (
    <div
      className={cx(
        "bg-gray-200 rounded-lg p-2 pb-3",
        "w-full md:w-[20rem]",
        "grid grid-rows-[auto,repeat(9,auto)]",
        "grid-cols-[minmax(64px,auto),8px,auto,auto]",
        "gap-x-2 md:gap-x-4 gap-y-2",
        "text-sm md:text-base"
      )}
    >
      <h2 className="font-bold col-span-2">{name}</h2>
      <div className="col-span-2 text-left font-light text-sm text-gray-600">
        (no upgrades)
      </div>
      {armors.map((armor) => (
        <>
          <hr
            key={`armor-hr-${armor.actorName}`}
            className="col-start-1 col-end-[-1] border-b border-slate-300 w-full my-1"
          />
          <div key={`armor-${armor.actorName}`} className="contents">
            <div className="col-start-1 row-span-3 text-center">
              <Image
                src={armor.iconUrls["Base"]!}
                width={96}
                height={96}
                alt={armor.enName}
              />
            </div>
            <div className="col-start-3 col-span-2 font-medium">
              {armor.enName}
            </div>
            <div className="contents">
              <ArmorIcon className="col-start-3" width="24" height="24" />
              <div className="text-left">{armor.defenses[0]}</div>
            </div>
            <div className="contents">
              <RupeeIcon className="col-start-3" width="24" height="24" />
              <div className="text-left">{armor.sellingPrices[0]}</div>
            </div>
          </div>
        </>
      ))}
    </div>
  );
};
