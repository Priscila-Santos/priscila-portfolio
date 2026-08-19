/**
 * Shared input caps for the portfolio chat. Single source of truth so the
 * client-side textarea validation (chat-interface.tsx) and the
 * server-side rejection (app/api/portfolio-agent/route.ts) can never
 * drift out of sync with each other.
 */
export const MAX_MESSAGES = 40;
export const MAX_MESSAGE_CHARS = 4000;