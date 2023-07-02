"use client";

import Image from "next/image";
import type { Component } from "@/components/component";
import type { Armor, ArmorListResponse } from "@/lib/totkDb";
import { useEffect, useState, type ChangeEvent } from "react";
import { hex } from "wcag-contrast";
import d3 from "@/lib/d3";
import { Select } from "@/components/form/Select";

interface ArmorListClientProps {
  armorData: ArmorListResponse;
  slot: Armor["slot"];
}

export const DyedArmorSelector: Component<ArmorListClientProps> = ({
  armorData: armorList,
  slot,
}) => {
  const filteredArmors = armorList.armors
    .filter((a) => a.slot === slot)
    .sort((a, b) => a.enName.localeCompare(b.enName));
  if (filteredArmors.length === 0) {
    throw new Error("no armors found");
  }
  const [selectedArmorCode, setSelectedArmor] = useState<string>(() => {
    const defaultArmor =
      filteredArmors.find((a) => a.enName.includes("of the Wild")) ??
      filteredArmors[0];
    if (!defaultArmor) throw new Error("no armors found");
    return defaultArmor.actorName;
  });
  const [selectedColor, setSelectedColor] = useState<string>("Base");
  const selectedArmor = filteredArmors.find(
    (armor) => armor.actorName === selectedArmorCode
  );

  useEffect(() => {
    if (selectedArmor && !selectedArmor.colors.includes(selectedColor)) {
      setSelectedColor(selectedArmor.colors[0] ?? "Base");
    }
  }, [selectedArmor, setSelectedColor, selectedColor]);

  return (
    <>
      <div>
        <Select
          className="block w-full mb-2"
          value={selectedArmorCode ?? "-"}
          onChange={(ev: ChangeEvent<HTMLSelectElement>) =>
            setSelectedArmor(ev.target.value)
          }
        >
          {filteredArmors.map((armor) => (
            <option value={armor.actorName} key={`armor-${armor.actorName}`}>
              {armor.enName}
            </option>
          ))}
        </Select>
        {selectedArmor && (
          <ColorSelector
            colors={selectedArmor.colors}
            selected={selectedColor}
            onChange={setSelectedColor}
          />
        )}
      </div>
      <div className="w-[128px] h-[128px] border">
        {selectedArmorCode && (
          <Image
            src={`/images/armor/${selectedArmorCode}_${selectedColor}.avif`}
            width={128}
            height={128}
            alt={`${selectedColor} ${selectedArmor?.enName}`}
          />
        )}
      </div>
    </>
  );
};

interface ColorSelectorProps {
  colors: string[];
  selected: string;
  onChange: (color: string) => void;
}

const ColorSelector: Component<ColorSelectorProps> = ({
  colors,
  selected,
  onChange,
}) => {
  const colorMap: Record<string, string> = {
    Base: "#aaaaaa",
    Blue: "#0000ff",
    Red: "#ff0000",
    Yellow: "#ffff00",
    White: "#ffffff",
    Black: "#000000",
    Purple: "#8800ff",
    Green: "#00aa00",
    Navy: "#000088",
    Orange: "#ff8800",
    Peach: "#ffaaaa",
    Crimson: "#880000",
    Brown: "#aa4400",
    Gray: "#444444",
  };

  return (
    <div className="grid grid-cols-7 gap-2 w-48">
      {colors.map((color) => {
        const cssColor = colorMap[color] ?? "#000000";
        const checkColor = betterContrast(cssColor, ["#ffffff", "#000000"]);

        return (
          <div
            key={`swatch-${color}`}
            className="w-5 h-5 pl-1 pb-1 text-sm border border-black cursor-pointer"
            style={{ backgroundColor: cssColor, color: checkColor }}
            onClick={() => onChange(color)}
            title={color}
          >
            {color === selected ? "✔" : null}
          </div>
        );
      })}
    </div>
  );
};

function betterContrast(background: string, foregrounds: string[]): string {
  if (foregrounds.length === 0) {
    throw new Error("no foregrounds");
  }
  const contrasts = foregrounds.map((fg) => ({
    fg,
    contrast: hex(background, fg),
  }));
  console.log({ background, contrasts });
  return d3.greatest(contrasts, (d) => d.contrast)?.fg ?? foregrounds[0]!;
}
