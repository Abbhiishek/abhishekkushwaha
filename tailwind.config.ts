import type { Config } from 'tailwindcss';

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "Navy-Blue": {
          "navy-blue-50": "#e8eaee",
          "navy-blue-100": "#b6bcc9",
          "navy-blue-200": "#939caf",
          "navy-blue-300": "#626f8a",
          "navy-blue-400": "#435373",
          "navy-blue-500": "#142850",
          "navy-blue-600": "#122449",
          "navy-blue-700": "#0e1c39",
          "navy-blue-800": "#0b162c",
          "navy-blue-900": "#081122"
        },
        "Astronaut": {
          "astronaut-50": "#e9edf0",
          "astronaut-100": "#bcc7d2",
          "astronaut-200": "#9cabbc",
          "astronaut-300": "#6e859d",
          "astronaut-400": "#526d8a",
          "astronaut-500": "#27496d",
          "astronaut-600": "#234263",
          "astronaut-700": "#1c344d",
          "astronaut-800": "#15283c",
          "astronaut-900": "#101f2e"
        },
        "Blue-Chill": {
          "blue-chill-50": "#e7f2f4",
          "blue-chill-100": "#b4d6de",
          "blue-chill-200": "#8fc2cd",
          "blue-chill-300": "#5ca7b7",
          "blue-chill-400": "#3d95a9",
          "blue-chill-500": "#0c7b93",
          "blue-chill-600": "#0b7086",
          "blue-chill-700": "#095768",
          "blue-chill-800": "#074451",
          "blue-chill-900": "#05343e"
        },
        "Cerulean": {
          "cerulean-50": "#e6f6fa",
          "cerulean-100": "#b0e4ef",
          "cerulean-200": "#8ad7e8",
          "cerulean-300": "#54c5dd",
          "cerulean-400": "#33b9d6",
          "cerulean-500": "#00a8cc",
          "cerulean-600": "#0099ba",
          "cerulean-700": "#007791",
          "cerulean-800": "#005c70",
          "cerulean-900": "#004756"
        },
        "Neutrals": {
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
          "neutrals-13": "#0c0c0c"
        },
        "brand": {
          "brand-navy-blue": "#142850",
          "brand-astronaut": "#27496d",
          "brand-blue-chill": "#0c7b93",
          "brand-cerulean": "#00a8cc",
          "brand-dark": "#0c0c0c"
        }
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
      "fontFamily": {
        "dm-sans": "DM Sans"
      },
      "borderRadius": {
        "rounded-0": "0rem",
        "rounded-1": "0.3125rem",
        "rounded-2": "0.4375rem",
        "rounded-3": "0.5625rem",
        "rounded-4": "0.75rem",
        "rounded-5": "0.9375rem",
        "rounded-6": "1.125rem",
        "rounded-7": "1.875rem",
        "rounded-8": "2.1875rem",
        "rounded-9": "2.8125rem",
        "rounded-10": "3.625rem",
        "rounded-11": "3.75rem"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [addVariablesForColors],
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
