import { useQuery } from '@tanstack/react-query';
import { HA_API_URL, todayIST } from './config';

// ── Types (mirror the rows the Apps Script returns) ─────────────────────────

export type CampusStatus =
  | 'coming-soon'
  | 'registrations-open'
  | 'registrations-closed'
  | 'round-today'
  | 'shortlist-announced'
  | 'prototype-round'
  | 'completed';

export interface Campus {
  slug: string;
  college: string;
  logoUrl?: string;
  city: string;
  region?: string;
  state?: string;
  /** YYYY-MM-DD */
  roundDate?: string;
  venue?: string;
  status: CampusStatus;
  nymbleUrl?: string;
  shortlist?: string[];
  /** YYYY-MM-DD */
  prototypeDue?: string;
  sponsorName?: string;
  sponsorLogoUrl?: string;
}

export type SponsorTier = 'title' | 'track' | 'partner' | 'past';

export interface Sponsor {
  name: string;
  tier: SponsorTier;
  logoUrl?: string;
  website?: string;
  trackName?: string;
}

export interface Finalist {
  team: string;
  college: string;
  city?: string;
}

export interface HAData {
  campuses: Campus[];
  sponsors: Sponsor[];
  finalists: Finalist[];
  stats: { approvedColleges: number; liveRounds: number };
  updatedAt?: string;
}

const EMPTY: HAData = {
  campuses: [],
  sponsors: [],
  finalists: [],
  stats: { approvedColleges: 0, liveRounds: 0 },
};

export const isConnected = () => Boolean(HA_API_URL);

async function fetchData(): Promise<HAData> {
  if (!HA_API_URL) return EMPTY;
  const res = await fetch(`${HA_API_URL}?action=data`, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.ok === false) throw new Error(json?.error || 'Bad response');
  return {
    campuses: Array.isArray(json.campuses) ? json.campuses : [],
    sponsors: Array.isArray(json.sponsors) ? json.sponsors : [],
    finalists: Array.isArray(json.finalists) ? json.finalists : [],
    stats: json.stats ?? EMPTY.stats,
    updatedAt: json.updatedAt,
  };
}

/** Live campus cards, sponsors and finalists from the team's Google Sheet. */
export function useHAData() {
  return useQuery({
    queryKey: ['hackarena-2027-data'],
    queryFn: fetchData,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// ── Form submission ────────────────────────────────────────────────────────

export interface SubmitResult {
  ok: boolean;
  ref?: string;
  error?: string;
}

/**
 * Posts to the Apps Script web app. The body is sent as text/plain so the
 * browser treats it as a simple request (no CORS preflight, which Apps Script
 * can't answer).
 */
export async function submitForm(action: 'apply' | 'partner', payload: Record<string, unknown>, opts: { preview?: boolean; honeypot?: string } = {}): Promise<SubmitResult> {
  if (!HA_API_URL) {
    return { ok: false, error: 'not-connected' };
  }
  try {
    const res = await fetch(HA_API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload, preview: Boolean(opts.preview), hp: opts.honeypot || '' }),
    });
    const json = await res.json();
    return json as SubmitResult;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

// ── Status helpers ─────────────────────────────────────────────────────────

export const STATUS_META: Record<CampusStatus, { label: string; tone: 'muted' | 'live' | 'closed' | 'hot' | 'done' | 'info' }> = {
  'coming-soon': { label: 'Coming soon', tone: 'muted' },
  'registrations-open': { label: 'Registrations open', tone: 'live' },
  'registrations-closed': { label: 'Registrations closed', tone: 'closed' },
  'round-today': { label: 'Round today', tone: 'hot' },
  'shortlist-announced': { label: 'Shortlist announced', tone: 'info' },
  'prototype-round': { label: 'Prototype round', tone: 'info' },
  completed: { label: 'Completed', tone: 'done' },
};

export const STATUS_ORDER: CampusStatus[] = [
  'round-today',
  'registrations-open',
  'registrations-closed',
  'coming-soon',
  'shortlist-announced',
  'prototype-round',
  'completed',
];

function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * The status shown on the card. Admins set the base status in the sheet; on the
 * round date a pre-round card is highlighted as "Round today" automatically, and
 * the prototype due date defaults to 5 days after the round.
 */
export function effectiveCampus(c: Campus, today = todayIST()): Campus {
  let status = c.status;
  const preRound: CampusStatus[] = ['coming-soon', 'registrations-open', 'registrations-closed'];
  if (c.roundDate === today && preRound.includes(status)) status = 'round-today';
  const prototypeDue = c.prototypeDue || (c.roundDate ? addDays(c.roundDate, 5) : undefined);
  return { ...c, status, prototypeDue };
}

/** Upcoming rounds first (soonest first), then undated, then past rounds (latest first). */
export function sortCampuses(list: Campus[], today = todayIST()): Campus[] {
  const rank = (c: Campus) => (!c.roundDate ? 1 : c.roundDate >= today ? 0 : 2);
  return [...list].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    if (ra === 0) return a.roundDate!.localeCompare(b.roundDate!);
    if (ra === 2) return b.roundDate!.localeCompare(a.roundDate!);
    return a.college.localeCompare(b.college);
  });
}

export function formatDate(ymd?: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  if (!ymd) return 'Date TBA';
  const d = new Date(`${ymd}T00:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-IN', { ...opts, timeZone: 'Asia/Kolkata' });
}
