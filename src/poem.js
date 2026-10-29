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
    line: "I was made to fall",
    act: "The Burden of Expectation",
    side: 0,
  },
  {
    progress: 0.24,
    line: "and I will never believe",
    act: "The Monolithic Weight",
    side: -0.04,
  },
  {
    progress: 0.38,
    line: "that I was built for the sky",
    act: "The Suspended Cage",
    side: 0.04,
  },
  {
    progress: 0.52,
    line: "The truth is",
    act: "Critical Velocity & Void",
    side: 0,
  },
  {
    progress: 0.66,
    line: "gravity decides who I am",
    act: "Stress Fractures",
    side: -0.04,
  },
  {
    progress: 0.8,
    line: "It is a lie to say",
    act: "The Obsidian Horizon",
    side: 0.04,
  },
  {
    progress: 0.93,
    line: "the bottom is where I begin",
    act: "The Inverted Bedrock",
    side: 0,
  },
];

/** Sentence-case a line so it can open the reading (used for the rising reading). */
export function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
