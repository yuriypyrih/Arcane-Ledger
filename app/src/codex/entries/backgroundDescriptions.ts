import type { BackgroundEntry } from "./types";

export type BackgroundEntryWithoutDescription = Omit<BackgroundEntry, "description">;

const backgroundDescriptions: Record<string, string> = {
  "background-acolyte-2024":
    "Acolytes grew through temple service and sacred study, learning rites, religion, and a first taste of divine power.",
  "background-artisan-2024":
    "Artisans are trained makers and traders whose craft teaches problem solving, negotiation, and practical confidence.",
  "background-charlatan-2024":
    "Charlatans live by false faces, quick hands, and convincing lies, turning deception into a tool for survival.",
  "background-criminal-2024":
    "Criminals learned to survive in alleys, gangs, or secret crews where stealth, theft, and fast judgment mattered most.",
  "background-entertainer-2024":
    "Entertainers make their living through performance and spectacle, winning attention with agility, presence, and practiced charm.",
  "background-farmer-2024":
    "Farmers come from hard labor and close ties to land, animals, and neighbors, bringing grit and natural sense to adventure.",
  "background-guard-2024":
    "Guards are watchful protectors trained to spot trouble, hold a post, and keep order when danger enters the street.",
  "background-guide-2024":
    "Guides know wild paths, weather, and landmarks, leading others through harsh places with stealth and survival skill.",
  "background-hermit-2024":
    "Hermits withdrew from ordinary life to seek healing, faith, or revelation, emerging with quiet wisdom and practical remedies.",
  "background-merchant-2024":
    "Merchants learned roads, ledgers, and human nature, turning trade into a source of patience, persuasion, and luck.",
  "background-noble-2024":
    "Nobles were raised among rank, etiquette, and responsibility, using education and influence to open doors.",
  "background-sage-2024":
    "Sages spent formative years among books and libraries, chasing lore, history, and the first sparks of arcane understanding.",
  "background-sailor-2024":
    "Sailors are shaped by ships and storms, relying on balance, perception, and hard lessons from life at sea.",
  "background-scribe-2024":
    "Scribes work with records, letters, and fine detail, making them observant, orderly, and comfortable around secrets on paper.",
  "background-soldier-2024":
    "Soldiers were trained for battle from an early age, carrying discipline, endurance, and reflexes forged in war.",
  "background-wayfarer-2024":
    "Wayfarers grew up moving through streets and roads with little support, surviving through insight, stealth, and luck.",
  "background-chondathan-freebooter-frhof":
    "Chondathan Freebooters are roaming coastal raiders and opportunists who rely on strong arms, nimble hands, and rough seafaring instincts.",
  "background-dead-magic-dweller-frhof":
    "Dead Magic Dwellers survived places where magic failed or warped, learning tough remedies, hard travel, and wary self reliance.",
  "background-dragon-cultist-frhof":
    "Dragon Cultists were drawn into secret worship and draconic promises, blending stealth, deception, and dangerous devotion.",
  "background-emerald-enclave-caretaker-frhof":
    "Emerald Enclave Caretakers protect wild places and fragile creatures, using nature lore and patient survival skills.",
  "background-flaming-fist-mercenary-frhof":
    "Flaming Fist Mercenaries are disciplined hired soldiers from a hard edged company, accustomed to intimidation, patrols, and battlefield grit.",
  "background-genie-touched-frhof":
    "Genie Touched characters carry signs of elemental wonder or genie influence, pairing social poise with strange arcane fortune.",
  "background-harper-frhof":
    "Harpers work in song, secrets, and quiet resistance, using performance and disguise to protect the vulnerable.",
  "background-ice-fisher-frhof":
    "Ice Fishers endured frozen waters and cruel weather, trusting strength, animal sense, and alert habits to stay alive.",
  "background-knight-of-the-gauntlet-frhof":
    "Knights of the Gauntlet are sworn champions against corruption, trained for duty, mercy, and righteous confrontation.",
  "background-lords-alliance-vassal-frhof":
    "Lords' Alliance Vassals serve noble networks and city interests, balancing courtly insight with public persuasion.",
  "background-moonwell-pilgrim-frhof":
    "Moonwell Pilgrims seek sacred waters and moonlit rites, blending devotion to nature with artful reverence.",
  "background-mulhorandi-tomb-raider-frhof":
    "Mulhorandi Tomb Raiders delve ancient tombs and divine ruins, combining investigation, religion, and a taste for risk.",
  "background-mythalkeeper-frhof":
    "Mythalkeepers study ancient wards and living magic, preserving lore through craft, history, and arcane care.",
  "background-purple-dragon-squire-frhof":
    "Purple Dragon Squires train near Cormyr's proud knights, learning service, mounted duty, and honorable command.",
  "background-rashemi-wanderer-frhof":
    "Rashemi Wanderers come from harsh eastern lands where pride, travel, and survival shape a fierce road spirit.",
  "background-shadowmasters-exile-frhof":
    "Shadowmasters Exiles know the cost of criminal politics, carrying stealth, acrobatics, and a talent for staying alive.",
  "background-spellfire-initiate-frhof":
    "Spellfire Initiates have brushed against raw magic, studying arcane signs while gambling with power that few understand.",
  "background-zhentarim-mercenary-frhof":
    "Zhentarim Mercenaries sell strength and fear for profit, mixing intimidation, forged papers, and ruthless ambition.",
  "background-archaeologist-efa":
    "Archaeologists chase buried history through ruins and wild sites, reading maps, relics, and danger with practiced care.",
  "background-house-agent-efa":
    "House Agents serve the great dragonmarked houses, mixing noble access, investigation, and artisan ties to advance house goals.",
  "background-inquisitive-efa":
    "Inquisitives are sharp investigators of crime and conspiracy, following clues through city shadows with patient suspicion."
};

export function addBackgroundDescription(
  entry: BackgroundEntryWithoutDescription
): BackgroundEntry {
  return {
    ...entry,
    description: backgroundDescriptions[entry.id] ?? ""
  };
}
