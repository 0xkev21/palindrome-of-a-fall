# Palindrome of a Fall

An interactive scroll narrative about the difference between **falling** and **flying**.

The page is built as a palindrome. Scrolling down carries you through seven acts of
collapse — concrete walls chiselled with the verdicts of other people, a boy in
freefall, an obsidian mirror at the bottom. Scroll back up and the same seven acts
play in reverse: gravity inverts, the fractures are welded with kintsugi gold, and
the descent becomes ascent. Same story, opposite meaning.

## Stack

- **Vite** — dev server and static build
- **GSAP + ScrollTrigger** — scroll choreography and mode transitions
- **Lenis** — weighted smooth scrolling
- **Three.js** — the scene artwork rendered as a GPU point cloud (44,800 particles)
- **Canvas 2D** — the environment: walls, monoliths, debris, shockwaves, typography
- **Web Audio API** — stereo ambient crossfades plus one-shot stingers, decoded from MP3

No UI framework: the DOM is hand-authored, the render loop is explicit.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

## How it works

| File | Role |
| --- | --- |
| `main.js` | Boot, preloader, scroll state machine, mode transitions, UI wiring |
| `src/canvas2d.js` | 2D environment engine: walls, monoliths, slipstream, water mirror |
| `src/particleImageEngine.js` | Three.js point-cloud renderer for the 7 acts (descent/ascent art) |
| `src/characterSvg.js` | The freefalling figure, injected as inline SVG |
| `src/audio.js` | Web Audio graph: ambient loops, crossfade, one-shots |

Scroll progress (0 → 1) drives everything. At `p > 0.94` the boy hits bedrock;
scrolling back up flips `truthMode` from 0 to 1 over 1.8s, which simultaneously
swaps the artwork set (`actN_desc` → `actN_asc`), the palette (cyan → gold), the
soundscape (descent pad → ascent pad) and the story text.

Controls: scroll (or drag) to move through the acts. Sound is **on by default** —
browsers block playback until the user interacts, so the soundtrack unlocks on the
first scroll, click or key press (the audio bytes are pre-fetched during the
preloader, so it starts without a download delay). Click **SOUND** to mute.

## Assets

`public/scenes/*.jpg` are 960px-wide 16:9 frames. The particle grid samples them at
280 × 160, so anything larger is invisible detail. `public/audio/*.mp3` are 160 kbps
stereo encodes of the original WAV masters — 6.7 MB → 750 kB with no audible loss on
these pads.

## Accessibility

`prefers-reduced-motion: reduce` is honoured: smooth scrolling, the trailing cursor,
particle flutter, mouse repulsion and character drift are all disabled, while the
scroll-driven story and the mode transition remain intact.

## Deployment

`dist/` is build output and is not committed. Build on deploy:

```bash
npm run build
# publish dist/ to your static host
```

If you host on GitHub Pages, use an Actions workflow that runs `npm run build` and
publishes `dist/` — publishing the repository root will serve the source, not the site.
