# Arcane Ledger: MongoDB collections

Source: `server/src/models/*.ts` (Mongoose). MongoDB has no real foreign keys; lines below are `ObjectId` references (`ref:` in the schemas). Attribute lists are the main fields, not every field.

```mermaid
erDiagram
    User ||--o{ CharacterSheet : "ownerId"
    User ||--o{ PartyGroup : "ownerId"
    User }o--o{ PartyGroup : "adminUserIds"
    PartyGroup }o--o{ CharacterSheet : "characterIds"
    CharacterSheet }o--o| PartyGroup : "partyGroupId"
    User ||--o{ Campaign : "ownerId"
    Campaign }o--o| PartyGroup : "selectedPartyId"
    Campaign }o--o| PartyGroup : "liveEncounterTracker.partyGroupId"
    User ||--o{ EncounterTemplate : "ownerId"
    User ||--o{ CustomItem : "ownerId"
    User ||--o{ CustomBestiary : "ownerId"
    User ||--o{ CustomSpell : "ownerId"
    User ||--o{ Feedback : "userId"
    CharacterSheet ||--o{ SharedCharacter : "sourceCharacterSheetId"
    User ||--o{ SharedCharacter : "originalOwnerId"
    PartyGroup ||--o{ MasterChestOperation : "partyGroupId"
    User ||--o{ MasterChestOperation : "actorUserId"
    CharacterSheet |o--o{ MasterChestOperation : "actorCharacterId"

    User {
        ObjectId _id PK
        string email UK
        string nickname
        string role
        string passwordHash
        Date emailVerifiedAt
        string emailVerificationTokenHash
        Date emailVerificationTokenExpiresAt
        string passwordResetTokenHash
        Date passwordResetExpiresAt
        Date passwordChangedAt
        Date lastFeedback
        Date lastInteractedAt
        object preferences "diceRollerBehavior, broadLayout, themeMode"
        boolean active
    }

    CharacterSheet {
        ObjectId _id PK
        ObjectId ownerId FK
        string clientId "unique per owner"
        number localId
        ObjectId partyGroupId FK
        number schemaVersion "2 or 3"
        number revision
        object summary
        object sheet "full character state"
        object preMulticlassBackup
        object avatar
        object backgroundTexture
        Date deletedAt "soft delete"
    }

    SharedCharacter {
        ObjectId _id PK
        string link UK
        ObjectId sourceCharacterSheetId FK
        ObjectId originalOwnerId FK
        number schemaVersion
        object summary
        object sheet "snapshot"
        Date expiresAt "TTL"
    }

    PartyGroup {
        ObjectId _id PK
        string name
        ObjectId ownerId FK
        ObjectId[] adminUserIds FK
        string inviteToken
        ObjectId[] characterIds FK
        object[] masterChestItems
        object masterChestCurrencies
        string[] masterChestHistory
        number masterChestRevision
    }

    MasterChestOperation {
        ObjectId _id PK
        string operationId UK "idempotency key"
        string requestHash
        ObjectId partyGroupId FK
        ObjectId actorUserId FK
        ObjectId actorCharacterId FK
        number chestRevision
        number characterRevision
        string executionMode "atomic or standalone"
        string status "prepared, character-applied, committed, recovery-required"
        object journal
        Date expiresAt "TTL"
    }

    Campaign {
        ObjectId _id PK
        string name
        ObjectId ownerId FK
        ObjectId selectedPartyId FK
        object[] sessionNotes "embedded"
        object visibilitySettings "embedded"
        object[] preparedEncounters "embedded"
        object liveEncounterTracker "embedded, has partyGroupId FK"
    }

    EncounterTemplate {
        ObjectId _id PK
        string name
        ObjectId ownerId FK
        object[] creatures "embedded"
    }

    CustomItem {
        ObjectId _id PK
        ObjectId ownerId FK
        boolean public
        object item
        object mods
        object settings
    }

    CustomBestiary {
        ObjectId _id PK
        ObjectId ownerId FK
        boolean public
        object monster "embedded MonsterRecord"
    }

    CustomSpell {
        ObjectId _id PK
        ObjectId ownerId FK
        boolean public
        string name
        number spellLevel
        string magicSchool
        string range
        boolean ritual
        string[] spellLists
        string[] castingTime
        string[] components
        string[] duration
        string[] description
        object[] customEffects
    }

    Feedback {
        ObjectId _id PK
        ObjectId userId FK
        string userEmail
        string content
    }

    Item {
        ObjectId _id PK
        string key "Open5e reference item"
        string name
        object category
        object rarity
        boolean is_magic_item
        object weapon
        object armor
    }

    Monster {
        ObjectId _id PK
        string key "Open5e reference monster"
        string name
        string challenge_rating
        object ability_scores
        object[] actions
    }

    AnalyticsDailyRollup {
        ObjectId _id PK
        Date date
        string eventName
        string source "frontend or backend"
        string route
        string method
        string statusFamily
        string visitorType
        string country
        number count
        string[] uniqueVisitorKeys
        string[] uniqueSessionKeys
    }

    AnalyticsAccountActivity {
        ObjectId _id PK
        Date date
        string accountKey "unique with date"
        Date firstRecordedAt
    }
```

## Notes

- `Item`, `Monster`, `AnalyticsDailyRollup` and `AnalyticsAccountActivity` have no references to other collections.
- `PartyGroup.characterIds` and `CharacterSheet.partyGroupId` describe the same membership from both sides.
- `SharedCharacter` and `MasterChestOperation` expire automatically (MongoDB TTL index on `expiresAt`).
- `CharacterSheet` is unique on `(ownerId, clientId)`; `User.email` is unique.
- Embedded sub-documents (Campaign notes/encounters, EncounterTemplate creatures, User preferences) are not separate collections.
