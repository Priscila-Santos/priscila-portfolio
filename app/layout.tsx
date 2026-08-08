import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
// TypeScript may complain about side-effect CSS imports when no ambient
// declaration is present. Suppress the error for this global stylesheet.
// @ts-ignore
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";

export const metadata: Metadata = {
  title: "Priscila Santos — Front-End AI Engineering",
  description: "Front-End AI Engineering intern building interactive, accessible web experiences and AI-powered applications with React, TypeScript, and the Vercel AI SDK."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", GeistSans.variable)}>
      <body>
        <header className="border-b border-neutral-200">
          <nav aria-label="Main navigation" className="px-page-x py-page-y">
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
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}