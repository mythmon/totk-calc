import type { Component } from "@/components/component";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import {
  usePatchArmorInventoryMutation,
  useGetArmorInventoryQuery,
  useRemoveArmorInventoryMutation,
} from "@/state/services/totk";
import {
  type EditArmorModal as EditArmorModalProps,
  useModalProps,
  modalActions,
} from "@/state/slices/modal";
import { useCallback } from "react";
import Image from "next/image";
import type { Armor } from "@/lib/shared/armor";
import { CheckIcon } from "../icons/check";
import { StarIcon } from "../icons/star";
import { ColorSelector } from "../ColorSelector";
import { TrashIcon } from "../icons/trash";
import { useRouter } from "next/navigation";

export const EditArmorModal: Component = () => {
  const dispatch = useAppDispatch();
  const props = useModalProps<EditArmorModalProps>("edit-armor");
  const armor = useAppSelector((state) => {
    const list = state.armor.list;
    if (list.status === "loaded")
      return list.armors.find((a) => a.actorName === props.id);
    return null;
  });
  const armorInventoryQuery = useGetArmorInventoryQuery();
  const [editArmorMutation] = usePatchArmorInventoryMutation();
  const [removeArmorMutation] = useRemoveArmorInventoryMutation();
  const router = useRouter();

  const inventory = armor
    ? armorInventoryQuery.data?.armor[armor.actorName]
    : null;

  const handleClose = useCallback(
    (reason: string) => {
      let newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("armor");
      router.replace(newUrl.toString(), { scroll: false });
      dispatch(modalActions.close(reason));
    },
    [dispatch, router]
  );

  if (!armor) {
    return <div className="p-9">Armor {props.id} not found</div>;
  }
  if (!inventory) {
    return <div className="p-9">No inventory found</div>;
  }

  return (
    <div className="p-6">
      <div
        className="grid gap-2 grid-cols-[auto,minmax(64px,128px)]"
        style={{
          gridTemplateAreas: `
            "title close"
            "level image"
            "dye   trash"
          `,
        }}
      >
        <div className="text-end" style={{ gridArea: "close" }}>
          <button className="p-4" onClick={() => handleClose("close button")}>
            X
          </button>
        </div>
        <div style={{ gridArea: "title" }}>
          <h1 className="text-xl font-bold" style={{ gridArea: "title" }}>
            {armor.enName}
          </h1>
          <div className="italic">{armor.setEnName}</div>
        </div>
        <div style={{ gridArea: "image" }} className="border">
          <Image
            alt={`${armor.enName} with ${inventory.dye} dye`}
            src={armor.iconUrls[inventory.dye]!}
            width={128}
            height={128}
          />
        </div>

        <div style={{ gridArea: "level" }}>
          <h2 className="font-bold">
            Level {armor.hasUpgrades && inventory.level}
          </h2>
          <div className="pl-4">
            <LevelStarEditor
              armor={armor}
              currentLevel={inventory.level}
              setLevel={async (newLevel) => {
                editArmorMutation({
                  actorName: armor.actorName,
                  ...inventory,
                  level: newLevel,
                });
              }}
            />
          </div>
        </div>

        <div style={{ gridArea: "dye" }}>
          <h2 className="font-bold">Dye</h2>
          <div className="pl-4">
            {armor.colors.length <= 1 ? (
              <span className="italic">Not dyable</span>
            ) : inventory.dye === "Base" ? (
              <>Not dyed</>
            ) : (
              <>{inventory.dye}</>
            )}
            {armor.colors.length > 1 && (
              <div className="max-w-sm">
                <ColorSelector
                  colors={armor.colors}
                  selected={inventory.dye}
                  onChange={(newDye) => {
                    editArmorMutation({
                      actorName: armor.actorName,
                      ...inventory,
                      dye: newDye,
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="relative" style={{ gridArea: "trash" }}>
          <button
            className="absolute bottom-0 right-0"
            onClick={() => {
              removeArmorMutation(armor.actorName);
              handleClose("trashed");
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

interface LevelStarEditorProps {
  armor: Armor;
  currentLevel: number;
  setLevel: (newLevel: number) => void;
}

const LevelStarEditor: Component<LevelStarEditorProps> = ({
  armor,
  currentLevel,
  setLevel,
}) => {
  if (!armor.hasUpgrades) {
    return <div>Not upgradable</div>;
  }
  return (
    <div className="flex text-2xl">
      <button className="mr-2" onClick={() => setLevel(0)}>
        <CheckIcon width={24} />
      </button>
      {[1, 2, 3, 4].map((starLevel) => (
        <button
          key={`star-${starLevel}`}
          className="p-2"
          onClick={() => setLevel(starLevel)}
        >
          <StarIcon
            width={24}
            className={currentLevel >= starLevel ? "text-black" : "text-white"}
          />
        </button>
      ))}
    </div>
  );
};
