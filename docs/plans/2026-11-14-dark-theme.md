# Plan: Dark theme for the header and footer

- **Date:** 2026-11-14
- **Status:** Done
- **Branch:** `feature/dark-theme`
- **Changeset:** minor
- **Produces:** [Theming](../features/theming.md) (new), [Site layout](../features/site-layout.md) (updated)

## Goal

Give the header, footer and mobile menu a dark theme. The user chose to **follow the OS setting** (`prefers-color-scheme`), with no toggle for now. Later components, starting with the jumbotron, should get dark mode by using the same tokens.

## Steps

1. Test first: a Playwright spec (`tests/theme.spec.ts`) that emulates light and dark OS settings and checks the computed colors of the page, header, footer and open mobile menu, plus a `data-theme` override.
2. Add dark values for the existing color tokens in `globals.css` under `prefers-color-scheme: dark`, with `[data-theme]` overrides, and set `color-scheme`.
3. Replace the mobile menu's two raw colors (shadow and backdrop) with new tokens.
4. Storybook: a Theme toolbar (System, Light, Dark) and dark variants of the Header and Footer stories.
5. Docs: a theming feature page, and a pointer from the site layout page.

## As built

Built as planned. `data-theme` works on any element, not only `<html>`, so Storybook can theme each story on a docs page separately. Without that, the last story rendered would set the theme for the whole page.
