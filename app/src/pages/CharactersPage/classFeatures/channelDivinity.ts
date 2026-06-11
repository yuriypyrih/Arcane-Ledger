import { getDivinityEntryById, type DivinityEntry } from "../../../codex/entries";

export const clericChannelDivinityActionKey = "cleric-channel-divinity";
export const paladinChannelDivinityActionKey = "paladin-channel-divinity";

export const clericChannelDivinityOptionKeys = {
  divineSpark: "divine-spark",
  turnUndead: "turn-undead",
  mindMagic: "cleric-mind-magic",
  preserveLife: "cleric-preserve-life",
  radianceOfTheDawn: "cleric-radiance-of-the-dawn",
  invokeDuplicity: "cleric-invoke-duplicity",
  guidedStrike: "cleric-guided-strike",
  warGodsBlessing: "cleric-war-gods-blessing"
} as const;

export const paladinChannelDivinityOptionKeys = {
  divineSense: "paladin-divine-sense",
  abjureFoes: "paladin-abjure-foes",
  naturesWrath: "paladin-natures-wrath",
  sacredWeapon: "paladin-sacred-weapon",
  inspiringSmite: "paladin-inspiring-smite",
  peerlessAthlete: "paladin-peerless-athlete",
  elementalSmite: "paladin-elemental-smite",
  vowOfEnmity: "paladin-vow-of-enmity"
} as const;

const divinityIdByOptionKey = new Map<string, string>([
  [clericChannelDivinityOptionKeys.divineSpark, "divinity-divine-spark"],
  [clericChannelDivinityOptionKeys.turnUndead, "divinity-turn-undead"],
  [clericChannelDivinityOptionKeys.mindMagic, "divinity-mind-magic"],
  [clericChannelDivinityOptionKeys.preserveLife, "divinity-preserve-life"],
  [clericChannelDivinityOptionKeys.radianceOfTheDawn, "divinity-radiance-of-the-dawn"],
  [clericChannelDivinityOptionKeys.invokeDuplicity, "divinity-invoke-duplicity"],
  [clericChannelDivinityOptionKeys.guidedStrike, "divinity-guided-strike"],
  [clericChannelDivinityOptionKeys.warGodsBlessing, "divinity-war-gods-blessing"],
  [paladinChannelDivinityOptionKeys.divineSense, "divinity-divine-sense"],
  [paladinChannelDivinityOptionKeys.abjureFoes, "divinity-abjure-foes"],
  [paladinChannelDivinityOptionKeys.naturesWrath, "divinity-natures-wrath"],
  [paladinChannelDivinityOptionKeys.sacredWeapon, "divinity-sacred-weapon"],
  [paladinChannelDivinityOptionKeys.inspiringSmite, "divinity-inspiring-smite"],
  [paladinChannelDivinityOptionKeys.peerlessAthlete, "divinity-peerless-athlete"],
  [paladinChannelDivinityOptionKeys.elementalSmite, "divinity-elemental-smite"],
  [paladinChannelDivinityOptionKeys.vowOfEnmity, "divinity-vow-of-enmity"]
]);

export function getChannelDivinityEntryForOption(optionKey: string): DivinityEntry | null {
  const divinityId = divinityIdByOptionKey.get(optionKey);

  return divinityId ? getDivinityEntryById(divinityId) : null;
}
