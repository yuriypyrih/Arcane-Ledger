export function createMasterChestRevisionFilter(revision: number) {
  if (revision === 1) {
    return {
      $or: [{ masterChestRevision: revision }, { masterChestRevision: { $exists: false } }]
    };
  }

  return { masterChestRevision: revision };
}
