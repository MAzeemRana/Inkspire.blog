import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1f1c" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Inkspire — Stories, ideas & insights worth sharing",
    template: "%s | Inkspire",
  },
  description:
    "Inkspire is a blog about web development, design, productivity and the honest business of writing online. Practical guides written from first-hand experience.",
  keywords: [
    "blog",
    "web development",
    "design",
    "productivity",
    "seo",
    "writing",
    "next.js",
    "newsletter",
  ],
  authors: [{ name: "Alex Carter" }],
  creator: "Alex Carter",
  publisher: "Inkspire",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Inkspire",
    title: "Inkspire — Stories, ideas & insights worth sharing",
    description:
      "A blog about web development, design, productivity and the honest business of writing online.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inkspire — Stories, ideas & insights worth sharing",
    description:
      "A blog about web development, design, productivity and the honest business of writing online.",
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
    },
  },
};

/** Server-rendered structured data — always present in the crawler-visible HTML. */
const SITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Inkspire',
      url: SITE_URL,
      inLanguage: 'en',
      description:
        'A blog about web development, design, productivity and the honest business of writing online.',
    },
    {
      '@type': 'Blog',
      name: 'Inkspire',
      url: SITE_URL,
      description: 'Stories, ideas & insights worth sharing.',
      publisher: { '@type': 'Organization', name: 'Inkspire' },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
