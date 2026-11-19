import { FormEvent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Handshake, Loader2 } from 'lucide-react';
import { track } from '@vercel/analytics';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import { HA } from '../config';
import { FAQ_COLLEGES, FAQ_STUDENTS } from '../content';
import { Sponsor, submitForm } from '../api';
import { PrimaryButton, Section, SectionHeading, SponsorLogo } from '../components/bits';
import { EMAIL_RE, Honeypot, MultiChoice, PHONE_RE, TextArea, TextField, normPhone } from '../components/fields';

// ── Sponsors ───────────────────────────────────────────────────────────────

function LogoGrid({ items, big = false }: { items: Sponsor[]; big?: boolean }) {
  return (
    <div className={`grid gap-3 ${big ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
      {items.map((s) => {
        const inner = s.logoUrl ? (
          <SponsorLogo src={s.logoUrl} alt={s.name} className={`${big ? 'max-h-16' : 'max-h-11'} w-auto max-w-[78%]`} />
        ) : (
          <span className="font-heading font-bold text-foreground">{s.name}</span>
        );
        const cls = `flex items-center justify-center rounded-2xl border border-border/80 bg-card/60 ${big ? 'h-32' : 'h-24'} px-4 transition-all hover:-translate-y-0.5 hover:border-primary/40`;
        return s.website ? (
          <a key={s.name} href={s.website} target="_blank" rel="noopener noreferrer" className={cls} title={s.name}>{inner}</a>
        ) : (
          <div key={s.name} className={cls} title={s.name}>{inner}</div>
        );
      })}
    </div>
  );
}

const INTERESTS = ['Title sponsor', 'Track sponsor', 'Grand Finale', 'Campus rounds', 'Hiring'];

function PartnerForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ company: '', name: '', email: '', phone: '', message: '' });
  const [interest, setInterest] = useState<string[]>([]);
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.company.trim()) er.company = 'Required';
    if (!f.name.trim()) er.name = 'Required';
    if (!EMAIL_RE.test(f.email.trim())) er.email = 'Enter a valid email';
    if (f.phone && !PHONE_RE.test(normPhone(f.phone))) er.phone = 'Enter a valid 10-digit mobile number';
    if (interest.length === 0) er.interest = 'Pick at least one';
    setErrors(er);
    if (Object.keys(er).length) return;
    setState('sending');
    const res = await submitForm('partner', { ...f, phone: normPhone(f.phone), interest }, { honeypot: hp });
    if (res.ok) {
      track('ha_partner_submit');
      setState('done');
    } else {
      setState('error');
      setErrMsg(res.error === 'not-connected' ? 'not-connected' : res.error || 'Something went wrong');
    }
  };

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-primary/40 bg-primary/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 font-heading text-2xl font-bold">Thanks, we&apos;ll be in touch.</h3>
        <p className="mt-2 text-muted-foreground">The Ignite Room partnerships team will reply to {f.email} shortly.</p>
        <button onClick={onDone} className="mt-6 text-sm text-primary hover:underline">Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 grid gap-5 md:grid-cols-2">
      <Honeypot value={hp} onChange={setHp} />
      <TextField label="Company name" required value={f.company} onChange={set('company')} error={errors.company} autoComplete="organization" maxLength={120} />
      <TextField label="Contact name" required value={f.name} onChange={set('name')} error={errors.name} autoComplete="name" maxLength={100} />
      <TextField label="Email" type="email" required value={f.email} onChange={set('email')} error={errors.email} autoComplete="email" maxLength={150} />
      <TextField label="Phone" type="tel" value={f.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" inputMode="tel" maxLength={16} />
      <div className="md:col-span-2">
        <MultiChoice label="Interested in" required options={INTERESTS} value={interest} onChange={setInterest} error={errors.interest} />
      </div>
      <TextArea className="md:col-span-2" label="Message" value={f.message} onChange={set('message')} maxLength={2000} placeholder="Tell us what you have in mind" />
      {state === 'error' && (
        <p className="md:col-span-2 text-sm text-destructive">
          {errMsg === 'not-connected' ? (
            <>Online requests aren&apos;t connected yet. Please email <a className="underline" href={`mailto:${HA.contactEmail}?subject=HackArena 2027 partnership`}>{HA.contactEmail}</a>.</>
          ) : (
            <>Couldn&apos;t send ({errMsg}). Try again, or email <a className="underline" href={`mailto:${HA.contactEmail}`}>{HA.contactEmail}</a>.</>
          )}
        </p>
      )}
      <div className="md:col-span-2 flex items-center gap-4">
        <button type="submit" disabled={state === 'sending'} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
          {state === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
          Send request
        </button>
        <button type="button" onClick={onDone} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
    </form>
  );
}

export function Sponsors({ sponsors }: { sponsors: Sponsor[] }) {
  const [open, setOpen] = useState(false);
  const title = sponsors.filter((s) => s.tier === 'title');
  const tracks = sponsors.filter((s) => s.tier === 'track');
  const partners = sponsors.filter((s) => s.tier === 'partner');
  const past = sponsors.filter((s) => s.tier === 'past');
  const anyCurrent = title.length + tracks.length + partners.length > 0;

  const cta = (
    <RevealOnScroll className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-primary/15 via-card/60 to-card/60 p-8 md:p-10">
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] items-center">
        <div>
          <Handshake className="h-8 w-8 text-primary" />
          <h3 className="mt-5 font-heading text-2xl md:text-3xl font-extrabold">Partner with HackArena 2027</h3>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">
            Put your brand in front of student builders across {HA.campusTarget} campuses in India, three stages and a {HA.finaleHours}-hour Grand Finale in {HA.finaleCity}.
            Title, track, finale and campus-round partnerships are open.
          </p>
        </div>
        <div className="md:text-right">
          {!open && <PrimaryButton onClick={() => { setOpen(true); track('ha_partner_open'); }}>Partner with us</PrimaryButton>}
        </div>
      </div>
    </RevealOnScroll>
  );

  return (
    <Section id="sponsors">
      <SectionHeading n="07" eyebrow="Sponsors & partners" title={anyCurrent ? 'Backed by.' : <>Build this with <span className="text-gradient">us.</span></>} />

      {anyCurrent && (
        <div className="space-y-12 mb-14">
          {title.length > 0 && (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Presented by</div>
              <LogoGrid items={title} big />
            </div>
          )}
          {tracks.length > 0 && (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Track sponsors</div>
              <LogoGrid items={tracks} />
            </div>
          )}
          {partners.length > 0 && (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Powered by</div>
              <LogoGrid items={partners} />
            </div>
          )}
        </div>
      )}

      {cta}

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="mt-5">
            <PartnerForm onDone={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {past.length > 0 && (
        <div className="mt-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">HackArena 2.0 partners</div>
          <LogoGrid items={past} />
        </div>
      )}
    </Section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────

export function Faq() {
  const [tab, setTab] = useState<'students' | 'colleges'>('students');
  const items = tab === 'students' ? FAQ_STUDENTS : FAQ_COLLEGES(HA.contactEmail);
  return (
    <Section id="faq" band>
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <SectionHeading n="08" eyebrow="FAQ" title="Questions, answered." lead={<>Still stuck? Write to <a href={`mailto:${HA.contactEmail}`} className="text-primary hover:underline">{HA.contactEmail}</a>.</>} />
        </div>
        <div>
          <div role="tablist" aria-label="FAQ audience" className="inline-flex rounded-full border border-border bg-background/60 p-1 mb-6">
            {(['students', 'colleges'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                For {t}
              </button>
            ))}
          </div>
          <Accordion type="single" collapsible key={tab} className="rounded-2xl border border-border/80 bg-background/50 divide-y divide-border/70">
            {items.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`} className="border-b-0 px-5">
                <AccordionTrigger className="text-left font-heading text-base font-bold hover:no-underline hover:text-primary">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-[15px]">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Section>
  );
}
