import type { Decorator, Preview } from "@storybook/react";
import { createElement } from "react";
import "../src/app/globals.css";

/**
 * Wraps each story in the theme picked in the toolbar. "system" follows the OS
 * setting like the real site; "light" and "dark" set `data-theme` on a wrapper,
 * so each story on a docs page keeps its own theme.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as "system" | "light" | "dark";
  return createElement(
    "div",
    {
      "data-theme": theme === "system" ? undefined : theme,
      style: {
        minHeight: "100%",
        background: "var(--color-background)",
        color: "var(--color-text)",
      },
    },
    Story(),
  );
};

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "system", title: "System (OS setting)" },
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "system" },
  decorators: [withTheme],
};

export default preview;
