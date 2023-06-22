import type { Component, ServerComponent } from "@/components/component";
import type { Armor, ArmorListResponse } from "./api/armor/route";
import Image from "next/image";
import { ArmorIcon, RupeeIcon } from "@/components/icons";

const Home: ServerComponent = async () => {
  const data = await getData();

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">Armor</h1>
      <p>{data.armors.length} rows</p>

      <div className="flex flex-wrap gap-4">
        {data.armors.map((armor) => (
          <ArmorCard armor={armor} />
        ))}
      </div>
    </div>
  );
};

interface ArmorCardProps {
  armor: Armor;
}

const ArmorCard: Component<ArmorCardProps> = ({ armor }) => {
  const hasUpgrades = !!armor.defense_1;
  return (
    <div className="bg-gray-200 rounded-lg p-2 pb-3 w-64 flex flex-col">
      <h2 className="font-bold text-center">
        {armor.euen_name ?? armor.actorname}
      </h2>
      <h3 className="text-center italic">{armor.belonging_set} set</h3>
      <Image
        className="m-auto"
        width={128}
        height={128}
        alt={armor.euen_name}
        src={`/api/armor/${armor.actorname}/image.png`}
      />
      <div className="flex-grow min-h-[1rem]" />
      {hasUpgrades ? (
        <div className="grid grid-cols-6 justify-items-center">
          <div className="contents">
            <div className="col-start-2 align-middle">-</div>
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
        <div className="mb-4">
          <div className="text-center font-light text-sm text-gray-600">
            (no upgrades)
          </div>
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
        </div>
      )}
    </div>
  );
};

export default Home;

async function getData(): Promise<ArmorListResponse> {
  const res = await fetch("http://localhost:3000/api/armor");

  if (!res.ok) {
    throw new Error(
      `Error fetching data: ${res.status} ${
        res.statusText
      }\n${await res.text()}`
    );
  }

  return (await res.json()) as ArmorListResponse;
}

export const dynamic = "force-dynamic";
