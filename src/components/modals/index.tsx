"use client";

import type { Component } from "@/components/component";
import { useAppSelector } from "@/state/hooks";
import { AddArmorModal } from "./AddArmorModal";

export const Modals: Component = () => {
  const modalState = useAppSelector((state) => state.modal);

  let Modal;
  switch (modalState.modal) {
    case "none":
      return null;
    case "add-armor": {
      Modal = AddArmorModal;
      break;
    }
    default:
      throw new Error(`unknown modal ${(modalState as any).modal}`);
  }

  return (
    <>
      <div className="absolute left-0 right-0 top-0 bottom-0 opacity-80 bg-slate-600 z-10" />
      <div className="absolute left-0 right-0 top-0 bottom-0 z-20">
        <div className="mx-auto my-8 max-w-2xl bg-white shadow">
          <Modal />
        </div>
      </div>
    </>
  );
};
