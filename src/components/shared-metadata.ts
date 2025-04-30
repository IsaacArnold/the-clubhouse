import type { Metadata } from "next";

export const baseMetadata: Metadata = {
  title: {
    template: "%s | The Clubhouse",
    default: "The Clubhouse - Track your golf game",
  },
  description:
    "Track your golf scores, analyse your performance, and improve your game with The Clubhouse.",
  keywords: ["golf", "scorecard", "golf scores", "golf tracking", "golf app"],
  authors: [{ name: "Isaac Arnold" }],
  creator: "Isaac Arnold",
  publisher: "Isaac Arnold",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://theclubhouse.dev"),
  openGraph: {
    type: "website",
    siteName: "The Clubhouse",
    title: "The Clubhouse - Track your golf game",
    description:
      "Track your golf scores, analyse your performance, and improve your game with The Clubhouse.",
    images: [
      {
        url: "/images/clubhouse-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Clubhouse Golf App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Clubhouse Golf - Track your golf game",
    description:
      "Track your golf scores, analyse your performance, and improve your game with The Clubhouse.",
    images: ["/images/clubhouse-og-image.jpg"],
    creator: "@theclubhousegolf",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};
