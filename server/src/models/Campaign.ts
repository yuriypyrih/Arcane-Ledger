import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";
import {
  encounterTemplateCreatureSchema,
  type EncounterTemplateCreatureRecord
} from "./EncounterTemplate.js";

export type CampaignSessionNoteRecord = {
  id: string;
  name?: string;
  description: string;
};

export type PlayerVisibilitySettingsRecord = {
  showVitalityStatus: boolean;
  showHpBar: boolean;
  showMonsterType: boolean;
  showBaseStatBlockDescription: boolean;
  showDmDescription: boolean;
  showArmorClass: boolean;
  showChallengeRating: boolean;
  showAbilityScoresAndSavingThrows: boolean;
  showResistancesAndImmunities: boolean;
  showSkills: boolean;
  showSenses: boolean;
  showLanguages: boolean;
  showActionsAndReactions: boolean;
};

export type CampaignVisibilitySettingsRecord = PlayerVisibilitySettingsRecord & {
  showHp?: boolean;
};

export type CampaignPreparedEncounterCreatureRecord = EncounterTemplateCreatureRecord & {
  visibilitySettings?: PlayerVisibilitySettingsRecord | null;
};

export type CampaignPreparedEncounterRecord = {
  id: string;
  name: string;
  visibilitySettings?: PlayerVisibilitySettingsRecord | null;
  creatures: CampaignPreparedEncounterCreatureRecord[];
};

export type CampaignRecord = {
  name: string;
  ownerId: Types.ObjectId;
  sessionNotes: CampaignSessionNoteRecord[];
  visibilitySettings: CampaignVisibilitySettingsRecord;
  selectedPartyId?: Types.ObjectId | null;
  preparedEncounters: CampaignPreparedEncounterRecord[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type CampaignDocument = HydratedDocument<CampaignRecord>;

const campaignSessionNoteSchema = new Schema<CampaignSessionNoteRecord>(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000
    }
  },
  {
    _id: false
  }
);

const defaultCampaignVisibilitySettings = {
  showVitalityStatus: true,
  showHpBar: false,
  showMonsterType: false,
  showBaseStatBlockDescription: false,
  showDmDescription: false,
  showArmorClass: false,
  showChallengeRating: false,
  showAbilityScoresAndSavingThrows: false,
  showResistancesAndImmunities: false,
  showSkills: false,
  showSenses: false,
  showLanguages: false,
  showActionsAndReactions: false
} satisfies PlayerVisibilitySettingsRecord;

const campaignVisibilitySettingsSchema = new Schema<CampaignVisibilitySettingsRecord>(
  {
    showHp: {
      type: Boolean
    },
    showVitalityStatus: {
      type: Boolean,
      default: true,
      required: true
    },
    showHpBar: {
      type: Boolean,
      default: false,
      required: true
    },
    showMonsterType: {
      type: Boolean,
      default: false,
      required: true
    },
    showBaseStatBlockDescription: {
      type: Boolean,
      default: false,
      required: true
    },
    showDmDescription: {
      type: Boolean,
      default: false,
      required: true
    },
    showArmorClass: {
      type: Boolean,
      default: false,
      required: true
    },
    showChallengeRating: {
      type: Boolean,
      default: false,
      required: true
    },
    showAbilityScoresAndSavingThrows: {
      type: Boolean,
      default: false,
      required: true
    },
    showResistancesAndImmunities: {
      type: Boolean,
      default: false,
      required: true
    },
    showSkills: {
      type: Boolean,
      default: false,
      required: true
    },
    showSenses: {
      type: Boolean,
      default: false,
      required: true
    },
    showLanguages: {
      type: Boolean,
      default: false,
      required: true
    },
    showActionsAndReactions: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  {
    _id: false
  }
);

const campaignPreparedEncounterCreatureSchema =
  encounterTemplateCreatureSchema.clone() as Schema<CampaignPreparedEncounterCreatureRecord>;

campaignPreparedEncounterCreatureSchema.add({
  visibilitySettings: {
    type: campaignVisibilitySettingsSchema,
    default: null
  }
});

const campaignPreparedEncounterSchema = new Schema<CampaignPreparedEncounterRecord>(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 128
    },
    visibilitySettings: {
      type: campaignVisibilitySettingsSchema,
      default: null
    },
    creatures: {
      type: [campaignPreparedEncounterCreatureSchema],
      default: []
    }
  },
  {
    _id: false,
    minimize: false
  }
);

const campaignSchema = new Schema<CampaignRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 128
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sessionNotes: {
      type: [campaignSessionNoteSchema],
      default: []
    },
    visibilitySettings: {
      type: campaignVisibilitySettingsSchema,
      default: () => ({ ...defaultCampaignVisibilitySettings }),
      required: true
    },
    selectedPartyId: {
      type: Schema.Types.ObjectId,
      ref: "PartyGroup",
      default: null
    },
    preparedEncounters: {
      type: [campaignPreparedEncounterSchema],
      default: []
    }
  },
  {
    collection: "campaigns",
    minimize: false,
    timestamps: true
  }
);

campaignSchema.index({ ownerId: 1, updatedAt: -1 });
campaignSchema.index({ selectedPartyId: 1 });

export const Campaign =
  (mongoose.models.Campaign as Model<CampaignRecord> | undefined) ??
  model<CampaignRecord>("Campaign", campaignSchema);
