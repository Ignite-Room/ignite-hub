import { ReactNode, RefObject, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { useRef } from 'react';
import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import { HA_BASE } from '../config';
import { Campus, CampusStatus, STATUS_META, formatDate } from '../api';

// ── Type ───────────────────────────────────────────────────────────────────

/** Elegant italic serif accent (Instrument Serif). */
export function Serif({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`ha-serif ${className}`}>{children}</span>;
}

/** Hand-drawn underline that draws itself when scrolled into view. */
export function Squiggle({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <span ref={ref} className={`relative inline-block whitespace-nowrap ${className}`}>
      {children}
      <svg aria-hidden viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute left-0 -bottom-[0.18em] h-[0.32em] w-full overflow-visible text-primary">
        <motion.path
          d="M2 9 C 30 2, 50 13, 80 7 S 130 1, 160 8 S 190 10, 198 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.25, ease: 'easeInOut' }}
        />
      </svg>
    </span>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────

export function Section({ id, children, className = '', band = false }: { id?: string; children: ReactNode; className?: string; band?: boolean }) {
  return (
    <section id={id} className={`relative scroll-mt-20 ${band ? 'bg-secondary/50 dark:bg-secondary/30 border-y border-border/60' : ''} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">{children}</div>
    </section>
  );
}

export function Eyebrow({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <span className="ha-mono inline-flex items-center gap-2 text-[11px] sm:text-xs lowercase tracking-[0.08em] text-muted-foreground mb-5">
      {n && <span className="text-primary font-bold">({n})</span>}
      <span className="h-px w-6 bg-border" />
      <span>{children}</span>
      <span aria-hidden className="text-primary">✦</span>
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
      <h2 className="font-heading text-[2.2rem] sm:text-5xl md:text-6xl font-extrabold leading-[1.02] tracking-[-0.035em] text-foreground">{title}</h2>
      {lead && <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">{lead}</p>}
      {children}
    </RevealOnScroll>
  );
}

// ── Buttons ────────────────────────────────────────────────────────────────

export function PrimaryButton({ children, onClick, href, to, className = '' }: { children: ReactNode; onClick?: () => void; href?: string; to?: string; className?: string }) {
  const cls = `ha-shine group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-12px_hsl(var(--primary)/0.9)] active:translate-y-0 ${className}`;
  const inner = (
    <>
      {children}
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:rotate-45">
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </>
  );
  if (to) return <Link to={to} onClick={onClick} className={cls}>{inner}</Link>;
  if (href) return <a href={href} onClick={onClick} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

export function GhostButton({ children, onClick, to, href, className = '' }: { children: ReactNode; onClick?: () => void; to?: string; href?: string; className?: string }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-card/60 backdrop-blur px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary ${className}`;
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
        className="absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--border)/0.7) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.7) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 25%, transparent 75%)',
        }}
      />
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 h-[560px] w-[900px] rounded-full bg-primary/[0.12] dark:bg-primary/25 blur-[140px]" />
      <div className="absolute top-40 -right-40 h-[380px] w-[380px] rounded-full bg-[hsl(28_100%_60%/0.14)] dark:bg-[hsl(20_100%_55%/0.12)] blur-[120px]" />
    </div>
  );
}

// ── Stickers & marquee ─────────────────────────────────────────────────────

const STICKER_TONES = {
  primary: 'bg-primary text-primary-foreground',
  butter: 'bg-[#FFE7A3] text-black',
  lilac: 'bg-[#DCCFFF] text-black',
  mint: 'bg-[#C6F1DA] text-black',
  sky: 'bg-[#C9E6FF] text-black',
  paper: 'bg-card text-foreground',
};
export type StickerTone = keyof typeof STICKER_TONES;

/** Draggable rotated sticker. Drop it anywhere inside `bounds`. */
export function Sticker({
  children,
  tone = 'paper',
  rotate = -6,
  delay = 0,
  className = '',
  bounds,
}: {
  children: ReactNode;
  tone?: StickerTone;
  rotate?: number;
  delay?: number;
  className?: string;
  bounds?: RefObject<HTMLElement>;
}) {
  return (
    <motion.div
      drag
      dragConstraints={bounds}
      dragElastic={0.25}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.4, rotate: rotate - 20 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      whileHover={{ scale: 1.08, rotate: rotate + 5 }}
      whileDrag={{ scale: 1.12, rotate: 0, zIndex: 30, cursor: 'grabbing' }}
      transition={{ type: 'spring', stiffness: 260, damping: 15, delay }}
      className={`ha-sticker absolute z-10 cursor-grab touch-none select-none whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-extrabold ${STICKER_TONES[tone]} ${className}`}
    >
      {children}
    </motion.div>
  );
}

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

// ── Status badge ───────────────────────────────────────────────────────────

const TONE: Record<string, string> = {
  muted: 'bg-muted/70 text-muted-foreground border-border',
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
    <span className={`ha-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-bold lowercase tracking-wide ${TONE[meta.tone]}`}>
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

/** A single digit that rolls when it changes. */
function RollDigit({ value }: { value: string }) {
  return (
    <span className="relative inline-flex h-[1em] w-[0.62em] justify-center overflow-hidden leading-none">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Countdown({ target, label }: { target: Date; label: string }) {
  const now = useNow();
  const p = parts(target.getTime() - now.getTime());
  const cells: [number, string][] = [
    [p.d, 'days'],
    [p.h, 'hrs'],
    [p.m, 'min'],
    [p.s, 'sec'],
  ];
  return (
    <div>
      <div className="ha-mono text-[11px] lowercase tracking-[0.08em] text-muted-foreground mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        {label}
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-live="off" aria-label={`${p.d} days ${p.h} hours ${p.m} minutes`}>
        {cells.map(([v, l]) => {
          const str = String(v).padStart(2, '0');
          return (
            <div key={l} className="rounded-2xl border border-border bg-background/70 px-1 py-3 text-center">
              <div className="font-heading text-[1.9rem] sm:text-[2.6rem] font-extrabold tabular-nums text-foreground flex justify-center">
                {str.split('').map((ch, i) => <RollDigit key={i} value={ch} />)}
              </div>
              <div className="ha-mono mt-1.5 text-[10px] lowercase tracking-[0.1em] text-muted-foreground">{l}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Logos ──────────────────────────────────────────────────────────────────

/** College logo with an initials fallback when there's no image (or it fails to load). */
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
      <span className={`${dim} shrink-0 rounded-2xl border border-border bg-white p-1.5 flex items-center justify-center overflow-hidden`}>
        <img src={src} alt={`${name} logo`} loading="lazy" className="max-h-full max-w-full object-contain" onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span className={`${dim} shrink-0 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 flex items-center justify-center font-heading font-extrabold text-primary`}>
      {initials || '?'}
    </span>
  );
}

/**
 * Sponsor logos arrive in every colour. Transparent PNG/SVG/WebP logos are shown
 * as a uniform mark (black on light, white on dark). JPEGs and Drive thumbnails
 * carry their own background, so they sit on a white plate instead.
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

export function CampusCard({ campus, index = 0 }: { campus: Campus; index?: number }) {
  const showRegion = campus.region && !campus.region.toLowerCase().includes(campus.city.toLowerCase());
  const location = [campus.city, showRegion ? campus.region : null].filter(Boolean).join(' · ');
  const highlight = campus.status === 'round-today' || campus.status === 'registrations-open';
  const tilt = index % 2 === 0 ? -1 : 1;
  return (
    <motion.div whileHover={{ y: -6, rotate: tilt * 0.8 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
      <Link
        to={`${HA_BASE}/campus/${campus.slug}`}
        className={`group relative flex h-full flex-col rounded-3xl border bg-card p-5 transition-shadow hover:shadow-[0_24px_60px_-28px_hsl(var(--primary)/0.55)] ${
          highlight ? 'border-primary/40' : 'border-border'
        }`}
      >
        {campus.status === 'round-today' && (
          <span aria-hidden className="absolute inset-0 rounded-3xl shadow-[0_0_44px_-10px_hsl(var(--primary)/0.8)] pointer-events-none" />
        )}
        <div className="flex items-start justify-between gap-3">
          <LogoTile src={campus.logoUrl} name={campus.college} />
          <StatusBadge status={campus.status} />
        </div>
        <h3 className="mt-4 font-heading text-lg font-extrabold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
          {campus.college}
        </h3>
        <div className="mt-3 mb-5 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-primary/80" />{formatDate(campus.roundDate)}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary/80" /><span className="truncate">{location || 'Location TBA'}</span></div>
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-dashed border-border">
          <span className="ha-mono text-[11px] lowercase text-muted-foreground">teams of 2–5 · this college only</span>
          {campus.sponsorLogoUrl ? (
            <SponsorLogo src={campus.sponsorLogoUrl} alt={campus.sponsorName || 'College sponsor'} className="h-5 w-auto max-w-[72px]" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-primary group-hover:rotate-45" />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
