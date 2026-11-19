import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
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

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap';

/** Loads the HackArena accent fonts once (they're also preloaded in hackarena-2027.html). */
function useHAFonts() {
  useEffect(() => {
    if (document.querySelector('link[data-ha-fonts]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = FONT_HREF;
    l.dataset.haFonts = '1';
    document.head.appendChild(l);
  }, []);
}

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

export function Wordmark() {
  return (
    <span className="group flex items-center gap-2">
      <img src={igniteLogo} alt="" className="h-7 w-auto transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
      <span className="font-heading font-extrabold text-[18px] leading-none tracking-[-0.03em] text-foreground">HackArena</span>
    </span>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-primary via-[hsl(15_95%_55%)] to-primary" />;
}

function HANavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const goTo = useSectionNav();
  const navigate = useNavigate();
  const applyFirst = applyIsPrimary(getPhase());

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
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-4 pt-3">
      <nav
        aria-label="HackArena 2027"
        className={`mx-auto max-w-6xl flex h-14 items-center justify-between gap-3 rounded-full border pl-4 pr-2 transition-all duration-300 ${
          scrolled || open ? 'border-border bg-background/80 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl' : 'border-transparent bg-transparent'
        }`}
      >
        <Link to={HA_BASE} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="HackArena home">
          <Wordmark />
        </Link>

        <div className="hidden lg:flex items-center gap-0.5">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => goTo(n.id)}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {n.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button
            onClick={cta.onClick}
            className="ha-shine hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            {cta.label}
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="p-3 flex flex-col">
              {NAV.map((n, i) => (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                  onClick={() => { setOpen(false); goTo(n.id); }}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-left text-base font-bold text-foreground hover:bg-secondary"
                >
                  {n.label}
                  <span className="ha-mono text-xs text-muted-foreground">0{i + 1}</span>
                </motion.button>
              ))}
              <button
                onClick={() => { setOpen(false); cta.onClick(); }}
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground"
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

  const linkCls = 'text-foreground/75 hover:text-primary transition-colors';

  return (
    <footer className="relative overflow-hidden border-t border-border bg-secondary/40 dark:bg-card/40">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
            {HA.name} ({HA.edition}): a national hackathon by Ignite Room, India&apos;s student builder community.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:-translate-y-0.5 hover:rotate-6 hover:border-primary hover:text-primary"
              >
                {s.icon}
              </a>
            ))}
            <a
              href={`mailto:${HA.contactEmail}`}
              aria-label="Email"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:-translate-y-0.5 hover:rotate-6 hover:border-primary hover:text-primary"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="ha-mono text-[11px] lowercase tracking-[0.08em] text-muted-foreground mb-4">(hackarena 2027)</h3>
          <ul className="space-y-2.5 text-sm font-medium">
            {NAV.map((n) => (
              <li key={n.id}><button onClick={() => goTo(n.id)} className={linkCls}>{n.label}</button></li>
            ))}
            <li><Link to={`${HA_BASE}/apply`} className={linkCls}>Apply as a college</Link></li>
            <li>
              <Link to={`${HA_BASE}/rules`} className={`inline-flex items-center gap-1.5 ${linkCls}`}>
                <FileText className="h-3.5 w-3.5" /> Rule book
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="ha-mono text-[11px] lowercase tracking-[0.08em] text-muted-foreground mb-4">(ignite room)</h3>
          <ul className="space-y-2.5 text-sm font-medium">
            <li><a href={`mailto:${HA.contactEmail}`} className={`${linkCls} break-all`}>{HA.contactEmail}</a></li>
            <li><Link to="/" className={linkCls}>igniteroom.in</Link></li>
            <li><Link to="/hackarena2.0" reloadDocument className={linkCls}>HackArena 2.0</Link></li>
            <li><Link to="/privacy-policy" className={linkCls}>Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className={linkCls}>Terms of Service</Link></li>
            <li><Link to="/code-of-conduct" className={linkCls}>Code of Conduct</Link></li>
          </ul>
        </div>
      </div>

      {/* Giant wordmark */}
      <div aria-hidden className="relative select-none px-4 -mb-[3vw]">
        <div className="text-center font-heading font-extrabold leading-[0.8] tracking-[-0.06em] text-[19vw] text-transparent bg-clip-text bg-gradient-to-b from-foreground/[0.14] to-foreground/[0.02]">
          HackArena
        </div>
      </div>

      <div className="relative z-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row gap-2 justify-between ha-mono text-[11px] lowercase text-muted-foreground">
          <span>© {new Date().getFullYear()} ignite room · all rights reserved</span>
          <span>made with 🔥 and way too much chai</span>
        </div>
      </div>
    </footer>
  );
}

export default function HALayout({ children }: { children: ReactNode }) {
  useHAFonts();
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
    <div className="ha-grain min-h-screen bg-background text-foreground font-body overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-full">
        Skip to content
      </a>
      <ScrollProgress />
      <HANavbar />
      <main id="main">{children}</main>
      <HAFooter />
    </div>
  );
}
