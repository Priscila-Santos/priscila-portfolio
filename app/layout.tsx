import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
// TypeScript may complain about side-effect CSS imports when no ambient
// declaration is present. Suppress the error for this global stylesheet.
// @ts-ignore
import "./globals.css";
import { Syne, Inter, Space_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeScript } from "@/components/theme-script";
import { ThemeToggle } from "@/components/theme-toggle";
import { FloatingAiButton } from "@/components/floating-ai-button";
import Image from "next/image";
import { Footer } from "@/components/footer";

const SITE_URL = "https://priscila-portfolio.vercel.app";
const SITE_TITLE = "Priscila Santos — Front-End AI Engineering";
const SITE_DESCRIPTION =
  "Front-End AI Engineering intern building interactive, accessible web experiences and AI-powered applications with React, TypeScript, and the Vercel AI SDK.";

export const metadata: Metadata = {
  // Required by Next.js to resolve the absolute URL for Open Graph/Twitter
  // images below — without it, relative image paths silently fail to
  // resolve into a valid social-share preview.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/assets/favicon.png",
  },
  other: {
    google: "notranslate",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Priscila Santos — Portfolio",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Priscila Santos — Front-End AI Engineering",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/assets/og-image.jpg"],
  },
};

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-title",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-code",
});

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      translate="no"
      className={cn("font-sans", syne.variable, inter.variable, spaceMono.variable)}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <header className="border-b border-neutral-200">
          <nav
            aria-label="Main navigation"
            className="relative flex h-20 items-center justify-between px-page-x"
          >
            <MobileNav />

            <Link
              href="/"
              aria-label="Go to homepage"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:static sm:order-first sm:translate-x-0 sm:translate-y-0"
            >
              <div className="h-20 w-20 sm:h-24 sm:w-24 transition-transform duration-300 hover:scale-105 hover:drop-shadow-lg">
                <Image
                  src="/assets/logo.png"
                  alt="Priscila Santos"
                  width={128}
                  height={128}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>

            <ul className="hidden flex-wrap gap-6 text-nav sm:flex">
              <li>
                <Link className="text-primary hover:text-accent" href="/work">Work</Link>
              </li>
              <li>
                <Link className="text-primary hover:text-accent" href="/about">About</Link>
              </li>
              <li>
                <Link className="text-primary hover:text-accent" href="/contact">Contact</Link>
              </li>
              <li>
                <Link className="text-primary hover:text-accent" href="/playground">Playground</Link>
              </li>
              <li>
                <Link className="text-primary hover:text-accent" href="/lab/3d">3D Lab</Link>
              </li>
            </ul>

            <ThemeToggle />
          </nav>
        </header>
        <main id="main-content">{children}</main>
        <FloatingAiButton />
        {/* <Footer /> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };`,
          }}
        />
        <script defer src="/_vercel/insights/script.js" />
      </body>
    </html>
  );
}