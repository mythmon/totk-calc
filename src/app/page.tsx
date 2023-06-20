import type { ServerComponent } from "@/components/component";
import type { ArmorListResponse } from "./api/armor/route";

const Home: ServerComponent = async () => {
  const data = await getData();
  const keys = Object.keys(data.fields);

  return (
    <>
      <h1 className="f1">Armor</h1>
      <p>{data.armor.length} rows</p>
      <table>
        <thead>
          <tr>
            {keys.map((k) => (
              <th key={`header-${k}`}>{data.fields[k]?.title ?? k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.armor.map((d, i) => (
            <tr key={`row-${i}`}>
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
