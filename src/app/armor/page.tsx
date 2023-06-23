import type { Component, ServerComponent } from "@/components/component";
import Image from "next/image";
import { ArmorIcon, RupeeIcon } from "@/components/icons";
import d3 from "@/lib/d3";
import cx from "classnames";
import { fetchArmorList, type Armor } from "@/data/totkDb";

const Home: ServerComponent = async () => {
  const data = await fetchArmorList();
  const armorsBySet = d3.group(data.armors, (d) => d.belonging_set);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">Armor</h1>
      <p>{data.armors.length} rows</p>

      <div className="flex flex-wrap gap-4">
        {Array.from(armorsBySet.entries(), ([setName, armors]) => {
          if (!setName || armors.length === 1) {
            return armors.map((armor) => (
              <ArmorCard key={`armor-${armor.actorname}`} armor={armor} showSet={false} />
            ));
          } else {
            return <ArmorSetCard key={`set-${setName}`} name={setName} armors={armors} />
          }
        })}
      </div>
    </div>
  );
};

interface ArmorCardProps {
  armor: Armor;
  showSet?: boolean;
}

const ArmorCard: Component<ArmorCardProps> = ({ armor, showSet = true }) => {
  const hasUpgrades = !!armor.defense_1;
  return (
    <div className="bg-gray-200 rounded-lg p-2 pb-3 w-64 flex flex-col">
      <h2 className="font-bold text-center">
        {armor.euen_name ?? armor.actorname}
      </h2>
      {armor.belonging_set && showSet && (
        <h3 className="text-center italic">{armor.belonging_set} set</h3>
      )}
      <div className="flex-grow min-h-[1rem]" />
      <Image
        className="m-auto"
        width={128}
        height={128}
        alt={armor.euen_name}
        src={armor.icon}
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
            <div>{armor.defense_0}</div>
            <div>{armor.defense_1}</div>
            <div>{armor.defense_2}</div>
            <div>{armor.defense_3}</div>
            <div>{armor.defense_4}</div>
          </div>
          <hr className="col-span-6 border-b border-slate-300 w-8/12 my-1" />
          <div className="contents">
            <RupeeIcon width="24" height="24" />
            <div>{armor.selling_price_0}</div>
            <div>{armor.selling_price_1}</div>
            <div>{armor.selling_price_2}</div>
            <div>{armor.selling_price_3}</div>
            <div>{armor.selling_price_4}</div>
          </div>
        </div>
      ) : (
        <div className="mb-3 min-h-[4rem] pt-4">
          <div className="flex w-full gap-2">
            <div className="flex-grow text-center">
              <ArmorIcon className="inline" width="24" height="24" /> ️
              {armor.defense_0}
            </div>
            <div className="flex-grow text-center">
              <RupeeIcon className="inline" width="24" height="24" />{" "}
              {armor.selling_price_0}
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
 name: string; armors: Armor[]
}

const ArmorSetCard: Component<ArmorSetCardProps> = ({ name, armors}) => {
  if (armors.length != 3) {
    return <>{armors.map(armor => <ArmorCard key={armor.actorname} armor={armor} />)}</>;
  }
  return (
    <div className={cx(
      "bg-gray-200 rounded-lg p-2 pb-3",
      "w-[28rem]",
      "grid grid-cols-[auto,8px,repeat(6,auto)] grid-rows-[auto,repeat(9,auto)]",
      "gap-x-4 gap-y-2"
    )}>
      <h2 className="font-bold col-span-3">{name} set</h2>
      <div className="contents">
        <div className="text-center">-</div>
        <div className="text-center">★</div>
        <div className="text-center">★</div>
        <div className="text-center">★</div>
        <div className="text-center">★</div>
      </div>
      {armors.map(armor => (
        <>
          <hr className="col-span-9 border-b border-slate-300 w-full my-1" />
          <div className="contents">
            <div className="col-start-1 row-span-3 text-center">
              <Image src={armor.icon} width={96} height={96} alt={armor.euen_name} />
            </div>
            <div className="col-start-3 col-span-6 font-medium">
              {armor.euen_name}
            </div>
            <div className="contents">
              <ArmorIcon className="col-start-3" width="24" height="24" />
              <div className="text-center">{armor.defense_0}</div>
              <div className="text-center">{armor.defense_1}</div>
              <div className="text-center">{armor.defense_2}</div>
              <div className="text-center">{armor.defense_3}</div>
              <div className="text-center">{armor.defense_4}</div>
            </div>
            <div />
            <div className="contents">
              <RupeeIcon className="col-start-3" width="24" height="24" />
              <div className="text-center">{armor.selling_price_0}</div>
              <div className="text-center">{armor.selling_price_1}</div>
              <div className="text-center">{armor.selling_price_2}</div>
              <div className="text-center">{armor.selling_price_3}</div>
              <div className="text-center">{armor.selling_price_4}</div>
            </div>
          </div>
        </>
      ))}
    </div >
  );
}

export default Home;
