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
          <nav aria-label="Main navigation" className="flex items-center justify-between px-page-x py-page-y">
            <ul className="hidden flex-wrap gap-6 text-nav sm:flex">
              <li>
                <Link className="text-primary hover:text-accent" href="/">Home</Link>
              </li>
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
                {/* FE-AA2: 3D model viewer, kept as its own route so its heavy
                    Three.js bundle never loads on any other page. */}
                <Link className="text-primary hover:text-accent" href="/lab/3d">3D Lab</Link>
              </li>
            </ul>
            <MobileNav />
            <ThemeToggle />
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}