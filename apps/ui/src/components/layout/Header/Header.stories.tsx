import { messages } from "@ethannet/messages";
import type { Meta, StoryObj } from "@storybook/react";
import { sampleNavLinks } from "../fixtures";
import { Header } from "./Header";

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Site header: logo on the left, navigation on the right. Mobile-first: below 768px the links live in the hamburger menu; from 768px they're shown inline. Use the viewport toolbar to switch between the two.",
      },
    },
  },
  args: { links: sampleNavLinks, messages },
};
export default meta;

type Story = StoryObj<typeof Header>;

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const Desktop: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
};

/** Dark theme on a phone. The site switches automatically with the OS setting; use the Theme toolbar to preview either theme. */
export const MobileDark: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false }, theme: "dark" },
};

/** Dark theme on desktop. */
export const DesktopDark: Story = {
  globals: { viewport: { value: "desktop", isRotated: false }, theme: "dark" },
};
