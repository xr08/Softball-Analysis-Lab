import { EventRole, TagDefinition } from "./types";

export type TaggingRole = Extract<EventRole, "pitcher" | "batter" | "fielder" | "review">;

export type WorkflowTagDefinition = TagDefinition & {
  role: TaggingRole;
};

export type WorkflowTagGroup = {
  role: TaggingRole;
  title: string;
  tags: WorkflowTagDefinition[];
};

function tag(
  role: TaggingRole,
  id: string,
  label: string,
  category: string,
  color = "#ccc"
): WorkflowTagDefinition {
  return { role, id, label, category, color };
}

export const WORKFLOW_TAG_GROUPS: WorkflowTagGroup[] = [
  {
    role: "pitcher",
    title: "Pitcher Tags",
    tags: [
      tag("pitcher", "fastball", "Fastball", "Pitch Type"),
      tag("pitcher", "rise", "Rise", "Pitch Type"),
      tag("pitcher", "drop", "Drop", "Pitch Type"),
      tag("pitcher", "change", "Change", "Pitch Type"),
      tag("pitcher", "ball", "Ball", "Pitch Result"),
      tag("pitcher", "called_strike", "Called Strike", "Pitch Result"),
      tag("pitcher", "swinging_strike", "Swinging Strike", "Pitch Result"),
      tag("pitcher", "foul", "Foul", "Pitch Result"),
      tag("pitcher", "ball_in_play", "In Play", "Pitch Result"),
      tag("pitcher", "walk", "Walk", "Outcome"),
      tag("pitcher", "strikeout", "Strikeout", "Outcome")
    ]
  },
  {
    role: "batter",
    title: "Batter Tags",
    tags: [
      tag("batter", "take", "Take", "Swing Decision"),
      tag("batter", "swing", "Swing", "Swing Decision"),
      tag("batter", "swing_and_miss", "Swing and Miss", "Swing Decision"),
      tag("batter", "contact", "Contact", "Contact Type"),
      tag("batter", "hard_contact", "Hard Contact", "Contact Type"),
      tag("batter", "weak_contact", "Weak Contact", "Contact Type"),
      tag("batter", "ground_ball", "Ground Ball", "Contact Type"),
      tag("batter", "line_drive", "Line Drive", "Contact Type"),
      tag("batter", "fly_ball", "Fly Ball", "Contact Type"),
      tag("batter", "hit", "Hit", "Outcome"),
      tag("batter", "out", "Out", "Outcome"),
      tag("batter", "good_decision", "Good Decision", "Coach Observation"),
      tag("batter", "chase", "Chase", "Coach Observation")
    ]
  },
  {
    role: "fielder",
    title: "Fielder Tags",
    tags: [
      tag("fielder", "routine_play", "Routine Play", "Fielding"),
      tag("fielder", "great_play", "Great Play", "Fielding"),
      tag("fielder", "error", "Error", "Fielding"),
      tag("fielder", "throwing_error", "Throwing Error", "Fielding"),
      tag("fielder", "missed_cutoff", "Missed Cutoff", "Fielding"),
      tag("fielder", "assist", "Assist", "Fielding"),
      tag("fielder", "double_play", "Double Play", "Fielding")
    ]
  },
  {
    role: "review",
    title: "Review Tags",
    tags: [
      tag("review", "coach_note", "Coach Note", "Review"),
      tag("review", "needs_review", "Needs Review", "Review"),
      tag("review", "highlight", "Highlight", "Review"),
      tag("review", "teachable_moment", "Teachable Moment", "Review"),
      tag("review", "check_timing", "Check Timing", "Review"),
      tag("review", "clip_for_player", "Clip for Player", "Review")
    ]
  }
];

export const STAGE_1_TAGS: WorkflowTagDefinition[] = WORKFLOW_TAG_GROUPS.flatMap((group) => group.tags);

