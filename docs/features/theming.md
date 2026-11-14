# Theming: light and dark

The ui has a light and a dark theme. It follows the visitor's OS setting (`prefers-color-scheme`); there's no toggle yet. All colors come from CSS variables ("tokens") in `apps/ui/src/app/globals.css`, so any component that uses them, such as the [header, footer and mobile menu](site-layout.md), gets dark mode for free. The plan this was built from is [2026-11-14-dark-theme](../plans/2026-11-14-dark-theme.md).

## Tokens

| Token | Used for | Light | Dark |
| --- | --- | --- | --- |
| `--color-background` | Page background (`body`) | `#fafafa` | `#0a0a0a` |
| `--color-surface` | Raised surfaces: header, mobile menu panel | `#fff` | `#171717` |
| `--color-text` | Body text | `#1a1a1a` | `#ededed` |
| `--color-muted` | Secondary text: footer | `#555` | `#a3a3a3` |
| `--color-border` | Dividers: header and footer borders | `#e5e5e5` | `#2e2e2e` |
| `--color-shadow` | The mobile menu panel's shadow | `rgb(0 0 0 / 0.15)` | `rgb(0 0 0 / 0.6)` |
| `--color-backdrop` | The dimmed overlay behind the mobile menu | `rgb(0 0 0 / 0.4)` | `rgb(0 0 0 / 0.6)` |

`color-scheme` is set to match the theme, so the browser's own scrollbars and form controls follow it too. Text on the page background stays above WCAG AA contrast in both themes (muted text is about 7:1 in light and 8:1 in dark).

## How the theme is chosen

1. **Default:** the light values on `:root`.
2. **OS setting:** `@media (prefers-color-scheme: dark)` switches `:root` to the dark values, unless `data-theme="light"` is set.
3. **Override:** `data-theme="light"` or `data-theme="dark"` on any element forces that theme for its subtree, whatever the OS says. On `<html>` it covers the whole page; this is the hook for a future theme toggle. Storybook's **Theme** toolbar sets it on a wrapper around each story.

The dark values are written twice in `globals.css`, once for the media query and once for `[data-theme="dark"]`, because plain CSS can't share one block between them. Keep the two in sync.

## Changing things

- **A color:** change it in `globals.css` (both dark blocks, for a dark value) and in the expected values in `apps/e2e/tests/theme.spec.ts`.
- **A new component:** use the tokens (`var(--color-surface)`, ...), never raw colors, and it works in both themes. Add a token if none fits, with a light and a dark value.
- **Adding a toggle later:** a client component that sets `document.documentElement.dataset.theme` and stores the choice. Its label goes in the messages like any other copy. To avoid a flash of the wrong theme on load, the stored choice should be applied before first paint.

## Testing

- **e2e** (`apps/e2e/tests/theme.spec.ts`) emulates the OS setting with Playwright's `colorScheme` and checks the page, header and footer colors in both themes, the `data-theme` override in both directions, and the open mobile menu in dark mode on a phone:

  ```
  pnpm --filter @ethannet/e2e exec playwright test tests/theme.spec.ts
  ```

- Unit tests don't cover themes: jsdom doesn't apply stylesheets or media queries.
- **Storybook:** switch the **Theme** toolbar between System, Light and Dark on any story. `Header/MobileDark`, `Header/DesktopDark` and `Footer/Dark` show the dark theme.
- **Manually:** run `pnpm dev`, then switch your OS between light and dark mode (or, in Chrome DevTools, open the Rendering panel and use "Emulate CSS prefers-color-scheme"). The page should switch without a reload.
