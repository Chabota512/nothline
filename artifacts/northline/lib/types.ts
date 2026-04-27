export type BuildCategory =
  | "skill"
  | "body"
  | "wealth"
  | "people"
  | "mind"
  | "drift";

export const BUILD_CATEGORIES: {
  id: BuildCategory;
  label: string;
  verb: string;
}[] = [
  { id: "skill", label: "Skill", verb: "sharpened a skill" },
  { id: "body", label: "Body", verb: "invested in your body" },
  { id: "wealth", label: "Wealth", verb: "built future wealth" },
  { id: "people", label: "People", verb: "tended relationships" },
  { id: "mind", label: "Mind", verb: "restored your mind" },
  { id: "drift", label: "Drift", verb: "drifted" },
];

export type TimeBlock = {
  id: string;
  startTime: number;
  endTime: number;
  primaryActivity: string;
  secondaryActivity?: string;
  builds?: BuildCategory;
  energy?: 1 | 2 | 3 | 4 | 5;
  note?: string;
  isReconstructed: boolean;
  createdAt: number;
};

export type Reflection = {
  id: string;
  date: string;
  stoleTime?: string;
  worked?: string;
  energy?: 1 | 2 | 3 | 4 | 5;
  createdAt: number;
};
