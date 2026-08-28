# Storage Exit Check visual thesis

## Direction: botanical field guide

Storage migration is a work of patient observation. The site borrows the calm,
annotated precision of a field notebook: file trees become branching specimens,
hashes become identification marks, and the final report reads like a pressed
sample label. This is not nostalgia for paper. The field-guide language makes a
technical audit feel careful, finite, and inspectable.

The interface avoids a generic software dashboard. Fine rules, numbered specimen
labels, asymmetric columns, and a single hand-drawn root illustration establish
the product from a thumbnail. Decoration always points back to the task: paired
leaves represent two directory trees, and their shared root represents matching
content.

## Palette

The site is intentionally single-mode, like cream archival stock under daylight.
It paints every background explicitly.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F3EEDC` | page background |
| `--paper-deep` | `#E5DDC5` | inset panels and code |
| `--ink` | `#17251D` | primary text |
| `--moss` | `#315B43` | actions, rules, matched state |
| `--moss-dark` | `#1E422F` | action hover |
| `--lichen` | `#A9B78D` | quiet accents |
| `--ochre` | `#9A5C1F` | warnings and annotations |
| `--berry` | `#8A3535` | errors and missing files |
| `--white` | `#FFFDF6` | raised paper surface |

Body text on paper exceeds 12:1 contrast. White action text on moss-dark exceeds
8:1. Statuses always include a word or symbol, never color alone.

## Type

- Display: Georgia, Cambria, `Times New Roman`, serif. The compact, bookish forms
  recall specimen titles without requiring a downloaded font.
- Body and controls: system sans (`Inter` is not fetched), chosen for legibility
  in commands, tables, and small labels.
- Command output: ui-monospace with tabular figures.

No third-party or remote font files are used. Headings are slightly condensed by
measure rather than artificial letter spacing. Body copy stays within 68
characters.

## Spacing and shape

An 8 px base scale drives spacing: 8, 16, 24, 32, 48, 64, and 96 px. Borders are
one-pixel ink rules. Corners use a restrained 2–10 px range, like clipped paper
rather than rounded app cards. Buttons are at least 44 px high. Sections alternate
between open paper and ruled specimen sheets instead of repeating feature cards.

## Interaction grammar

Links are underlined like cross-references in a guide. Buttons are solid labels.
Focus uses a 3 px ochre outline with a 3 px offset. The demo terminal reveals its
audit lines once, top to bottom, like notes added to a field page. Route changes
focus the new heading and announce it. Narrow screens stack the specimen drawing
after the primary action and turn comparison columns into a readable list.

## Motion policy

One signature motion is used: the hero's fine root lines draw in over 700 ms and
terminal lines settle upward over 180 ms. Nothing loops. With
`prefers-reduced-motion: reduce`, both appear fully drawn and all scrolling is
instant. Only opacity and transforms animate.

## Asset plan and provenance

- `site/public/field-guide-roots.webp`: original generated botanical plate of two
  branching file trees joining at the root. It carries no text and supports the
  hero's explanation. It is generated at build time by the worker with
  `/opt/fleet/lib/gen-image.sh` using the factory `factory-image` deployment,
  then converted to WebP. Prompt: “Botanical field guide plate on warm archival
  cream paper, two distinct fern-like branching specimens side by side, their
  fine roots meeting around a small brass archive box, precise dark forest-green
  ink and sparse muted ochre watercolor washes, scientific pen-and-ink linework,
  generous negative space, subtle paper grain, balanced horizontal composition,
  no words, no letters, no numbers, no logos, no watermark.”
- `site/public/og-image.webp`: a 1200×630 crop composed from the same original
  plate with product typography added by the local build script. No external
  stock or icon assets are used.
- Favicon and small UI marks are original, hand-authored SVG line drawings stored
  in the repository.

The generated source and its JSON provenance remain in `site/assets/source/`.
