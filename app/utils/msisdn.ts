// utils/msisdn.ts
export function normalizeKeMsisdn(input: string): string {
  const raw = (input || "").replace(/\s|-/g, "");
  if (!raw) return "";

  // Remove leading '+'
  const s = raw.startsWith("+") ? raw.slice(1) : raw;

  // 07XXXXXXXX -> 2547XXXXXXXX
  if (/^07\d{8}$/.test(s)) return "254" + s.slice(1);

  // 7XXXXXXXX -> 2547XXXXXXXX
  if (/^7\d{8}$/.test(s)) return "254" + s;

  // 2547XXXXXXXX (12 digits)
  if (/^2547\d{8}$/.test(s)) return s;

  // Occasionally users enter 011..., but STK requires party A be Safaricom line (07/01 ranges).
  // We still allow 01XXXXXXXX and convert to 2541XXXXXXXX, but you may restrict to 07/01 series.
  if (/^01\d{8}$/.test(s)) return "254" + s;

  // +2547XXXXXXXX would be caught by stripping '+' above
  return "";
}

export function isValidKeMsisdnE164254(s: string): boolean {
  return /^254(7|1)\d{8}$/.test(s);
}