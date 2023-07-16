"use client";

import type { Component } from "@/components/component";
import { useAppSelector } from "@/state/hooks";
import { AddArmorModal } from "./AddArmorModal";
import { EditArmorModal } from "./EditArmorModal";
import type { ModalSpec } from "@/state/slices/modal";

const modalComponents: Record<ModalSpec["modal"], Component> = {
  "add-armor": AddArmorModal,
  "edit-armor": EditArmorModal,
};

export const Modals: Component = () => {
  const modalState = useAppSelector((state) => state.modal);

  if (modalState?.name === null) return null;
  let Modal: Component = modalComponents[modalState.name];
  if (!Modal) throw new Error(`unknown modal ${(modalState as any).modal}`);

  return (
    <>
      <div className="fixed left-0 right-0 top-0 bottom-0 opacity-80 bg-slate-600 z-10" />
      <div className="fixed left-0 right-0 top-0 bottom-0 z-20 p-8">
        <div className="mx-auto max-w-2xl bg-white shadow">
          <Modal />
        </div>
      </div>
    </>
  );
};
