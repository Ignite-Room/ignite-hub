// ─────────────────────────────────────────────────────────────────────────────
// HackArena – 2027 Edition: single source of truth for dates, links and flags.
// Anything the team may need to change before launch lives here.
// ─────────────────────────────────────────────────────────────────────────────

export const HA_BASE = '/hackarena-2027';

/**
 * URL of the deployed Google Apps Script web app (see integrations/hackarena-2027/SETUP.md).
 * It serves campus cards / sponsors / finalists and receives the application and
 * partner forms. Set VITE_HACKARENA_API_URL in Vercel, or paste the URL here.
 */
export const HA_API_URL: string =
  (import.meta.env.VITE_HACKARENA_API_URL as string | undefined) ||
  '';

/** All dates are IST. */
export const HA_DATES = {
  applicationsOpen: new Date('2026-11-25T00:00:00+05:30'),
  applicationsClose: new Date('2027-01-05T23:59:59+05:30'),
  roundsStart: new Date('2027-02-10T00:00:00+05:30'),
  roundsEnd: new Date('2027-04-25T23:59:59+05:30'),
  finaleStart: new Date('2027-06-19T00:00:00+05:30'),
  finaleEnd: new Date('2027-06-20T23:59:59+05:30'),
};

/** Date-picker bounds for a college's campus round (YYYY-MM-DD). */
export const HA_ROUND_DATE_MIN = '2027-02-10';
export const HA_ROUND_DATE_MAX = '2027-04-25';

export const HA = {
  name: 'HackArena – 2027 Edition',
  shortName: 'HackArena 2027',
  edition: 'Campus Edition',
  prizePool: '₹1.5 Lakh',
  finaleCity: 'Bangalore',
  finaleHours: 36,
  campusTarget: 50,
  // TODO(confirm): brief marks this as "to confirm, this was the 2.0 contact".
  contactEmail: 'admin@igniteroom.in',
  /** Public path of the Campus Round Rule Book PDF. Empty = hide the download button. */
  rulebookPdfUrl: '/ha2027/HackArena-2027-Campus-Round-Rule-Book.pdf',
  socials: {
    instagram: 'https://www.instagram.com/igniteroom.india/',
    linkedin: 'https://www.linkedin.com/company/ignite-room/',
    // TODO(confirm): index.html references @igniteroom; add the URL once confirmed.
    x: '',
  },
  ambassadorUrl: '/ambassador',
};

export type HAPhase = 'pre' | 'open' | 'closed' | 'rounds' | 'finale' | 'done';

/**
 * Where the programme is right now. `?preview=1` on any HackArena URL forces the
 * application form open so the team can test the pipeline before 25 Nov.
 */
export function getPhase(now: Date = new Date()): HAPhase {
  const t = now.getTime();
  if (t < HA_DATES.applicationsOpen.getTime()) return 'pre';
  if (t <= HA_DATES.applicationsClose.getTime()) return 'open';
  if (t < HA_DATES.roundsStart.getTime()) return 'closed';
  if (t < HA_DATES.finaleStart.getTime()) return 'rounds';
  if (t <= HA_DATES.finaleEnd.getTime()) return 'finale';
  return 'done';
}

export function isPreviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('preview') === '1';
}

/** True while the "Apply as a college" call to action should lead the page. */
export function applyIsPrimary(phase: HAPhase): boolean {
  return phase === 'pre' || phase === 'open';
}

export interface Milestone {
  label: string;
  target: Date;
}

/** The milestone the hero countdown is counting towards. */
export function currentMilestone(phase: HAPhase): Milestone | null {
  switch (phase) {
    case 'pre':
      return { label: 'Applications open in', target: HA_DATES.applicationsOpen };
    case 'open':
      return { label: 'Applications close in', target: HA_DATES.applicationsClose };
    case 'closed':
      return { label: 'First campus round in', target: HA_DATES.roundsStart };
    case 'rounds':
      return { label: 'Grand Finale in', target: HA_DATES.finaleStart };
    default:
      return null;
  }
}

/** Today's date in IST as YYYY-MM-DD, for comparing against sheet dates. */
export function todayIST(now: Date = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}
