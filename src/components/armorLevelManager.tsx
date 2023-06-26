import { useCallback, type ChangeEventHandler } from "react";
import type { Component } from "./component"

interface ArmorLevelManagerProps {
  haveLevel: number | null;
  hasUpgrades: boolean;
  setLevel: (newLevel: number | null) => Promise<void>;
}

export const ArmorLevelManager: Component<ArmorLevelManagerProps> = ({ haveLevel, hasUpgrades, setLevel }) => {
  const handleChange: ChangeEventHandler<HTMLSelectElement> = useCallback((ev) => {
    if (ev.target.value === "null") {
      setLevel(null);
    } else {
      setLevel(+ev.target.value);
    }
  }, [setLevel]);

  return <select value={haveLevel ?? "null"} className="ml-3" onChange={handleChange}>
    <option value="null">Don't have</option>
    {hasUpgrades
      ? <>
        <option value={0}>Not upgraded</option>
        <option value={1}>Upgrade ★</option>
        <option value={2}>Upgrade ★★</option>
        <option value={3}>Upgrade ★★★</option>
        <option value={4}>Upgrade ★★★★</option>
      </>
      : <option>Have</option>}
  </select>
}
