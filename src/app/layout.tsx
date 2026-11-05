import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { BhardwajBot } from "@/components/bhardwajbot/BhardwajBot";
import { CommandPalette } from "@/components/CommandPalette";
import { JsonLd } from "@/components/JsonLd";
import { LandscapeFooter } from "@/components/LandscapeFooter";
import { MaleHunter } from "@/components/MaleHunter";
import { RBSH } from "@/components/rbsh/RBSH";
import { ResumeRibbon } from "@/components/ResumeRibbon";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Ticker } from "@/components/Ticker";
import { buildFinderItems } from "@/lib/finder-items";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const pilowlava = localFont({
  src: "../../public/fonts/Pilowlava-Regular.woff2",
  variable: "--font-pilowlava",
  display: "swap",
  weight: "400",
});

const siteUrl = getSiteUrl();
// Existing site asset used for social preview cards on every page (720×630).
const ogImage = `${siteUrl}/assets/heroBanner.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Rudraksh Bhardwaj | Applied AI Engineer",
  description:
    "Applied AI Engineer building LLM systems, RAG pipelines, and production backends. Multi-model orchestration, computer vision, and distributed systems.",
  openGraph: {
    title: "Rudraksh Bhardwaj | Applied AI Engineer",
    description:
      "Applied AI Engineer building LLM systems, RAG pipelines, and production backends.",
    url: siteUrl,
    siteName: "Rudraksh Bhardwaj",
    locale: "en_US",
    type: "website",
    images: [{ url: ogImage, width: 720, height: 630, alt: "Rudraksh Bhardwaj — Applied AI Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rudraksh Bhardwaj | Applied AI Engineer",
    description:
      "Applied AI Engineer building LLM systems, RAG pipelines, and production backends.",
    images: [ogImage],
  },
};

/**
 * Site-level structured data. Only facts already published on the site are
 * declared; the Person node is referenced by id from article pages so the
 * graph stays consistent without duplication.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Rudraksh Bhardwaj",
      url: `${siteUrl}/`,
      jobTitle: "Applied AI Engineer",
      description:
        "Applied AI Engineer building LLM systems, RAG pipelines, and production backends.",
      sameAs: [
        "https://www.linkedin.com/in/rudraksh-bhardwaj-55a337278/",
        "https://x.com/Rudrakshb01",
        "https://github.com/Rudrakshbhardwaj01",
        "https://leetcode.com/u/Rudraksh2005/",
        "https://codeforces.com/profile/Bhardwaj01",
        "https://www.codechef.com/users/rudraksh01",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: "Rudraksh Bhardwaj",
      inLanguage: "en",
      publisher: { "@id": `${siteUrl}/#person` },
    },
  ],
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const finderItems = buildFinderItems();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${bebas.variable} ${plexMono.variable} ${pilowlava.variable} min-h-screen antialiased`}
      >
        <ThemeProvider>
          <Ticker />
          <ResumeRibbon />
          <ThemeToggle />
          {children}
          <LandscapeFooter />
          <MaleHunter />
          <RBSH />
          <BhardwajBot />
          <CommandPalette items={finderItems} />
          <JsonLd data={structuredData} />
        </ThemeProvider>
      </body>
    </html>
  );
}
