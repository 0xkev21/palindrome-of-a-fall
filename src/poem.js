/**
 * The Palindrome Poem
 * Seven lines, one text, two readings. Read top → bottom while falling and it
 * is a verdict of collapse. Read bottom → top while flying and the very same
 * words become a manifesto. Nothing is rewritten — only the direction changes.
 *
 * `progress` is the scroll position (0 → 1) at which the line reaches the boy.
 */
export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

export const POEM = [
  {
    progress: 0.1,
    line: "Everything scatters into ash",
    act: "The Scattering Ash",
    side: 0,
  },
  {
    progress: 0.24,
    line: "and I refuse to believe",
    act: "The Monolithic Weight",
    side: -0.04,
  },
  {
    progress: 0.38,
    line: "the spark outlives the collapse",
    act: "The Suspended Spark",
    side: 0.04,
  },
  {
    progress: 0.52,
    line: "The drift reveals",
    act: "The Drift & Void",
    side: 0,
  },
  {
    progress: 0.66,
    line: "we are only dust in motion",
    act: "Stress Fractures",
    side: -0.04,
  },
  {
    progress: 0.8,
    line: "It is a lie that",
    act: "The Obsidian Horizon",
    side: 0.04,
  },
  {
    progress: 0.93,
    line: "what shatters can reform in light",
    act: "Reformation in Light",
    side: 0,
  },
];

/** Sentence-case a line so it can open the reading (used for the rising reading). */
export function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
