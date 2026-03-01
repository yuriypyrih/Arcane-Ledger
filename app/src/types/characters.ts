export type Character = {
  id: number;
  name: string;
  className: string;
  level: number;
};

export type CharacterDraft = Omit<Character, "id">;
