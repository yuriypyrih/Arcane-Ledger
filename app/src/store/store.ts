import { configureStore } from "@reduxjs/toolkit";
import { diceRollerReducer } from "./diceRollerSlice";
import { toastReducer } from "./toastSlice";

export const store = configureStore({
  reducer: {
    diceRoller: diceRollerReducer,
    toasts: toastReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
