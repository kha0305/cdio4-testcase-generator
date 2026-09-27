---
description: Quy chuẩn thiết kế UI/UX và CSS cho toàn bộ dự án CDIO-4
globs: ["**/*.css", "**/*.html", "**/*.jsx", "**/*.tsx", "**/*.vue", "**/*.js", "**/*.ts"]
---

# UI/UX & CSS RULES

1. **NO EMOJIS**:
   - Do NOT use any unicode emoji in UI, alerts, buttons, status badges, or code comments.
   - Use clean SVG icons only (inline SVG or reusable SVG icon components like Lucide/Heroicons).

2. **SIMPLE, CLEAN, ENGINEERING-FOCUSED UI**:
   - Modern, professional tool aesthetic (Linear / GitHub / Vercel design system).
   - High information density with clean whitespace, no superfluous flashy animations.
   - Standard data tables with clear borders, muted headers, and sticky column headers.

3. **BUG-FREE CSS**:
   - Universal `box-sizing: border-box`.
   - Prevent horizontal page overflow (`overflow-x: hidden` on root, scrollable inner table containers).
   - Use CSS variables for colors, spacing, font sizes, and borders.
   - Clean responsive layout using Flexbox and CSS Grid.

4. **STRICTLY ACCENTED VIETNAMESE (TIẾNG VIỆT CÓ DẤU CHUẨN MỰC)**:
   - 100% Vietnamese text across UI (labels, buttons, placeholders, alerts, modals) and generated test cases (scenario, steps, expected results, verdict, exports) MUST have full, correct Vietnamese diacritics / accents.
   - Never use unaccented Vietnamese (không dấu). International technical terms (BVA, Pairwise, Pass, Fail) can be retained or shown alongside, but accompanying descriptions must always be accented Vietnamese.
