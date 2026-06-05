import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import * as React from "react";
import "../app/globals.css";

// Layer 2: font variables. next/font does not run inside Storybook, so we inject
// the same CSS variable names the app exposes, each falling back to the matching
// Google font family name. Names MUST match app/layout.tsx exactly.
const FontVars = () => (
  <style>{`
    :root {
      --font-newsreader: "Newsreader", "Source Serif Pro", Georgia, serif;
      --font-dm-sans: "DM Sans", -apple-system, "Segoe UI", sans-serif;
      --font-caveat: "Caveat", "Bradley Hand", cursive;
      --font-jetbrains-mono: "JetBrains Mono", ui-monospace, monospace;
    }
  `}</style>
);

const preview: Preview = {
  decorators: [
    // Layer 3: palette toggle — applies classes to <body>, matching runtime.
    withThemeByClassName({
      themes: {
        light: "",
        dark: "palette-dark",
        pastel: "palette-pastel",
      },
      defaultTheme: "light",
      parentSelector: "body",
    }),
    // Layer 2: inject font vars + render the story.
    (Story) => (
      <>
        <FontVars />
        <Story />
      </>
    ),
  ],
  parameters: {
    // Backgrounds are driven by the palette (body bg from globals.css base layer),
    // so disable Storybook's own backgrounds addon to avoid conflicting surfaces.
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
