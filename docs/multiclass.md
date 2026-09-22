# Multiclass characters

Multiclassing is an explicit edit to a character. Updating the app or opening a saved character does
not convert it. Existing single-class sheets keep the v2 format.
**Class Features → Edit** opens the class/subclass editor for the whole character, regardless of
which Build is selected. Saving subclass or starting-training changes alone keeps v2. Saving an
additional declared class adopts v3. Cancelling either editor leaves the character unchanged.

## Creating a character and distributing levels

Creation retains the single-class core profile and Build step. Add secondary classes after creation,
from **Edit Class and Subclass**. Each compact group contains class, subclass, applicable training,
and custom-class settings. One rules-enforcement checkbox below **+ Add Multiclass** applies to all
built-in classes together; newly selected classes inherit that setting. Custom classes retain their
custom rules. The primary class cannot change or be removed.
The primary group edits starting skill and tool/instrument choices; secondary groups use restricted
multiclass training. Existing background, species, feat, and manual proficiency sources remain intact.

**+ Add Multiclass** creates an empty class selector. After choosing a class, it can be saved at level 0.
A zero-level class retains its identity, subclass, and choices but grants no features, proficiencies,
spells, slots, HP, or Hit Dice. It appears in the two editors but not active Build/casting selectors or
character class summaries. Subclasses may be selected in advance; features retain their unlock levels.
Replacing a secondary class retains its levels but clears its previous class-specific choices and
uses a new ownership ID. Deleting one returns its levels to the primary class, preserving total level
and XP. Neither operation grants starting equipment.

**Level** edits XP, the **Total character level** budget, and allocation only. It lists every declared
class with fixed names and compact counters. The primary minimum is 1; secondary classes can return
to 0 without deletion. With only one declared class, all levels are allocated automatically. With
multiple declarations, players choose where to assign newly earned or redistributed levels. Saving
requires exactly the total budget; incomplete allocations appear as a red count and disable Save.
Standard **Level Up** stops at 20. **Level beyond 20** explicitly enables homebrew progression;
XP changes crossing 20 also require that opt-in. While editing the level directly, only **Confirm level**
and **Cancel level** are shown; confirming an entered level above 20 explicitly selects that level.
Existing characters above 20 remain editable.

Starting training is stored through existing class-sourced proficiency records. Secondary choices
remain owned by their class entry. New choices begin empty, and no secondary starting equipment or
saving throws are granted. Ability-score prerequisites do not block multiclassing. Feature-specific
choices and spell preparation remain in each active Build. Neither editor exposes recorded HP rolls.

## Inactive classes and compatibility

The existing v3 class list permits secondary levels of zero; the primary must remain positive.
Declared classes have stable IDs. Gameplay class access filters inactive entries, while definition
and level editors use the full list. Inactive entries bypass level-one normalization, preserve
stored choices and spent-resource records, and do not participate in rest recovery. Returning to
zero and reactivating a class does not refill its resources. Deletion removes its ownership records.
Class-granted feats that lose their required class level are retained in that class entry's
`inactiveFeats` choices, including expended uses. They leave the active feat list and return when
their required levels return; rests cannot recover these inactive uses. Deleting or replacing the
class discards its suspended choices.

No existing character needs migration. Deploy backend validation accepting zero-level secondary
entries before deploying clients that save them. The total still equals the sum of class levels;
there is no persisted unallocated-level budget or separate pending-class store.

## Rules and level ownership

The implementation follows the [2024 multiclass rules](https://www.dndbeyond.com/sources/dnd/br-2024/creating-a-character#Multiclassing)
and the classes' [multiclass starting benefits](https://www.dndbeyond.com/sources/dnd/br-2024/character-classes).
Artificer follows the revised Artificer content already in this repository, including half-caster
progression rounded up. This is not a selectable 2014/2024 rules switch.

| Depends on total character level                                                                          | Depends on the owning class's level                                                                                                           |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| XP, proficiency bonus, level prerequisites for feats, ordinary cantrip scaling, Tough and species scaling | Class/subclass unlocks, ASI/feat opportunities, class resources, spell preparation/learning, class-specific companion HP and feature formulas |

Each class has a stable entry ID. The starting class determines initial training and the maximum
Hit Die at character level one. Later classes grant their restricted multiclass training; they do
not grant another set of starting saving throws or starting equipment. Skill/instrument choices
start empty. The app permits class combinations without enforcing ability-score prerequisites.
Built-in classes cannot be duplicated. Custom
classes can coexist when they have different definition IDs.

Total level is the sum of class levels. The app accepts up to 100 total levels for homebrew play,
with no additional codex class features beyond level 20. Extra Attack alternatives use the strongest
applicable attack count rather than adding together. Armor formulas remain alternatives.

## HP and rests

Automatic HP uses each class's Hit Die, maximum at the first character level and fixed gains
thereafter, with Constitution applied at every level. Previously stored raw rolls still replace
individual fixed gains when present; the progression modal does not edit those records.
The first conversion records an adjustment so old rolled/manual HP totals are preserved; a custom
HP maximum remains under player control. Raising a maximum does not heal existing damage.
The HP editor displays the minimum–maximum range and an arithmetic formula labeling each Hit Die
with its class, including recorded rolls and preserved adjustments. Inactive classes contribute no
terms. Auto shows the computed Base HP; Manual retains the **Roll yourself** guidance.

Hit Dice belong to each class entry, including separate pools for classes with the same die size.
Resource management labels each pool with its class and die, with Use 1, Reset 1, and Reset All
without changing HP. Short rests use compact bounded counters for each class, including single-class
characters; cancelling spends nothing. A long rest can restore every active pool.

Spending is stored in `hitDiceExpendedByClass`, keyed by stable class entry ID. Old die-size totals
remain readable: spent dice are assigned to matching classes in stored class order, preserving the
total spent for each die size. Spending, restoring, or saving class progression writes class-owned
counts and removes the old totals. The progression draft assigns this ownership before levels or
class order change. Ordinary single-class sheets retain their v2 counter and format.

Lifedrinker's existing single-die action uses the largest available Hit Die and shows
that die in its healing formula. Class resources remain separate; for example, a Cleric/Paladin has
two independently selectable Channel Divinity recoveries.

## Spells

A spell's class source determines its default casting ability, learning/preparation limits, and
class-only modifiers. The spellcasting section contains a source selector when more than one casting source is available.
Payment-pool selection appears only when there is more than one pool. Each class keeps its own cantrips, spellbook,
prepared choices, and always-prepared grants. A higher shared slot does not unlock higher-level
spells for an individual class, and always-prepared grants do not consume preparation capacity.

When multiple classes grant Spellcasting, their caster contributions determine the shared slots:
full levels for full casters, half rounded up per revised half caster, and a third rounded down for
Eldritch Knight/Arcane Trickster. A lone Spellcasting class retains its native slot table. Pact Magic
is a separate pool, and each custom manual caster has a separate pool. The spellcasting section,
spell reactions, and feature action drawers expose payment-pool selection where applicable.
Wizard spells can use Pact slots and Warlock spells can use shared slots. Pact-specific costs still
use Pact Magic. A short rest recovers Pact slots without resetting shared slots.

Custom classes can select none, full, half, third, pact, or manual slot progression. Their spell
choices remain flexible; choosing a slot progression does not invent a custom class spell list or
preparation table. Existing Font of Magic behavior restores an expended ordinary slot; this change
does not add temporary slots above the configured maximum. It can convert Pact slots to Sorcery
Points, but it cannot manufacture Pact slots.

When the same spell is also granted by a species or feat, the existing species/feat ability override
still takes precedence. The source selector distinguishes classes; it does not yet offer separate
copies of a spell for every class, species, and feat origin.

## Builds, effects, and loading

The sheet shows one class build editor at a time. Choice-model modules are dynamically imported
when that class is opened. All classes continue contributing gameplay while another build is
selected. Shared codex/rules code remains available to the runtime; this is not complete lazy loading
of each class's rules. The existing PWA still precaches assets for offline use in the background.

Class-granted feats and recognizable feature effects/companions record their class owner. Removing
an owner deletes its owned state. Lowering class levels suspends unavailable feat choices and removes
unavailable effects/companions; changing subclasses removes effects belonging to the old subclass.
Ordinary inventory and manually entered traits are retained. These safeguards do not
infer ownership of arbitrary homebrew items or user-authored text.

## Saved data, cloud, and recovery

`Character.multiclass.classes` owns progression in v3. The legacy top-level class fields are a
compatibility projection of the starting class, and top-level level is the total. Editor/casting
views are transient and must be applied through the multiclass update helpers rather than saved
directly. Domain selectors invalidate when multiclass state changes.

Before the first local conversion, the app saves the original portable sheet under
`arcane-ledger.pre-multiclass.<clientId-or-localId>`. A storage quota error aborts the conversion.
The first v2-to-v3 cloud save also retains the original server sheet. This is an automatic compatibility
safeguard; the class editor has no backup download control. Characters created or imported directly
as v3 have no pre-conversion backup. Backups are not included in shared copies or roster responses.

Cloud saves use an atomic revision condition. Competing edits cannot both replace the same revision.
The API rejects v2 overwrites of a v3 character, including forced saves. Sharing/importing preserves
v3 progression while giving the recipient their own character identity. Deploy the compatible API
before releasing the frontend that can create v3 sheets. This document describes the implementation;
it does not mean it has been deployed.

## Verification boundaries

See [testing.md](testing.md) for commands. Multiclass tests cover all 156 ordered pairs of built-in
classes for persistence, targeted level/resource/formula cases, distinct custom classes, multiclass
casting/preparation/rests, migration backups, API conflicts, sharing, and desktop/mobile journeys.
The pair matrix is not exhaustive testing of every subclass, feat, spell, item, and level combination.
Production service-worker/offline behavior and live user databases are not exercised by browser
fixtures. Backups supplement regression tests; neither is a guarantee against every possible bug.
