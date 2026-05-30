import type { Metadata } from "next";
import { Crimson_Text } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const crimson = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rudrakshbhardwaj.com";

export const metadata: Metadata = {
  title: "Rudraksh Bhardwaj | Applied AI Engineer",
  description:
    "Applied AI Engineer focused on machine learning, backend systems, AI agents, and developer tooling.",
  openGraph: {
    title: "Rudraksh Bhardwaj | Applied AI Engineer",
    description:
      "Applied AI Engineer focused on machine learning, backend systems, AI agents, and developer tooling.",
    url: siteUrl,
    siteName: "Rudraksh Bhardwaj",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rudraksh Bhardwaj | Applied AI Engineer",
    description:
      "Applied AI Engineer focused on machine learning, backend systems, AI agents, and developer tooling.",
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
      <body className={`${crimson.variable} min-h-screen antialiased`}>
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
