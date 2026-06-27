import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export type CustomSpellRecord = {
  castingTime: string[];
  components: string[];
  customEffects?: Record<string, unknown>[];
  description: string[];
  duration: string[];
  magicSchool: string;
  materialSpecified?: string;
  name: string;
  ownerId: Types.ObjectId;
  public: boolean;
  range: string;
  ritual: boolean;
  spellLevel: number;
  spellLists: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type CustomSpellDocument = HydratedDocument<CustomSpellRecord>;

const customSpellSchema = new Schema<CustomSpellRecord>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 128
    },
    spellLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 9
    },
    magicSchool: {
      type: String,
      required: true,
      trim: true
    },
    spellLists: {
      type: [String],
      default: []
    },
    castingTime: {
      type: [String],
      default: []
    },
    range: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128
    },
    public: {
      type: Boolean,
      default: false,
      index: true
    },
    components: {
      type: [String],
      default: []
    },
    materialSpecified: {
      type: String,
      trim: true,
      maxlength: 500
    },
    duration: {
      type: [String],
      default: []
    },
    ritual: {
      type: Boolean,
      default: false
    },
    description: {
      type: [String],
      default: []
    },
    customEffects: {
      type: [Schema.Types.Mixed],
      default: []
    }
  },
  {
    collection: "customSpells",
    minimize: false,
    timestamps: true
  }
);

customSpellSchema.index({ ownerId: 1, updatedAt: -1 });
customSpellSchema.index({ public: 1, updatedAt: -1 });

export const CustomSpell =
  (mongoose.models.CustomSpell as Model<CustomSpellRecord> | undefined) ??
  model<CustomSpellRecord>("CustomSpell", customSpellSchema);
