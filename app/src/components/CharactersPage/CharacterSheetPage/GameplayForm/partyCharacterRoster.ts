import type { Character } from "../../../../types";
import type { CharacterRosterEntry } from "../../../../pages/CharactersPage/characterRoster";

export function createCharacterRosterEntryForPartyModal(
  character: Character
): CharacterRosterEntry {
  const sync = character.storageMetadata?.sync;

  return {
    id: character.id,
    background: character.background,
    className: character.className,
    hasLocalSheet: true,
    level: character.level,
    name: character.name,
    ...(sync?.ownerId ? { ownerId: sync.ownerId } : {}),
    ...(sync?.remoteId ? { remoteId: sync.remoteId } : {}),
    ...(sync?.remoteRevision ? { remoteRevision: sync.remoteRevision } : {}),
    ...(character.storageMetadata?.avatar?.imageUrl
      ? { avatarUrl: character.storageMetadata.avatar.imageUrl }
      : {}),
    source: "local",
    species: character.species,
    ...(character.subclassId ? { subclassId: character.subclassId } : {}),
    ...(sync?.syncStatus ? { syncStatus: sync.syncStatus } : {})
  };
}
