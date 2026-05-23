import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { defaultMetadata } from "@/lib/metadata";
import { texturePreloadHrefs } from "@/lib/textures";
import { Analytics } from "@vercel/analytics/next";

const display = Cormorant_Garamond({
  variable: "--font-display-serif",
  subsets: ["latin"],
  display: "swap",
});

const sans = Source_Sans_3({
  variable: "--font-sans-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`} suppressHydrationWarning>
      <head>
        {texturePreloadHrefs.map((href) => (
          <link key={href} rel="preload" href={href} as="image" />
        ))}
      </head>
      <body className="flex min-h-full flex-col antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
