import Image from "next/image";

/**
 * TODO (Week 7 — Plant My Flag): replace both placeholders once FlyRank
 * issues the real graduate badge asset and verification link.
 *
 * - FLYRANK_BADGE_SRC: path to the official badge image. Drop the real
 *   file at /public/assets/flyrank-badge.png (same size/aspect as this
 *   placeholder expects: roughly square, ~28x28 at render size) once you
 *   receive it from FlyRank.
 * - FLYRANK_VERIFICATION_URL: the public credential/verification page
 *   FlyRank gives you after graduation (usually something like
 *   https://flyrank.ai/verify/<credential-id> or a Credly-style link).
 *
 * Until both are real, this renders honestly as a placeholder — do not
 * ship this to production without swapping them, since a badge that
 * doesn't verify anything undermines the whole point of the assignment.
 */
const FLYRANK_BADGE_SRC = "/assets/flyrank-badge.png";
const FLYRANK_VERIFICATION_URL = "https://flyrank.ai/verify/REPLACE_ME";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-page-x py-8 text-sm text-muted-foreground sm:flex-row sm:justify-center">
        <p>
          © {new Date().getFullYear()} All rights reserved • Developed by Priscila Santos
        </p>

        <a
          href={FLYRANK_VERIFICATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="FlyRank AI Engineering graduate — verify credential (opens in a new tab)"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src={FLYRANK_BADGE_SRC}
            alt="FlyRank AI Engineering graduate badge"
            width={28}
            height={28}
            className="rounded"
          />
          <span className="font-medium text-foreground">FlyRank Graduate</span>
          <span className="sr-only"> (opens verification page in a new tab)</span>
        </a>
      </div>
    </footer>
  );
}