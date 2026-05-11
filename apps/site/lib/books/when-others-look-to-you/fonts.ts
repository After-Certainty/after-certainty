import { Inter, Playfair_Display } from "next/font/google";

/** Serif stack for titles and display — book cover feel */
export const fontHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

/** Sans stack for UI and long-form body text */
export const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
