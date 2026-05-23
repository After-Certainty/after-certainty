import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { GoogleAnalyticsLoader } from "@/components/analytics/google-analytics";
import { ConsentProvider } from "@/components/consent/consent-provider";
import { CookieBanner } from "@/components/consent/cookie-banner";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { defaultMetadata } from "@/lib/metadata";
import { texturePreloadHrefs } from "@/lib/textures";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500
              });
            `,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased" suppressHydrationWarning>
        <ConsentProvider>
          <ThemeProvider>
            <SiteShell>{children}</SiteShell>
          </ThemeProvider>
          <CookieBanner />
        </ConsentProvider>
        <GoogleAnalyticsLoader />
      </body>
    </html>
  );
}
