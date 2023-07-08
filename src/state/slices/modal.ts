import type { Component } from "@/components/component";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useAppSelector } from "../hooks";

export type ModalState = {
  name: null | ModalSpec["modal"];
  props: null | Omit<ModalSpec, "modal">;
};

export type ModalSpec = AddArmorModal | EditArmorModal;

export type ModalComponent<T extends ModalSpec> = Component<T>;

export interface AddArmorModal {
  modal: "add-armor";
}

export interface EditArmorModal {
  modal: "edit-armor";
  id: string;
}

export function useModalProps<T extends ModalSpec>(name: T["modal"]): T {
  const modalState = useAppSelector((state) => state.modal);
  if (modalState.name !== name) {
    throw new Error("invalid modal state");
  }
  return {
    modal: modalState.name,
    ...modalState.props,
  } as T;
}

const initialState: ModalState = { name: null, props: null };

export const modalSlice = createSlice({
  name: "modal",
  initialState: initialState as ModalState,
  reducers: {
    close: (state) => {
      state.name = null;
      state.props = null;
    },
    show: (state, action: PayloadAction<ModalSpec>) => {
      const { modal, ...props } = action.payload;
      state.name = modal;
      state.props = props;
    },
  },
});

export const { actions: modalActions, reducer: modalReducer } = modalSlice;
