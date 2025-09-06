import type { JsonDataPack } from "@/store/schemas/pack.schema";
import localPacks from "@/store/services/data/packs.json";

type Locale = {
  value: string;
  label: string;
  unicode?: boolean;
  dataLocale?: string; // TECH DEBT: For mixed locales like zh-Hans/zh-Hant
  additionalCharacters?: string; // For languages with additional characters like ß or ñ
};

/**
 * If your language uses a different alphabet, please set the `unicode` flag here to `true`.
 * This is only necessary if the alphabet is not based on the latin alphabet at all.
 * Diacritics are fine and will be normalised with `String.prototype.normalize()` before searching.
 * Examples of where this is necessary: Korean, Russian.
 * Example of where this is not necessary: French, Polish.
 * Some languages add specific additional characters to the latin alphabet. These can be added as `additionalCharacters`.
 */
export const LOCALES: Record<string, Locale> = {
  de: { value: "de", label: "Deutsch (de)", additionalCharacters: "ß" },
  en: { value: "en", label: "English (en)" },
  es: { value: "es", label: "Español (es)", additionalCharacters: "ñ" },
  fr: { value: "fr", label: "Français (fr)" },
  ko: { value: "ko", label: "한국어/Korean (ko)", unicode: true },
  pl: { value: "pl", label: "Polski (pl)" },
  ru: { value: "ru", label: "Русский (ru)", unicode: true },
  zh: {
    value: "zh",
    label: "简体中文/Chinese (zh)",
    unicode: true,
    dataLocale: "zh-Hant",
  },
};

export const FLOATING_PORTAL_ID = "floating";

export const ISSUE_URL =
  "https://github.com/fspoettel/arkham.build/issues/new/choose";

export const REGEX_SKILL_BOOST = /\+\d+?\s\[(.+?)\]/g;

export const REGEX_USES = /Uses\s\(\d+?\s(\w+?)\)/;

export const REGEX_BONDED = /Bonded\s\((.*?)\)(\.|\s)/;

export const REGEX_SUCCEED_BY =
  /succe(ssful|ed(?:s?|ed?))(:? at a skill test)? by(?! 0)/;

const ACTION_TEXT: { [key: string]: string } = {
  fight: "Fight",
  engage: "Engage",
  investigate: "Investigate",
  draw: "Draw",
  move: "Move",
  evade: "Evade",
  parley: "Parley",
  resign: "Resign",
} as const;

export const ACTION_TEXT_ENTRIES = Object.entries(ACTION_TEXT);

export type SkillKey =
  | "agility"
  | "combat"
  | "intellect"
  | "willpower"
  | "wild";

export const SKILL_KEYS: SkillKey[] = [
  "willpower",
  "intellect",
  "combat",
  "agility",
  "wild",
] as const;

export type PlayerType =
  | "investigator"
  | "asset"
  | "event"
  | "skill"
  | "location"
  | "story"
  | "treachery"
  | "enemy"
  | "key";

export const PLAYER_TYPE_ORDER = [
  "investigator",
  "asset",
  "event",
  "skill",
  "location",
  "enemy",
  "enemy_location",
  "key",
  "treachery",
  "scenario",
  "act",
  "agenda",
  "story",
] as const;

export const ASSET_SLOT_ORDER = [
  "Hand",
  "Hand x2",
  "Accessory",
  "Ally",
  "Arcane",
  "Arcane x2",
  "Body",
  "Tarot",
  // followed by:
  // - multi_slot
  // - permanent
  // - Other
];

const SKILL_ICONS = [
  "skill_agility",
  "skill_combat",
  "skill_intellect",
  "skill_willpower",
  "skill_wild",
] as const;

export type SkillIcon = (typeof SKILL_ICONS)[number];

export const FACTION_ORDER = [
  "guardian",
  "seeker",
  "rogue",
  "mystic",
  "survivor",
  "neutral",
  "mythos",
] as const;

export type FactionName = (typeof FACTION_ORDER)[number];

export const COMPARISON_OPERATOR = ["=", "!="] as const;

export const SIDEWAYS_TYPE_CODES = ["act", "agenda", "investigator"];

export const CYCLES_WITH_STANDALONE_PACKS = [
  "core",
  "return",
  "investigator",
  "promotional",
  "parallel",
  "side_stories",
];

export const ALT_ART_INVESTIGATOR_MAP = {
  "98001": "02003",
  "98004": "01001",
  "98007": "08004",
  "98010": "05001",
  "98013": "07005",
  "98016": "07004",
  "98019": "11014",
  "99001": "05006",
};

export const SPECIAL_CARD_CODES = {
  /** Can be in ignore deck limit slots for TCU. */
  ACE_OF_RODS: "05040",
  /** Changes XP calculation for upgrades. */
  ADAPTABLE: "02110",
  /** Changes XP calculation for upgrades. */
  ARCANE_RESEARCH: "04109",
  /** Quantity scales with signature count. */
  BURDEN_OF_DESTINY: "08015",
  /** Allows to exile arbitrary cards. */
  BURN_AFTER_READING: "08076",
  /** Additional XP gain. */
  CHARONS_OBOL: "03308",
  /** Changes XP calculation for upgrades. */
  DEJA_VU: "60531",
  /** Connected to parallel roland's front. */
  DIRECTIVE: "90025",
  /** Changes XP calculation for upgrades. */
  DOWN_THE_RABBIT_HOLE: "08059",
  /** Has additional deck validation rule. */
  ELDRITCH_BRAND: "11080",
  /** Has deck size selection (and accompanying taboo). */
  MANDY: "06002",
  /** Scales with investigator deck size selection. */
  OCCULT_EVIDENCE: "06008",
  /** Has option to add cards to ignore deck limit slots. */
  PARALLEL_AGNES: "90017",
  /** Has spirit deck. */
  PARALLEL_JIM: "90049",
  /** Has option to add cards to ignore deck limit slots. */
  PARALLEL_SKIDS: "90008",
  /** Parallel front has deckbuilding impact. */
  PARALLEL_ROLAND: "90024",
  /** Parallel front has deckbuilding impact. */
  PARALLEL_WENDY: "90037",
  /** Special case for deck limit (considers subname). */
  PRECIOUS_MEMENTOS: ["08114", "08115"],
  /** Random basic weakness placeholder. */
  RANDOM_BASIC_WEAKNESS: "01000",
  /** Separate upgrade path. */
  SHREWD_ANALYSIS: "04106",
  /** Additional XP gain, switches deck investigator with a static investigator on defeat. */
  THE_GREAT_WORK: "11068a",
  /** Investigator can be transformed into this. */
  LOST_HOMUNCULUS: "11068b",
  /** Additional deck building not reflected in deck options. */
  SUZI: "89001",
  /** Connected to parallel wendy's front. */
  TIDAL_MEMENTO: "90038",
  /** adds deckbuilding requirements. */
  UNDERWORLD_SUPPORT: "08046",
  /** Weakness starts in spirit deck. */
  VENGEFUL_SHADE: "90053",
};

export const PLAYER_CARDS_ENCOUNTER_BACK_IDS = ["06028", "11016"];

export const ORIENTATION_CHANGED_CARDS = ["85037", "85038"];

export const CARD_SET_ORDER = [
  "base",
  "otherVersions",
  "requiredCards",
  "advanced",
  "replacement",
  "parallelCards",
  "bound",
  "bonded",
  "level",
  "parallel",
];

export const MQ_FLOATING_SIDEBAR = "(max-width: 52rem)";
export const MQ_FLOATING_FILTERS = "(max-width: 75rem)";

export const PREVIEW_PACKS = (localPacks as JsonDataPack[])
  .filter((p) => p.date_release && new Date() < new Date(p.date_release))
  .map((pack) => pack.code);

export const NO_SLOT_STRING = "none";

export const RETURN_TO_CYCLES: Record<string, string> = {
  core: "rtnotz",
  dwl: "rtdwl",
  ptc: "rtptc",
  tfa: "rttfa",
  tcu: "rttcu",
};

export const TAG_REGEX_FALLBACKS: Record<string, RegExp> = {
  fa: /[Ff]irearm/,
  hd: /[Hh]eal(?!ed)(?!th)(?! in excess of)[^.!?]*?damage/,
  hh: /[Hh]eal(?!ed)(?!th)(?! in excess of)[^.!?]*?horror/,
  pa: /[Pp]arley/,
  se: /[Ss]eal(?! of the)/,
};

export const CURRENT_CYCLE_POSITION = 11;

export const ARCHIVE_FOLDER_ID = "archive";
