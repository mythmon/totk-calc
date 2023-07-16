"use client";

import { useGetArmorsQuery } from "@/state/services/static";
import type { Component } from "@/components/component";
import { useCallback, useMemo, useReducer } from "react";
import d3 from "@/lib/shared/d3";
import {
  useGetArmorInventoryQuery,
  usePatchManyArmorInventoryMutation,
} from "@/state/services/inventory";
import Image from "next/image";
import type { Armor, Slot } from "@/lib/shared/armor";
import { Button } from "@/components/form/Button";

type ChangesState = Record<string, "add" | "remove">;
type ChangesAction =
  | { type: "reset" }
  | { armor: string; type: "add" | "remove" };

const BulkAddArmor: Component = () => {
  const armorsQuery = useGetArmorsQuery();
  const inventoryQuery = useGetArmorInventoryQuery();
  const [inventoryMutation, inventoryMutationState] =
    usePatchManyArmorInventoryMutation();

  const [changes, changesReducer] = useReducer(
    (state: ChangesState, action: ChangesAction): ChangesState => {
      if (action.type === "reset") {
        return {};
      } else if (action.type === "add") {
        if (inventoryQuery.data?.armor[action.armor]) {
          let { [action.armor]: _, ...newState } = state;
          return newState;
        } else {
          return { ...state, [action.armor]: "add" };
        }
      } else {
        if (inventoryQuery.data?.armor[action.armor]) {
          return { ...state, [action.armor]: "remove" };
        } else {
          let { [action.armor]: _, ...newState } = state;
          return newState;
        }
      }
    },
    {}
  );

  const armors = armorsQuery.data;
  const armorsBySetAndSlot = useMemo(
    () =>
      d3.group(
        armors ?? [],
        (a) =>
          a.setEnName && a.setEnName !== "None set"
            ? a.setEnName
            : `${a.enName} set`,
        (a) => a.slot
      ),
    [armors]
  );
  const changeCount = Object.keys(changes).length;

  const hasArmor = useCallback(
    (actorName: string) => {
      if (changes[actorName] === "add") return true;
      if (changes[actorName] === "remove") return false;
      return Object.hasOwn(inventoryQuery.data?.armor ?? {}, actorName);
    },
    [changes, inventoryQuery]
  );

  const handleSave = useCallback(async () => {
    if (changeCount === 0) return;
    await inventoryMutation(
      Object.fromEntries(
        Object.entries(changes).map(([actorName, action]) =>
          action === "add"
            ? [actorName, { dye: "Base", level: 0 }]
            : [actorName, null]
        )
      )
    );
    changesReducer({ type: "reset" });
  }, [changeCount, changes, inventoryMutation]);

  return (
    <>
      <h1 className="text-xl font-bold">Bulk add/remove armor</h1>

      <div className="pb-4 my-4 border-b">
        <Button
          className="mr-4"
          disabled={changeCount === 0 || inventoryMutationState.isLoading}
          onClick={handleSave}
        >
          Save
        </Button>
        {changeCount} change{changeCount == 1 ? "" : "s"}
        {inventoryMutationState.isLoading && " (saving...)"}
      </div>

      <table>
        <thead className="font-bold contents bg-sky-300">
          <tr className="sticky top-0 bg-sky-300">
            <th></th>
            <th className="text-center font-bold top-0">Head</th>
            <th className="text-center font-bold top-0">Upper</th>
            <th className="text-center font-bold top-0">Lower</th>
          </tr>
        </thead>
        <tbody>
          {d3
            .sort(armorsBySetAndSlot.entries(), (k) => k[0])
            .map(([setEnName, bySlot]) => (
              <tr key={`set-${setEnName}`} className="mb-2 border-b">
                <th className="text-start">{setEnName}</th>
                {(["head", "upper", "lower"] as Slot[]).map((slot, i) => (
                  <td
                    key={`set-${setEnName}-slot-${slot}`}
                    className="text-center ml-4 w-[100px]"
                  >
                    {bySlot.get(slot)?.map((armor) => (
                      <ArmorCheckbox
                        key={armor.actorName}
                        armor={armor}
                        hasArmor={hasArmor}
                        changesDispatch={changesReducer}
                        changes={changes}
                      />
                    ))}
                    {slot === "head" && bySlot.get("all")?.length && (
                      <ArmorCheckbox
                        armor={bySlot.get("all")?.[0]!}
                        hasArmor={hasArmor}
                        changesDispatch={changesReducer}
                        changes={changes}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
};

interface ArmorCheckboxProps {
  armor: Armor;
  hasArmor: (actorName: string) => boolean;
  changes: ChangesState;
  changesDispatch: React.Dispatch<ChangesAction>;
}

const ArmorCheckbox: Component<ArmorCheckboxProps> = ({
  armor,
  hasArmor,
  changes,
  changesDispatch,
}) => {
  const changed = Object.hasOwn(changes, armor.actorName);

  return (
    <div>
      {armor.iconUrls?.["Base"] && (
        <Image
          className="inline mr-2"
          src={armor.iconUrls["Base"]}
          alt={armor.enName}
          width={24}
          height={24}
        />
      )}
      <input
        className="col-start-2"
        type="checkbox"
        checked={hasArmor(armor.actorName)}
        onChange={(ev) =>
          changesDispatch({
            armor: armor.actorName,
            type: ev.target.checked ? "add" : "remove",
          })
        }
      />
      <div className="inline-block w-4">{changed ? "!" : ""}</div>
    </div>
  );
};

export default BulkAddArmor;
