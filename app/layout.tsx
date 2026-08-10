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

export const metadata: Metadata = {
  title: "Priscila Santos — Front-End AI Engineering",
  description: "Front-End AI Engineering intern building interactive, accessible web experiences and AI-powered applications with React, TypeScript, and the Vercel AI SDK."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
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
            className="relative flex h-16 items-center justify-between px-page-x"
          >
            <MobileNav />

            <Link
              href="/"
              aria-label="Go to homepage"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:static sm:order-first sm:translate-x-0 sm:translate-y-0"
            >
              <div className="h-9 w-9 overflow-hidden rounded sm:h-11 sm:w-11">
                <Image
                  src="/assets/PS-logo.png"
                  alt="Priscila Santos"
                  width={96}
                  height={96}
                  priority
                  className="h-full w-full scale-150 object-contain"
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
      </body>
    </html>
  );
}