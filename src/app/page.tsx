import type { ServerComponent } from "@/components/component";
import type { Armor, ArmorListResponse } from "./api/armor/route";
import Image from "next/image";

const Home: ServerComponent = async () => {
  const data = await getData();
  const keys: (keyof Armor)[] = Object.keys(data.fields) as (keyof Armor)[];

  return (
    <>
      <h1 className="f1">Armor</h1>
      <p>{data.armor.length} rows</p>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            {keys.map((k) => (
              <th key={`header-${k}`}>{data.fields[k]?.title ?? k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.armor.map((d, i) => (
            <tr key={`row-${i}`}>
              <td>
                <Image
                  width="64"
                  height="64"
                  alt={d["euen_name"]}
                  src={`/api/armor/${d.actorname}/image.png`}
                />
              </td>
              {keys.map((k) => (
                <td key={k}>{d[k]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
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
