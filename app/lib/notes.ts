export type NoteColor = "yellow" | "blue" | "coral" | "gold";

export type Note = {
  id: string;
  message: string;
  author: string;
  color: NoteColor;
  created_at: string;
};

/** Swatch order shown in the "Leave a Note" modal. */
export const NOTE_COLORS: NoteColor[] = ["yellow", "blue", "coral", "gold"];

export function isNoteColor(value: unknown): value is NoteColor {
  return typeof value === "string" && (NOTE_COLORS as string[]).includes(value);
}

type NoteTheme = {
  /** Card background. */
  card: string;
  /** Handwritten message text color. */
  text: string;
  /** Push-pin icon color. */
  pin: string;
  /** Divider above the author line. */
  border: string;
  /** Author ("— Name") color. */
  author: string;
  /** Swatch background used in the modal picker. */
  swatch: string;
};

/*
 * Each color maps to literal Tailwind class strings (from the original Classic
 * notes) so Tailwind v4 can statically detect them. Do not build these names
 * dynamically.
 */
export const NOTE_THEMES: Record<NoteColor, NoteTheme> = {
  yellow: {
    card: "bg-secondary-container",
    text: "text-on-secondary-container",
    pin: "text-on-secondary-container/30",
    border: "border-on-secondary-container/10",
    author: "text-on-secondary-container/60",
    swatch: "bg-secondary-container",
  },
  blue: {
    card: "bg-tertiary-container",
    text: "text-on-tertiary-container",
    pin: "text-on-tertiary-container/30",
    border: "border-on-tertiary-container/10",
    author: "text-on-tertiary-container/60",
    swatch: "bg-tertiary-container",
  },
  coral: {
    card: "bg-primary-fixed",
    text: "text-on-primary-fixed-variant",
    pin: "text-on-primary-fixed-variant/30",
    border: "border-on-primary-fixed-variant/10",
    author: "text-on-primary-fixed-variant/60",
    swatch: "bg-primary-fixed",
  },
  gold: {
    card: "bg-secondary-fixed",
    text: "text-on-secondary-fixed",
    pin: "text-on-secondary-fixed/30",
    border: "border-on-secondary-fixed/10",
    author: "text-on-secondary-fixed/60",
    swatch: "bg-secondary-fixed",
  },
};
