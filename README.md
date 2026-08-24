# GetUp — Bold/Energetic redesign

## What changed and why

Bathroom Roulette already had the right bones — camera crosshairs, a pulsing
target emoji, "YOUR MISSION" framing. It just needed a color and type system
that matched that energy instead of a single flat orange doing everything.

**The system is a functional duotone, not a slapped-on accent:**
- **Volt** (`#D7FF3D`) = "go" states — CTAs, active toggles, target-lock, streaks
- **Coral** (`#FF3D5C`) = "urgent" states — the live alarm banner, failed attempts, retry
- **Near-black** (`#050505`) base with true-black cards for max contrast
- Type pushed to 800–900 weight with uppercase tracking on headlines and
  labels for that Nike Training "mission briefing" feel

Every color is a **token** in `constants/index.ts` — nothing is hardcoded
hex in the screens that don't need touching, which is why 4 of your screens
(`AlarmEditorScreen`, `AlarmCard`, `StatsScreen`, `HistoryScreen`) needed
**zero code changes**: they already referenced `COLORS.*` everywhere, so
they inherit the new palette automatically. That's the payoff of the
constants-based setup you already had — good instinct.

## Files touched

- `src/constants/index.ts` — new palette, radius, glow tokens
- `src/components/UI.tsx` — Button/Card/ScreenHeader (fixed text contrast on bright fills)
- `src/screens/AlarmsScreen.tsx` — CTA button colors
- `src/screens/ActiveChallengeScreen.tsx` — coral alert banner, volt CTA, bolder mission label
- `src/screens/ChallengeResultScreen.tsx` — coral retry, volt streak badge, green success
- `src/screens/ChallengeCameraScreen.tsx` — coral feedback banner, fixed permission button contrast

## How to apply

Copy each file over its matching path in your project (same `src/...`
structure). No new dependencies, no `app.json`/`package.json` changes —
this is a pure styling pass, so `npx expo start -c` (clear cache) and
you're set.

## An important fix baked in

Your original buttons put white text on bright gradient fills. With a volt
lime primary, white-on-volt is nearly unreadable — I added `COLORS.onPrimary`
(`#0A0A0A`) and switched every bright-fill button/badge to use it. Worth
remembering as a rule going forward: **any bright/neon background needs dark
text, not white.**

## Optional next step: a real display font

Right now the boldness comes from weight/tracking on the system font. If you
want to go further, an ultra-bold display face like **Archivo Black** or
**Anton** (free via `@expo-google-fonts`) on the big numerals and mission
labels would push this from "styled system font" to "actually has a
typographic identity." Happy to wire that up if you want it — it's a bit
more invasive (touches `App.tsx` for font loading) so I left it out of this
pass to keep it a safe, drop-in change.