import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "A portfolio site."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", GeistSans.variable)}>
      <body>
        <header className="border-b border-neutral-200">
          <nav aria-label="Main navigation" className="px-page-x py-page-y">
            <ul className="flex flex-wrap gap-6 text-nav">
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
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}