export interface ObsidianRetextSettings {
  defaultVisibility: "show" | "hide";
  readingAge: number;
  checkIntensify: boolean;
  checkReadability: boolean;
  checkPassive: boolean;
  checkSimplify: boolean;
}

export const DEFAULT_SETTINGS: ObsidianRetextSettings = {
  defaultVisibility: "show",
  readingAge: 12,
  checkIntensify: true,
  checkReadability: true,
  checkPassive: true,
  checkSimplify: true,
};
