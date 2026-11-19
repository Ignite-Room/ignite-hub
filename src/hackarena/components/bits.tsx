import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import { HA_BASE } from '../config';
import { Campus, CampusStatus, STATUS_META, formatDate } from '../api';

// ── Layout ─────────────────────────────────────────────────────────────────

export function Section({
  id,
  children,
  className = '',
  band = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Slightly lifted background band, used to alternate sections. */
  band?: boolean;
}) {
  return (
    <section id={id} className={`relative scroll-mt-20 ${band ? 'bg-secondary/40 border-y border-border/60' : ''} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">{children}</div>
    </section>
  );
}

export function Eyebrow({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-4">
      {n && <span className="text-muted-foreground">{n}</span>}
      {n && <span className="h-px w-6 bg-primary/60" />}
      {children}
    </span>
  );
}

export function SectionHeading({
  n,
  eyebrow,
  title,
  lead,
  align = 'left',
  children,
}: {
  n?: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  children?: ReactNode;
}) {
  return (
    <RevealOnScroll className={`mb-12 md:mb-16 ${align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl'}`}>
      <Eyebrow n={n}>{eyebrow}</Eyebrow>
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] text-foreground">{title}</h2>
      {lead && <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">{lead}</p>}
      {children}
    </RevealOnScroll>
  );
}

export function PrimaryButton({ children, onClick, href, to, className = '' }: { children: ReactNode; onClick?: () => void; href?: string; to?: string; className?: string }) {
  const cls = `group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_40px_-8px_hsl(var(--primary)/0.8)] ${className}`;
  const inner = (
    <>
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </>
  );
  if (to) return <Link to={to} onClick={onClick} className={cls}>{inner}</Link>;
  if (href) return <a href={href} onClick={onClick} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

export function GhostButton({ children, onClick, to, href, className = '' }: { children: ReactNode; onClick?: () => void; to?: string; href?: string; className?: string }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur px-6 py-3.5 text-sm font-semibold text-foreground hover:border-primary/60 hover:text-primary transition-colors ${className}`;
  if (to) return <Link to={to} onClick={onClick} className={cls}>{children}</Link>;
  if (href) return <a href={href} onClick={onClick} className={cls}>{children}</a>;
  return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

// ── Background ─────────────────────────────────────────────────────────────

/** Faint grid + crimson glow used behind heroes. */
export function GridGlow({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--border)/0.55) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.55) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)',
        }}
      />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[900px] rounded-full bg-primary/[0.12] dark:bg-primary/25 blur-[140px]" />
      <div className="absolute top-40 -right-40 h-[360px] w-[360px] rounded-full bg-[hsl(20_100%_55%/0.12)] blur-[120px]" />
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────

const TONE: Record<string, string> = {
  muted: 'bg-muted/60 text-muted-foreground border-border',
  live: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/35',
  closed: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border-zinc-500/30',
  hot: 'bg-primary/15 text-primary border-primary/50',
  info: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/35',
  done: 'bg-transparent text-muted-foreground border-border',
};

export function StatusBadge({ status }: { status: CampusStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META['coming-soon'];
  const pulse = meta.tone === 'live' || meta.tone === 'hot';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TONE[meta.tone]}`}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {meta.label}
    </span>
  );
}

// ── Countdown ──────────────────────────────────────────────────────────────

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function Countdown({ target, label }: { target: Date; label: string }) {
  const now = useNow();
  const p = parts(target.getTime() - now.getTime());
  const cells: [number, string][] = [
    [p.d, 'Days'],
    [p.h, 'Hours'],
    [p.m, 'Min'],
    [p.s, 'Sec'],
  ];
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">{label}</div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-live="off">
        {cells.map(([v, l]) => (
          <div key={l} className="rounded-xl border border-border/80 bg-card/70 backdrop-blur px-2 py-3 text-center">
            <div className="font-heading text-2xl sm:text-4xl font-extrabold tabular-nums text-foreground">{String(v).padStart(2, '0')}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Logos ──────────────────────────────────────────────────────────────────

/** College / sponsor logo with an initials fallback when there's no image (or it fails to load). */
export function LogoTile({ src, name, size = 'md' }: { src?: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const [failed, setFailed] = useState(false);
  const dim = size === 'lg' ? 'h-20 w-20 text-xl' : size === 'sm' ? 'h-9 w-9 text-xs' : 'h-12 w-12 text-sm';
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !['of', 'and', 'the', 'for'].includes(w.toLowerCase()))
    .slice(0, 3)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  if (src && !failed) {
    return (
      <span className={`${dim} shrink-0 rounded-xl bg-white p-1.5 flex items-center justify-center overflow-hidden`}>
        <img src={src} alt={`${name} logo`} loading="lazy" className="max-h-full max-w-full object-contain" onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span className={`${dim} shrink-0 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center font-heading font-extrabold text-primary`}>
      {initials || '?'}
    </span>
  );
}

/**
 * Sponsor logos arrive in every colour (white-on-transparent, black, full colour).
 * Transparent PNG/SVG/WebP logos are shown as a uniform white mark, which reads
 * cleanly on the dark theme. JPEGs and Drive thumbnails carry their own
 * background, so they sit on a white plate instead.
 */
export function isMonoLogo(src: string) {
  return !/\.jpe?g(\?|$)/i.test(src) && !/drive\.google\.com/i.test(src);
}

export function SponsorLogo({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const mono = isMonoLogo(src);
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`object-contain ${mono ? 'brightness-0 dark:invert opacity-80' : 'rounded-md bg-white p-1'} ${className}`}
    />
  );
}

// ── Campus card ────────────────────────────────────────────────────────────

export function CampusCard({ campus }: { campus: Campus }) {
  const showRegion = campus.region && !campus.region.toLowerCase().includes(campus.city.toLowerCase());
  const location = [campus.city, showRegion ? campus.region : null].filter(Boolean).join(' · ');
  const highlight = campus.status === 'round-today' || campus.status === 'registrations-open';
  return (
    <Link
      to={`${HA_BASE}/campus/${campus.slug}`}
      className={`group relative flex flex-col rounded-2xl border bg-card/60 p-5 transition-all hover:-translate-y-0.5 hover:bg-card ${
        highlight ? 'border-primary/40 hover:border-primary/70' : 'border-border/80 hover:border-primary/40'
      }`}
    >
      {campus.status === 'round-today' && (
        <span aria-hidden className="absolute inset-0 rounded-2xl shadow-[0_0_40px_-10px_hsl(var(--primary)/0.8)] pointer-events-none" />
      )}
      <div className="flex items-start justify-between gap-3">
        <LogoTile src={campus.logoUrl} name={campus.college} />
        <StatusBadge status={campus.status} />
      </div>
      <h3 className="mt-4 font-heading text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
        {campus.college}
      </h3>
      <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-primary/80" />{formatDate(campus.roundDate)}</div>
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary/80" /><span className="truncate">{location || 'Location TBA'}</span></div>
      </div>
      <div className="mt-auto pt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Teams of 2–5 · this college only</span>
        {campus.sponsorLogoUrl && <SponsorLogo src={campus.sponsorLogoUrl} alt={campus.sponsorName || 'College sponsor'} className="h-5 w-auto max-w-[72px]" />}
      </div>
    </Link>
  );
}

// ── Marquee ────────────────────────────────────────────────────────────────

export function Marquee({ items, reverse = false, className = '', itemClassName = '' }: { items: string[]; reverse?: boolean; className?: string; itemClassName?: string }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <div className={`flex w-max ${reverse ? 'ha-marquee-rev' : 'ha-marquee'}`}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((t, i) => (
              <span key={`${k}-${i}`} className={`flex items-center gap-6 px-3 ${itemClassName}`}>
                {t}
                <span className="opacity-70">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
