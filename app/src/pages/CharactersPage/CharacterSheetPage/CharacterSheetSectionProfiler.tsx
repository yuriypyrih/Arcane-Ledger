import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from "react";
import { isRenderProfilerEnabled, roundTiming } from "../../../lib/renderProfiler";

export type CharacterSheetSectionProfilerId =
  | "character-profile"
  | "gameplay"
  | "gameplay-actions"
  | "gameplay-bardic-inspiration"
  | "gameplay-camp"
  | "gameplay-divinity"
  | "gameplay-fighter-second-wind"
  | "gameplay-focus"
  | "gameplay-header-heroic-inspiration"
  | "gameplay-hit-points"
  | "gameplay-psi-energy"
  | "gameplay-rage"
  | "gameplay-round-tracker"
  | "gameplay-sorcery"
  | "gameplay-soulknife-psionic-dice"
  | "gameplay-superiority-dice"
  | "gameplay-traits-conditions"
  | "gameplay-wild-shape"
  | "character-stats"
  | "skills-proficiencies"
  | "class-features-feats"
  | `class-feature-body:${string}`
  | "companions"
  | "equipment"
  | "spellcasting";

type CharacterSheetSectionProfilerProps = {
  children: ReactNode;
  id: CharacterSheetSectionProfilerId;
};

type ReactProfilerPhase = Parameters<ProfilerOnRenderCallback>[1];

export type CharacterSheetSectionProfileSample = {
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
  id: CharacterSheetSectionProfilerId | string;
  phase: ReactProfilerPhase;
  recordedAt: number;
  startTime: number;
};

export type CharacterSheetSectionProfileSummary = {
  averageActualDuration: number;
  averageCommitDuration: number;
  count: number;
  id: CharacterSheetSectionProfilerId | string;
  latestCommitTime: number;
  latestPhase: ReactProfilerPhase;
  maxActualDuration: number;
  maxCommitDuration: number;
  totalActualDuration: number;
  totalCommitDuration: number;
};

type CharacterSheetSectionProfilerStore = {
  clear: () => void;
  getSamples: (
    id?: CharacterSheetSectionProfilerId | string
  ) => CharacterSheetSectionProfileSample[];
  getSummary: (
    id?: CharacterSheetSectionProfilerId | string
  ) => CharacterSheetSectionProfileSummary[];
  samples: CharacterSheetSectionProfileSample[];
};

declare global {
  interface Window {
    arcaneLedgerCharacterSheetSectionProfiler?: CharacterSheetSectionProfilerStore;
  }
}

const profilerIdPrefix = "character-sheet:";
const performanceMeasurePrefix = "arcane-ledger:character-sheet-section";
const profileEventName = "arcane-ledger:character-sheet-section-profile";
const maxStoredSamples = 1000;

function isCharacterSheetSectionProfilerEnabled(): boolean {
  return isRenderProfilerEnabled({ defaultEnabled: true });
}

function getSectionId(profilerId: string): CharacterSheetSectionProfileSample["id"] {
  return profilerId.startsWith(profilerIdPrefix)
    ? profilerId.slice(profilerIdPrefix.length)
    : profilerId;
}

function clearPerformanceMeasures(): void {
  if (
    typeof window.performance?.getEntriesByType !== "function" ||
    typeof window.performance?.clearMeasures !== "function"
  ) {
    return;
  }

  window.performance
    .getEntriesByType("measure")
    .filter((entry) => entry.name.startsWith(performanceMeasurePrefix))
    .forEach((entry) => {
      window.performance.clearMeasures(entry.name);
    });
}

function summarizeSamples(
  samples: CharacterSheetSectionProfileSample[]
): CharacterSheetSectionProfileSummary[] {
  const summaries = new Map<
    CharacterSheetSectionProfileSample["id"],
    CharacterSheetSectionProfileSummary
  >();

  samples.forEach((sample) => {
    const commitDuration = sample.commitTime - sample.startTime;
    const existing = summaries.get(sample.id);

    if (existing) {
      existing.count += 1;
      existing.totalActualDuration += sample.actualDuration;
      existing.totalCommitDuration += commitDuration;
      existing.averageActualDuration = existing.totalActualDuration / existing.count;
      existing.averageCommitDuration = existing.totalCommitDuration / existing.count;
      existing.maxActualDuration = Math.max(existing.maxActualDuration, sample.actualDuration);
      existing.maxCommitDuration = Math.max(existing.maxCommitDuration, commitDuration);
      existing.latestCommitTime = sample.commitTime;
      existing.latestPhase = sample.phase;
      return;
    }

    summaries.set(sample.id, {
      averageActualDuration: sample.actualDuration,
      averageCommitDuration: commitDuration,
      count: 1,
      id: sample.id,
      latestCommitTime: sample.commitTime,
      latestPhase: sample.phase,
      maxActualDuration: sample.actualDuration,
      maxCommitDuration: commitDuration,
      totalActualDuration: sample.actualDuration,
      totalCommitDuration: commitDuration
    });
  });

  return Array.from(summaries.values());
}

function ensureProfilerStore(): CharacterSheetSectionProfilerStore {
  const existingStore = window.arcaneLedgerCharacterSheetSectionProfiler;

  if (existingStore) {
    return existingStore;
  }

  const samples: CharacterSheetSectionProfileSample[] = [];
  const store: CharacterSheetSectionProfilerStore = {
    clear: () => {
      samples.length = 0;
      clearPerformanceMeasures();
    },
    getSamples: (id) => {
      if (!id) {
        return [...samples];
      }

      return samples.filter((sample) => sample.id === id);
    },
    getSummary: (id) => {
      const selectedSamples = id ? samples.filter((sample) => sample.id === id) : samples;
      return summarizeSamples(selectedSamples);
    },
    samples
  };

  window.arcaneLedgerCharacterSheetSectionProfiler = store;
  return store;
}

function recordPerformanceMeasure(sample: CharacterSheetSectionProfileSample): void {
  if (typeof window.performance?.measure !== "function") {
    return;
  }

  try {
    window.performance.measure(`${performanceMeasurePrefix}:${sample.id}:${sample.phase}`, {
      detail: sample,
      duration: sample.actualDuration,
      start: sample.startTime
    });
  } catch {
    // Older browsers may not support object-style PerformanceMeasureOptions.
  }
}

const onCharacterSheetSectionRender: ProfilerOnRenderCallback = (
  profilerId,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (!isCharacterSheetSectionProfilerEnabled() || typeof window === "undefined") {
    return;
  }

  const sample: CharacterSheetSectionProfileSample = {
    actualDuration,
    baseDuration,
    commitTime,
    id: getSectionId(profilerId),
    phase,
    recordedAt: window.performance.now(),
    startTime
  };
  const store = ensureProfilerStore();

  store.samples.push(sample);

  if (store.samples.length > maxStoredSamples) {
    store.samples.shift();
  }

  recordPerformanceMeasure(sample);
  window.dispatchEvent(new CustomEvent(profileEventName, { detail: sample }));
  console.debug(`[Arcane Ledger section profiler] ${sample.id}`, {
    actualDurationMs: roundTiming(actualDuration),
    baseDurationMs: roundTiming(baseDuration),
    commitDurationMs: roundTiming(commitTime - startTime),
    phase
  });
};

export function CharacterSheetSectionProfiler({
  children,
  id
}: CharacterSheetSectionProfilerProps) {
  if (!isCharacterSheetSectionProfilerEnabled()) {
    return <>{children}</>;
  }

  return (
    <Profiler id={`${profilerIdPrefix}${id}`} onRender={onCharacterSheetSectionRender}>
      {children}
    </Profiler>
  );
}
