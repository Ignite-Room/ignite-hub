import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, FileText, Instagram, Linkedin, Mail, Menu, X } from 'lucide-react';
import { track } from '@vercel/analytics';
import igniteLogo from '@/assets/ignite-logo.png';
import ThemeToggle from '@/components/ThemeToggle';
import { HA, HA_BASE, applyIsPrimary, getPhase } from '../config';
import '../hackarena.css';

const NAV = [
  { label: 'Campuses', id: 'campuses' },
  { label: 'How it works', id: 'how-it-works' },
  { label: 'Finale', id: 'finale' },
  { label: 'Sponsors', id: 'sponsors' },
  { label: 'FAQ', id: 'faq' },
];

/** Scroll to `#id` on this page, or navigate to the landing page and then scroll. */
export function useSectionNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (id: string) => {
    const onHome = pathname.replace(/\/$/, '') === HA_BASE;
    if (onHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `${HA_BASE}#${id}`);
    } else {
      navigate(`${HA_BASE}#${id}`);
    }
  };
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src={igniteLogo} alt="" className={compact ? 'h-7 w-auto' : 'h-8 w-auto'} />
      <span className="font-heading font-extrabold text-[17px] leading-none tracking-tight text-foreground">HackArena</span>
    </span>
  );
}

function HANavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const goTo = useSectionNav();
  const navigate = useNavigate();
  const phase = getPhase();
  const applyFirst = applyIsPrimary(phase);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cta = applyFirst
    ? { label: 'Apply as a college', onClick: () => { track('ha_apply_click', { where: 'nav' }); navigate(`${HA_BASE}/apply`); } }
    : { label: 'Find your campus', onClick: () => goTo('campuses') };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'bg-background/85 backdrop-blur-xl border-b border-border/70' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4" aria-label="HackArena 2027">
        <Link to={HA_BASE} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="HackArena 2027 home">
          <Wordmark />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => goTo(n.id)}
              className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full"
            >
              {n.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={cta.onClick}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_30px_-6px_hsl(var(--primary)/0.7)]"
          >
            {cta.label}
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-border/70"
          >
            <div className="px-4 py-4 flex flex-col">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { setOpen(false); goTo(n.id); }}
                  className="text-left py-3 text-base font-medium text-foreground border-b border-border/50"
                >
                  {n.label}
                </button>
              ))}
              <button
                onClick={() => { setOpen(false); cta.onClick(); }}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                {cta.label}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HAFooter() {
  const goTo = useSectionNav();
  const socials = [
    { name: 'Instagram', href: HA.socials.instagram, icon: <Instagram className="h-4 w-4" /> },
    { name: 'LinkedIn', href: HA.socials.linkedin, icon: <Linkedin className="h-4 w-4" /> },
    {
      name: 'X',
      href: HA.socials.x,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ].filter((s) => s.href);

  return (
    <footer className="relative overflow-hidden border-t border-border/70 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
            {HA.name} ({HA.edition}) is a national hackathon by Ignite Room, India&apos;s student builder community.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/60 transition-colors"
              >
                {s.icon}
              </a>
            ))}
            <a
              href={`mailto:${HA.contactEmail}`}
              aria-label="Email"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/60 transition-colors"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-body font-bold mb-4">HackArena 2027</h3>
          <ul className="space-y-2.5 text-sm">
            {NAV.map((n) => (
              <li key={n.id}>
                <button onClick={() => goTo(n.id)} className="text-foreground/80 hover:text-primary transition-colors">{n.label}</button>
              </li>
            ))}
            <li><Link to={`${HA_BASE}/apply`} className="text-foreground/80 hover:text-primary transition-colors">Apply as a college</Link></li>
            <li>
              <Link to={`${HA_BASE}/rules`} className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors">
                <FileText className="h-3.5 w-3.5" /> Rule book
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-body font-bold mb-4">Ignite Room</h3>
          <ul className="space-y-2.5 text-sm">
            <li><a href={`mailto:${HA.contactEmail}`} className="text-foreground/80 hover:text-primary transition-colors break-all">{HA.contactEmail}</a></li>
            <li><Link to="/" className="text-foreground/80 hover:text-primary transition-colors">igniteroom.in</Link></li>
            <li><Link to="/hackarena2.0" reloadDocument className="text-foreground/80 hover:text-primary transition-colors">HackArena 2.0</Link></li>
            <li><Link to="/privacy-policy" className="text-foreground/80 hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="text-foreground/80 hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="/code-of-conduct" className="text-foreground/80 hover:text-primary transition-colors">Code of Conduct</Link></li>
          </ul>
        </div>
      </div>
      {/* Giant wordmark */}
      <div aria-hidden className="relative select-none px-4 -mb-[3vw]">
        <div className="text-center font-heading font-extrabold leading-[0.8] tracking-[-0.06em] text-[19vw] text-transparent bg-clip-text bg-gradient-to-b from-foreground/[0.14] to-foreground/[0.02]">
          HackArena
        </div>
      </div>
      <div className="relative border-t border-border/60 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Ignite Room. All rights reserved.</span>
          <span>{HA.name} · {HA.edition}</span>
        </div>
      </div>
    </footer>
  );
}

export default function HALayout({ children }: { children: ReactNode }) {
  const { hash, pathname } = useLocation();

  // Deep links like /hackarena-2027#faq: scroll once the section has mounted.
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (tries++ < 20) setTimeout(tick, 100);
    };
    const t = setTimeout(tick, 60);
    return () => clearTimeout(t);
  }, [hash, pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary/30 overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-full">
        Skip to content
      </a>
      <HANavbar />
      <main id="main">{children}</main>
      <HAFooter />
    </div>
  );
}
