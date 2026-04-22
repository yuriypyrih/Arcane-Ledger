import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RollMode } from "../types";

export type DiceRollerState = {
  nextRollModeOverride: RollMode | null;
  nextRollCriticalHitOverride: boolean;
};

const initialState: DiceRollerState = {
  nextRollModeOverride: null,
  nextRollCriticalHitOverride: false
};

const diceRollerSlice = createSlice({
  name: "diceRoller",
  initialState,
  reducers: {
    setNextRollModeOverride(state, action: PayloadAction<RollMode>) {
      state.nextRollModeOverride = action.payload;
      state.nextRollCriticalHitOverride = false;
    },
    clearNextRollModeOverride(state) {
      state.nextRollModeOverride = null;
    },
    setNextRollCriticalHitOverride(state) {
      state.nextRollModeOverride = null;
      state.nextRollCriticalHitOverride = true;
    },
    clearNextRollCriticalHitOverride(state) {
      state.nextRollCriticalHitOverride = false;
    },
    clearNextRollOverrides(state) {
      state.nextRollModeOverride = null;
      state.nextRollCriticalHitOverride = false;
    }
  }
});

export const {
  clearNextRollCriticalHitOverride,
  clearNextRollModeOverride,
  clearNextRollOverrides,
  setNextRollCriticalHitOverride,
  setNextRollModeOverride
} = diceRollerSlice.actions;
export const diceRollerReducer = diceRollerSlice.reducer;
