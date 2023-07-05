import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ModalState = NoModal | AddArmorModal;

interface NoModal {
  modal: "none";
}

interface AddArmorModal {
  modal: "add-armor";
}

const initialState: ModalState = { modal: "none" };

export const modalSlice = createSlice({
  name: "modal",
  initialState: initialState as ModalState,
  reducers: {
    closeModal: (state) => {
      state.modal = "none";
    },
    showModal: (
      state,
      action: PayloadAction<Exclude<ModalState["modal"], NoModal["modal"]>>
    ) => {
      state.modal = action.payload;
    },
  },
});

export const { actions: modalActions, reducer: modalReducer } = modalSlice;
