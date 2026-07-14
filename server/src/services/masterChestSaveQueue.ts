const saveQueues = new Map<string, Promise<void>>();

export async function runQueuedMasterChestSave<T>(
  partyGroupId: string,
  save: () => Promise<T>
): Promise<T> {
  const previousSave = saveQueues.get(partyGroupId) ?? Promise.resolve();
  let releaseQueue: () => void = () => undefined;
  const currentGate = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });
  const currentSave = previousSave.then(() => currentGate);

  saveQueues.set(partyGroupId, currentSave);
  await previousSave;

  try {
    return await save();
  } finally {
    releaseQueue();

    if (saveQueues.get(partyGroupId) === currentSave) {
      saveQueues.delete(partyGroupId);
    }
  }
}
