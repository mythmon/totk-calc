"use client";

import Image from "next/image";
import type { Component } from "@/components/component";
import type { Armor, ArmorListResponse } from "@/lib/shared/armor";
import { useEffect, useState, type ChangeEvent } from "react";
import { Select } from "@/components/form/Select";
import Head from "next/head";
import { ColorSelector } from "../../components/ColorSelector";

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

  // reset to base for armors that don't have the selected dye
  useEffect(() => {
    if (selectedArmor && !selectedArmor.colors.includes(selectedColor)) {
      setSelectedColor(selectedArmor.colors[0] ?? "Base");
    }
  }, [selectedArmor, setSelectedColor, selectedColor]);

  // preload other dye colors for the selected armor
  useEffect(() => {
    const head = document.head;
    const links: HTMLLinkElement[] = [];
    if (!selectedArmor) return;
    for (const imageUrl of Object.values(selectedArmor.iconUrls)) {
      const preloadUrl = new URL("/_next/image", window.location.href);
      preloadUrl.searchParams.set("url", imageUrl);
      preloadUrl.searchParams.set(
        "w",
        (Math.floor(window.devicePixelRatio ?? 1) * 128).toString()
      );
      preloadUrl.searchParams.set("q", "75");
      const link = document.createElement("link");
      link.setAttribute("rel", "preload");
      link.setAttribute("as", "image");
      link.setAttribute("href", preloadUrl.href);
      links.push(link);
      head.appendChild(link);
    }

    return () => {
      for (const link of links) head.removeChild(link);
    };
  }, [selectedArmor]);

  return (
    <>
      <Head>
        {Object.values(selectedArmor?.iconUrls ?? []).map((url) => (
          <link key={`preload-${url}`} rel="preload" as="image" href={url} />
        ))}
      </Head>
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
              {armor.colors.length === 1 ? "   (no dyes)" : null}
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
