import { configureStore } from "@reduxjs/toolkit";
import { activeCharacterSheetReducer } from "./activeCharacterSheetSlice";
import { authReducer } from "./authSlice";
import { diceRollerReducer } from "./diceRollerSlice";
import { dmToolsReducer } from "./dmToolsSlice";
import { toastReducer } from "./toastSlice";

export const store = configureStore({
  reducer: {
    activeCharacterSheet: activeCharacterSheetReducer,
    auth: authReducer,
    diceRoller: diceRollerReducer,
    dmTools: dmToolsReducer,
    toasts: toastReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
