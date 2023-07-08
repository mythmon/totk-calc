"use client";
import type { Component } from "@/components/component";
import { useAppDispatch } from "@/state/hooks";
import { Select } from "@/components/form/Select";
import { useArmorList } from "@/state/slices/armor";
import {
  useState,
  type ChangeEvent,
  useCallback,
  type SyntheticEvent,
  useEffect,
  useMemo,
} from "react";
import type { Armor } from "@/lib/server/totkDb";
import Image from "next/image";
import { modalActions } from "@/state/slices/modal";
import { Button } from "@/components/form/Button";
import { useSet } from "@/lib/client/hooks/useSet";
import { useArmorInventoryQuery } from "@/lib/client/hooks/useArmorInventory";

const STAR = "★";

export const AddArmorModal: Component = () => {
  const dispatch = useAppDispatch();
  const armorList = useArmorList();
  const [armor, setArmor] = useState<Armor | null>(null);
  const [dye, setDye] = useState<string>("Base");
  const [level, setLevel] = useState<number>(0);
  const armorInventoryQuery = useArmorInventoryQuery();
  const [submitting, setSubmitting] = useState(false);

  const { value: invalidReasons, set: setValidation } = useSet<string>();
  const armorOptions = useMemo(() => {
    if (armorList.status === "loaded") {
      const rv = [...armorList.armors];
      rv.sort((a, b) => a.enName.localeCompare(b.enName));
      return rv;
    }
    return [];
  }, [armorList]);

  useEffect(() => {
    setValidation("no-armor", !armor);
    setValidation("invalid-dye", !armor?.colors.includes(dye));
    const maxLevel = armor ? (armor.hasUpgrades ? 4 : 0) : 0;
    setValidation("invalid-level", level < 0 || level > maxLevel);
    setValidation("inventory-loading", armorInventoryQuery.isLoading);
    setValidation(
      "already-have",
      armorInventoryQuery.isFetched &&
        !!armor &&
        Object.hasOwn(armorInventoryQuery.data!.armor, armor?.actorName)
    );
  }, [armor, dye, invalidReasons, level, setValidation, armorInventoryQuery]);

  const handleArmorChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) => {
      if (armorList.status !== "loaded") return;
      const armor = armorList.armors.find(
        (a: Armor) => a.actorName === ev.target.value
      );
      if (armor) {
        setArmor(armor);
        if (!armor.colors.includes(dye)) {
          setDye(armor.colors[0] ?? "Base");
        }
        if (level > 0 && !armor.hasUpgrades) {
          setLevel(0);
        }
      }
    },
    [armorList, dye, level, setLevel, setDye]
  );

  const handleSubmit = useCallback(
    async (ev: SyntheticEvent) => {
      ev.preventDefault();
      if (invalidReasons.size > 0 || !armor) return;
      setSubmitting(true);
      try {
        await armorInventoryQuery.mutate({
          armor: {
            [armor.actorName]: { level, dye },
          },
        });
        dispatch(modalActions.closeModal());
      } finally {
        setSubmitting(false);
      }
    },
    [armor, armorInventoryQuery, dye, invalidReasons.size, level, dispatch]
  );

  return (
    <div className="p-6">
      {armorList.status === "loaded" ? (
        <div
          className="grid gap-4 grid-cols-[auto,minmax(64px,128px)]"
          style={{
            gridTemplateAreas: `
              "title  title"
              "armor  image"
              "level  image"
              "dye    buttons"
              "errors errors"
            `,
          }}
        >
          <div className="mb-3 border-b flex" style={{ gridArea: "title" }}>
            <h1 className="text-xl font-bold inline grow">Add an armor</h1>
            <button onClick={() => dispatch(modalActions.closeModal())}>
              x
            </button>
          </div>
          <div style={{ gridArea: "image" }}>
            {armor?.iconUrls?.[dye] ? (
              <Image
                width={128}
                height={128}
                alt={armor.enName}
                src={armor.iconUrls[dye]!}
              />
            ) : (
              <div className="w-[128px] h-[128px] border" />
            )}
          </div>
          <form className="contents" onSubmit={handleSubmit}>
            <div className="flex flex-col" style={{ gridArea: "armor" }}>
              <label htmlFor="actorName">Armor</label>
              <Select
                name="actorName"
                value={armor?.actorName ?? "null"}
                onChange={handleArmorChange}
              >
                <option value={"null"}>-</option>
                {armorOptions.map((armor) => (
                  <option key={armor.actorName} value={armor.actorName}>
                    {armor.enName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col" style={{ gridArea: "level" }}>
              <label htmlFor="level">Level</label>
              <Select
                name="level"
                value={level}
                onChange={(ev) => setLevel(+ev.target.value)}
                disabled={!armor?.hasUpgrades}
              >
                <option value={0}>
                  {armor?.hasUpgrades ? <>Unupgraded</> : <>Not upgradeable</>}
                </option>
                {(armor?.upgrades ?? []).map((_, i) => (
                  <option key={`upgrade-${i + 1}`} value={i + 1}>
                    {Array.from({ length: i + 1 }, () => STAR).join("")}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col" style={{ gridArea: "dye" }}>
              <label htmlFor="dye">Dye</label>
              <Select
                name="dye"
                value={dye}
                onChange={(ev) => setDye(ev.target.value)}
                disabled={!armor}
              >
                {[...(armor?.colors ?? [])].sort(compareDyes).map((dye) => (
                  <option key={`dye-${dye}`} value={dye}>
                    {dye}
                  </option>
                ))}
              </Select>
            </div>
            <div
              className="text-center self-end"
              style={{ gridArea: "buttons" }}
            >
              <Button
                type="submit"
                flavor="primary"
                onClick={handleSubmit}
                disabled={invalidReasons.size > 0}
                submitting={submitting}
              >
                Done
              </Button>
            </div>
          </form>

          <div
            style={{ gridArea: "errors" }}
            className="min-h-[1rem] text-rose-600"
          >
            {invalidReasons.has("already-have") && (
              <>You are already tracking that armor piece.</>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

function compareDyes(a: string, b: string) {
  if (a === "Base") return -1;
  if (b === "Base") return 1;
  return a.localeCompare(b);
}
