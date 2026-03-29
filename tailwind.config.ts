import type { Config } from 'tailwindcss';

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts}',
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      "colors": {
        "navy-blue-50": "#f3e6fc",
        "navy-blue-100": "#d9b3f5",
        "navy-blue-200": "#c080ef",
        "navy-blue-300": "#a64de8",
        "navy-blue-400": "#8c1ae1",
        "navy-blue-500": "#8100D1",
        "navy-blue-600": "#6e00b2",
        "navy-blue-700": "#5a0093",
        "navy-blue-800": "#470074",
        "navy-blue-900": "#340055",
        "neutrals-1": "#ffffff",
        "neutrals-2": "#fdfdfd",
        "neutrals-3": "#f5f5f5",
        "neutrals-4": "#f0f0f0",
        "neutrals-5": "#dbdbdb",
        "neutrals-6": "#c2c2c2",
        "neutrals-7": "#929292",
        "neutrals-8": "#616161",
        "neutrals-9": "#4e4e4e",
        "neutrals-10": "#303030",
        "neutrals-11": "#292929",
        "neutrals-12": "#1f1f1f",
        "neutrals-13": "#0c0c0c",
        "brand-purple": "#8100D1",
        "brand-magenta": "#B500B2",
        "brand-pink": "#FF52A0",
        "brand-peach": "#FFA47F",
        "brand-dark": "#0c0c0c"
      },
      "fontSize": {
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.5625rem",
        "2xl": "1.625rem",
        "3xl": "2.1875rem",
        "4xl": "2.8125rem",
        "5xl": "3.4375rem",
        "6xl": "4.0625rem"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        clash: ["Satoshi", "sans-serif"],
        acme: ["Acme", "sans-serif"],
        adlam: ["ADLaM Display", "sans-serif"],
        aclonica: ["Aclonica", "sans-serif"],
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            "code::before": {
              content: "",
            },
            "code::after": {
              content: "",
            },
          },
        },
      }),
    },
  },
  plugins: [
    addVariablesForColors,
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
};


// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
export default config;
