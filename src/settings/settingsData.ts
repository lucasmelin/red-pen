export interface RedPenSettings {
  defaultVisibility: "show" | "hide";
  readingAge: number;
  algorithmThreshold: number;
  checkIntensify: boolean;
  checkReadability: boolean;
  checkPassive: boolean;
  checkSimplify: boolean;
}

export const DEFAULT_SETTINGS: RedPenSettings = {
  defaultVisibility: "show",
  readingAge: 12,
  algorithmThreshold: 4,
  checkIntensify: true,
  checkReadability: true,
  checkPassive: true,
  checkSimplify: true,
};
