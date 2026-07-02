import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { FONT_CATALOG_CLASSNAMES } from "@/lib/font-catalog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dzenn - Not your ordinary linktree",
  description: "A nonchalant link-in-bio that hits different. No cap, just vibes. Your main character era starts here – slay your links, bestie. 💅✨",
  openGraph: {
    title: "Dzenn - Not your ordinary linktree",
    description: "A nonchalant link-in-bio that hits different. No cap, just vibes. Your main character era starts here – slay your links, bestie. 💅✨",
    siteName: "Dzenn",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Dzenn - Not your ordinary linktree",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dzenn - Not your ordinary linktree",
    description: "A nonchalant link-in-bio that hits different. No cap, just vibes. Your main character era starts here – slay your links, bestie.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
         {process.env.NODE_ENV === "development" && (
          <Script src="//unpkg.com/react-scan/dist/auto.global.js" crossOrigin="anonymous" strategy="beforeInteractive" />
        )} 
      </head>*/}
      <body className={`${geistSans.variable} ${geistMono.variable} ${FONT_CATALOG_CLASSNAMES} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
