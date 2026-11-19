import { FormEvent, ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardList, FlaskConical, Loader2, Lock } from 'lucide-react';
import { track } from '@vercel/analytics';
import { useSEO } from '@/hooks/use-seo';
import HALayout from '../components/HALayout';
import { Countdown, GridGlow, PrimaryButton, Serif } from '../components/bits';
import { Choice, Consent, EMAIL_RE, Honeypot, PHONE_RE, SelectField, TextField, normPhone } from '../components/fields';
import { HA, HA_BASE, HA_DATES, HA_ROUND_DATE_MAX, HA_ROUND_DATE_MIN, getPhase, isPreviewMode } from '../config';
import { INDIAN_STATES } from '../content';
import { submitForm } from '../api';

const initial = {
  collegeName: '', city: '', state: '', website: '', collegeType: '', techStudents: '',
  spocName: '', spocDesignation: '', spocDepartment: '', spocEmail: '', spocPhone: '',
  studentName: '', studentYear: '', studentBranch: '', studentEmail: '', studentPhone: '', studentLinkedin: '',
  preferredDate: '', backupDate: '', expectedTeams: '', venue: '',
  bringingSponsor: '',
};
type Form = typeof initial;
type Errors = Partial<Record<keyof Form | 'consentRules' | 'consentOffline' | 'consentReporting', string>>;

const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

function validate(f: Form, c: { rules: boolean; offline: boolean; reporting: boolean }): Errors {
  const e: Errors = {};
  const req = (k: keyof Form, msg = 'Required') => { if (!f[k].trim()) e[k] = msg; };
  (['collegeName', 'city', 'spocName', 'spocDepartment', 'studentName', 'studentBranch', 'venue'] as const).forEach((k) => req(k));
  req('state', 'Pick a state');
  req('collegeType', 'Pick one');
  req('spocDesignation', 'Pick one');
  req('studentYear', 'Pick one');
  req('bringingSponsor', 'Pick one');
  if (f.website && !URL_RE.test(f.website.trim())) e.website = 'Enter a valid website';
  const ts = Number(f.techStudents);
  if (!f.techStudents) e.techStudents = 'Required';
  else if (!Number.isFinite(ts) || ts < 1) e.techStudents = 'Enter a number';
  if (!EMAIL_RE.test(f.spocEmail.trim())) e.spocEmail = 'Enter a valid email';
  if (!EMAIL_RE.test(f.studentEmail.trim())) e.studentEmail = 'Enter a valid email';
  if (f.spocEmail.trim() && f.spocEmail.trim().toLowerCase() === f.studentEmail.trim().toLowerCase()) e.studentEmail = 'Use a different email from the SPOC';
  if (!PHONE_RE.test(normPhone(f.spocPhone))) e.spocPhone = 'Enter a valid 10-digit mobile number';
  if (!PHONE_RE.test(normPhone(f.studentPhone))) e.studentPhone = 'Enter a valid 10-digit mobile number';
  if (f.studentLinkedin && !/linkedin\.com\//i.test(f.studentLinkedin)) e.studentLinkedin = 'Enter a LinkedIn profile URL';
  const inWindow = (d: string) => d >= HA_ROUND_DATE_MIN && d <= HA_ROUND_DATE_MAX;
  if (!f.preferredDate) e.preferredDate = 'Pick a date';
  else if (!inWindow(f.preferredDate)) e.preferredDate = 'Must be between 10 Feb and 25 Apr 2027';
  if (f.backupDate && !inWindow(f.backupDate)) e.backupDate = 'Must be between 10 Feb and 25 Apr 2027';
  if (f.backupDate && f.backupDate === f.preferredDate) e.backupDate = 'Pick a different date';
  const et = Number(f.expectedTeams);
  if (!f.expectedTeams) e.expectedTeams = 'Required';
  else if (!Number.isFinite(et) || et < 20) e.expectedTeams = 'At least 20 teams must check in for the round to be valid';
  if (!c.rules) e.consentRules = 'Required';
  if (!c.offline) e.consentOffline = 'Required';
  if (!c.reporting) e.consentReporting = 'Required';
  return e;
}

function Block({ n, title, sub, children }: { n: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-[26px] border border-border bg-card p-5 sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-start gap-4 mb-6">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/50 ha-mono text-xs font-bold text-primary">{n}</span>
        <div>
          <h2 className="font-heading text-xl font-bold">{title}</h2>
          {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

const NEXT_STEPS = [
  'Confirmation email to the SPOC and the Student Coordinator, with the rule book',
  'The Ignite Room team reviews your application',
  'Approval email with the steps to set up your private Nymble page',
  "Once your Nymble link is in, your college's card goes live on this site",
];

function NextSteps() {
  return (
    <ol className="space-y-4">
      {NEXT_STEPS.map((s, i) => (
        <li key={s} className="flex gap-3 text-sm leading-relaxed">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 ha-mono text-[11px] font-bold text-primary">{i + 1}</span>
          <span className="text-foreground/85">{s}</span>
        </li>
      ))}
    </ol>
  );
}

function ApplicationForm({ preview }: { preview: boolean }) {
  const [f, setF] = useState<Form>(initial);
  const [consent, setConsent] = useState({ rules: false, offline: false, reporting: false });
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [ref, setRef] = useState('');

  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const pick = (k: keyof Form) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const er = validate(f, consent);
    setErrors(er);
    if (Object.keys(er).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"], .text-destructive')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    setState('sending');
    const payload = {
      ...f,
      spocPhone: normPhone(f.spocPhone),
      studentPhone: normPhone(f.studentPhone),
      techStudents: Number(f.techStudents),
      expectedTeams: Number(f.expectedTeams),
      consentRules: consent.rules,
      consentOffline: consent.offline,
      consentReporting: consent.reporting,
    };
    const res = await submitForm('apply', payload, { preview, honeypot: hp });
    if (res.ok) {
      track('ha_apply_submit', { preview });
      setRef(res.ref || '');
      setState('done');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setState('error');
      setErrMsg(res.error || 'Something went wrong');
    }
  };

  if (state === 'done') {
    return (
      <div className="rounded-3xl border border-primary/40 bg-primary/5 p-8 md:p-12">
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <h2 className="mt-6 font-heading text-3xl md:text-4xl font-extrabold">Application received.</h2>
        <p className="mt-3 text-muted-foreground max-w-xl leading-relaxed">
          Thank you for applying to host a HackArena 2027 campus round at <span className="text-foreground font-semibold">{f.collegeName}</span>.
          {ref && <> Your reference is <span className="ha-mono text-foreground">{ref}</span>.</>}
        </p>
        <div className="mt-8 max-w-xl"><NextSteps /></div>
        <p className="mt-8 text-sm text-muted-foreground">
          No email within an hour? Check spam, or write to <a className="text-primary hover:underline" href={`mailto:${HA.contactEmail}`}>{HA.contactEmail}</a>.
        </p>
        <div className="mt-8"><PrimaryButton to={HA_BASE}>Back to HackArena 2027</PrimaryButton></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative space-y-6">
      <Honeypot value={hp} onChange={setHp} />

      <Block n="01" title="College">
        <TextField className="sm:col-span-2" label="College name" required value={f.collegeName} onChange={set('collegeName')} error={errors.collegeName} maxLength={160} autoComplete="organization" />
        <TextField label="City" required value={f.city} onChange={set('city')} error={errors.city} maxLength={80} autoComplete="address-level2" />
        <SelectField label="State / UT" required options={INDIAN_STATES} value={f.state} onChange={set('state')} error={errors.state} />
        <TextField label="College website" value={f.website} onChange={set('website')} error={errors.website} placeholder="https://" maxLength={200} inputMode="url" />
        <TextField label="Approx. number of tech students" required type="number" min={1} inputMode="numeric" value={f.techStudents} onChange={set('techStudents')} error={errors.techStudents} />
        <div className="sm:col-span-2">
          <Choice name="collegeType" label="College type" required options={['Government', 'Private', 'Deemed']} value={f.collegeType} onChange={pick('collegeType')} error={errors.collegeType} />
        </div>
      </Block>

      <Block n="02" title="Faculty SPOC" sub="The faculty member who owns the campus round.">
        <TextField label="Full name" required value={f.spocName} onChange={set('spocName')} error={errors.spocName} maxLength={100} />
        <TextField label="Department" required value={f.spocDepartment} onChange={set('spocDepartment')} error={errors.spocDepartment} maxLength={120} />
        <div className="sm:col-span-2">
          <Choice name="spocDesignation" label="Designation" required options={['Dean', 'Faculty Coordinator', 'HOD']} value={f.spocDesignation} onChange={pick('spocDesignation')} error={errors.spocDesignation} />
        </div>
        <TextField label="Official email" required type="email" value={f.spocEmail} onChange={set('spocEmail')} error={errors.spocEmail} hint="Your college email address" maxLength={150} />
        <TextField label="Phone" required type="tel" inputMode="tel" value={f.spocPhone} onChange={set('spocPhone')} error={errors.spocPhone} placeholder="10-digit mobile" maxLength={16} />
      </Block>

      <Block n="03" title="Student Coordinator" sub="The student who runs the round with the SPOC.">
        <TextField label="Full name" required value={f.studentName} onChange={set('studentName')} error={errors.studentName} maxLength={100} />
        <TextField label="Branch" required value={f.studentBranch} onChange={set('studentBranch')} error={errors.studentBranch} placeholder="e.g. Computer Science" maxLength={120} />
        <div className="sm:col-span-2">
          <Choice name="studentYear" label="Year" required options={['1st', '2nd', '3rd', '4th', '5th']} value={f.studentYear} onChange={pick('studentYear')} error={errors.studentYear} />
        </div>
        <TextField label="Email" required type="email" value={f.studentEmail} onChange={set('studentEmail')} error={errors.studentEmail} maxLength={150} />
        <TextField label="Phone" required type="tel" inputMode="tel" value={f.studentPhone} onChange={set('studentPhone')} error={errors.studentPhone} placeholder="10-digit mobile" maxLength={16} />
        <TextField className="sm:col-span-2" label="LinkedIn" value={f.studentLinkedin} onChange={set('studentLinkedin')} error={errors.studentLinkedin} placeholder="https://www.linkedin.com/in/…" maxLength={200} />
      </Block>

      <Block n="04" title="Campus round plan" sub="Any date between 10 February and 25 April 2027. Ignite Room confirms the final date.">
        <TextField label="Preferred date" required type="date" min={HA_ROUND_DATE_MIN} max={HA_ROUND_DATE_MAX} value={f.preferredDate} onChange={set('preferredDate')} error={errors.preferredDate} />
        <TextField label="Backup date" type="date" min={HA_ROUND_DATE_MIN} max={HA_ROUND_DATE_MAX} value={f.backupDate} onChange={set('backupDate')} error={errors.backupDate} />
        <TextField label="Expected teams" required type="number" min={20} inputMode="numeric" value={f.expectedTeams} onChange={set('expectedTeams')} error={errors.expectedTeams} hint="Minimum 20 checked-in teams" />
        <TextField label="Venue" required value={f.venue} onChange={set('venue')} error={errors.venue} placeholder="e.g. Main auditorium" maxLength={160} />
      </Block>

      <Block n="05" title="College sponsor">
        <div className="sm:col-span-2">
          <Choice name="bringingSponsor" label="Do you plan to bring a sponsor for your campus round?" required options={['Yes', 'No']} value={f.bringingSponsor} onChange={pick('bringingSponsor')} error={errors.bringingSponsor} />
          <p className="mt-2 text-xs text-muted-foreground">Any college sponsor needs Ignite Room approval.</p>
        </div>
      </Block>

      <fieldset className="rounded-[26px] border border-border bg-card p-5 sm:p-7 space-y-3">
        <legend className="sr-only">Consent</legend>
        <div className="flex items-start gap-4 mb-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/50 ha-mono text-xs font-bold text-primary">06</span>
          <h2 className="font-heading text-xl font-bold pt-1">Consent</h2>
        </div>
        <Consent checked={consent.rules} onChange={(v) => setConsent((c) => ({ ...c, rules: v }))} error={errors.consentRules}>
          We have read the <Link to={`${HA_BASE}/rules`} target="_blank" className="text-primary underline">Campus Round Rule Book</Link>.
        </Consent>
        <Consent checked={consent.offline} onChange={(v) => setConsent((c) => ({ ...c, offline: v }))} error={errors.consentOffline}>
          The campus round will be held offline, with at least 20 checked-in teams.
        </Consent>
        <Consent checked={consent.reporting} onChange={(v) => setConsent((c) => ({ ...c, reporting: v }))} error={errors.consentReporting}>
          We will share recap reels, an event report and the feedback form within 2 days of the round.
        </Consent>
        {(errors.consentRules || errors.consentOffline || errors.consentReporting) && <p className="text-xs text-destructive">Please confirm all three to apply.</p>}
      </fieldset>

      {state === 'error' && (
        <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm">
          {errMsg === 'not-connected' ? (
            <>Online applications aren&apos;t connected yet. Please email your details to <a className="underline" href={`mailto:${HA.contactEmail}?subject=HackArena 2027 college application`}>{HA.contactEmail}</a>.</>
          ) : (
            <>We couldn&apos;t submit your application ({errMsg}). Please try again in a minute, or email <a className="underline" href={`mailto:${HA.contactEmail}`}>{HA.contactEmail}</a>.</>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-[0_0_40px_-8px_hsl(var(--primary)/0.8)]"
        >
          {state === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
          {state === 'sending' ? 'Submitting…' : 'Submit application'}
        </button>
        <p className="text-xs text-muted-foreground">By applying you agree to our <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.</p>
      </div>
    </form>
  );
}

export default function HackArenaApply() {
  const phase = getPhase();
  const preview = isPreviewMode();
  const formOpen = phase === 'open' || preview;

  useSEO({
    title: 'Apply as a college · HackArena – 2027 Edition | Ignite Room',
    description: 'Faculty SPOCs and Student Coordinators: apply to host a HackArena 2027 campus round at your college. Applications are open 25 November 2026 – 5 January 2027.',
    path: '/hackarena-2027/apply',
    noindex: preview,
  });

  return (
    <HALayout>
      <section className="relative overflow-hidden pt-28 pb-10 md:pt-36 md:pb-14">
        <GridGlow />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={HA_BASE} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> HackArena 2027
          </Link>
          <h1 className="mt-5 font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.02] tracking-tight">
            Apply as a <Serif className="text-gradient pr-2 text-[1.08em]">college.</Serif>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed">
            A Faculty SPOC (Dean, Faculty Coordinator or HOD) applies together with a Student Coordinator. It takes about 5 minutes.
            Applications are open 25 November 2026 – 5 January 2027.
          </p>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {preview && phase !== 'open' && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 text-sm text-sky-800 dark:text-sky-200">
            <FlaskConical className="h-5 w-5 shrink-0" />
            <span>Preview mode: the form is open for testing. Submissions are marked <b>TEST</b> in the sheet.</span>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            {formOpen ? (
              <ApplicationForm preview={preview && phase !== 'open'} />
            ) : phase === 'pre' ? (
              <div className="rounded-3xl border border-border/80 bg-card/50 p-7 md:p-10">
                <Lock className="h-8 w-8 text-primary" />
                <h2 className="mt-5 font-heading text-2xl md:text-3xl font-extrabold">Applications open on 25 November 2026.</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">The form goes live here at midnight IST. Line up the details below so your SPOC and Student Coordinator can apply in one go.</p>
                <div className="mt-8 max-w-lg"><Countdown target={HA_DATES.applicationsOpen} label="Applications open in" /></div>
                <div className="mt-10">
                  <h3 className="flex items-center gap-2 font-heading text-lg font-bold"><ClipboardList className="h-5 w-5 text-primary" /> What you&apos;ll need</h3>
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 text-sm text-foreground/85">
                    {[
                      'College name, city, state, website and type',
                      'Approx. number of tech students',
                      "Faculty SPOC's name, designation, department, official email and phone",
                      "Student Coordinator's name, year, branch, email and phone",
                      'Preferred and backup round dates (10 Feb – 25 Apr 2027)',
                      'Expected teams (min. 20) and venue',
                    ].map((x) => (
                      <li key={x} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-border/80 bg-card/50 p-7 md:p-10">
                <Lock className="h-8 w-8 text-primary" />
                <h2 className="mt-5 font-heading text-2xl md:text-3xl font-extrabold">Applications closed.</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">College applications closed on 5 January 2027. Find approved campus rounds and register on your college&apos;s page.</p>
                <div className="mt-8"><PrimaryButton to={`${HA_BASE}#campuses`}>Find your campus</PrimaryButton></div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 h-fit space-y-5">
            <div className="rounded-2xl border border-border/80 bg-card/50 p-6">
              <h2 className="ha-mono text-[11px] lowercase text-primary font-bold">(after you apply)</h2>
              <div className="mt-5"><NextSteps /></div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/50 p-6 text-sm">
              <h2 className="ha-mono text-[11px] lowercase text-primary font-bold">(at a glance)</h2>
              <dl className="mt-4 space-y-3">
                {[
                  ['Format', 'Offline idea pitching'],
                  ['Window', '10 Feb – 25 Apr 2027'],
                  ['Minimum', '20 checked-in teams'],
                  ['Teams', '2–5, same college'],
                  ['Shortlist', '20% (max 20), same day'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link to={`${HA_BASE}/rules`} className="mt-5 inline-flex text-primary hover:underline">Read the full rule book →</Link>
            </div>
          </aside>
        </div>
      </section>
    </HALayout>
  );
}
