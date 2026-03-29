import { PROF_LEVEL } from "../../../types";

export function getProficiencyMultiplier(level: PROF_LEVEL): 0 | 1 | 2 {
  if (level === PROF_LEVEL.EXPERT) {
    return 2;
  }

  if (level === PROF_LEVEL.PROFICIENT) {
    return 1;
  }

  return 0;
}
