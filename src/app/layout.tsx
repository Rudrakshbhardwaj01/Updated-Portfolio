import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Mono } from "next/font/google";
import { BhardwajBot } from "@/components/bhardwajbot/BhardwajBot";
import { RBSH } from "@/components/rbsh/RBSH";
import { ResumeRibbon } from "@/components/ResumeRibbon";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Ticker } from "@/components/Ticker";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rudraksh.is-a.dev";

export const metadata: Metadata = {
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Rudraksh Bhardwaj | Applied AI Engineer",
    description:
      "Applied AI Engineer building LLM systems, RAG pipelines, and production backends.",
  },
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${bebas.variable} ${plexMono.variable} min-h-screen antialiased`}
      >
        <ThemeProvider>
          <Ticker />
          <ResumeRibbon />
          <ThemeToggle />
          {children}
          <RBSH />
          <BhardwajBot />
        </ThemeProvider>
      </body>
    </html>
  );
}
