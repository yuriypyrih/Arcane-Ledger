import { configureStore } from "@reduxjs/toolkit";
import { activeCharacterSheetReducer } from "./activeCharacterSheetSlice";
import { diceRollerReducer } from "./diceRollerSlice";
import { toastReducer } from "./toastSlice";

export const store = configureStore({
  reducer: {
    activeCharacterSheet: activeCharacterSheetReducer,
    diceRoller: diceRollerReducer,
    toasts: toastReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
