export {};
declare global {
  interface Window {
    stageUpdateDraft: (value: string) => void;
    runAppUpdate: () => Promise<void>;
    markUpdateAssetFailure: () => void;
  }
}
