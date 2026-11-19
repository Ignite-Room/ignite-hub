import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, useId } from 'react';

const base =
  'w-full rounded-2xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-colors dark:[color-scheme:dark]';

function borderFor(error?: string) {
  return error ? 'border-destructive/70' : 'border-border';
}

function Wrap({ id, label, required, hint, error, children, className = '' }: { id: string; label: ReactNode; required?: boolean; hint?: ReactNode; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground/90 mb-1.5">
        {label}
        {required ? <span className="text-primary"> *</span> : <span className="text-muted-foreground font-normal"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

type Common = { label: ReactNode; required?: boolean; hint?: ReactNode; error?: string; className?: string };

export function TextField({ label, required, hint, error, className, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Wrap id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        aria-required={required}
        className={`${base} h-11 ${borderFor(error)}`}
        {...rest}
      />
    </Wrap>
  );
}

export function TextArea({ label, required, hint, error, className, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Wrap id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${base} py-3 min-h-[110px] ${borderFor(error)}`}
        {...rest}
      />
    </Wrap>
  );
}

export function SelectField({ label, required, hint, error, className, options, placeholder = 'Select…', ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; placeholder?: string }) {
  const id = useId();
  return (
    <Wrap id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${base} h-11 appearance-none pr-10 bg-no-repeat bg-[length:14px] bg-[right_14px_center] ${borderFor(error)}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Wrap>
  );
}

/** Pill-style single choice (radio group). */
export function Choice({ label, required, error, options, value, onChange, name }: { label: ReactNode; required?: boolean; error?: string; options: string[]; value: string; onChange: (v: string) => void; name: string }) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-foreground/90 mb-2">
        {label}
        {required && <span className="text-primary"> *</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o;
          return (
            <label
              key={o}
              className={`cursor-pointer select-none rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/60 ${
                active ? 'border-primary bg-primary/15 text-foreground' : error ? 'border-destructive/60 text-foreground/80' : 'border-border text-foreground/80 hover:border-primary/50'
              }`}
            >
              <input type="radio" name={name} value={o} checked={active} onChange={() => onChange(o)} className="sr-only" />
              {o}
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </fieldset>
  );
}

/** Multi-select pills (checkbox group). */
export function MultiChoice({ label, options, value, onChange, error, required }: { label: ReactNode; options: string[]; value: string[]; onChange: (v: string[]) => void; error?: string; required?: boolean }) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-foreground/90 mb-2">
        {label}
        {required && <span className="text-primary"> *</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value.includes(o);
          return (
            <label
              key={o}
              className={`cursor-pointer select-none rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/60 ${
                active ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-foreground/80 hover:border-primary/50'
              }`}
            >
              <input type="checkbox" checked={active} onChange={() => onChange(active ? value.filter((v) => v !== o) : [...value, o])} className="sr-only" />
              {o}
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </fieldset>
  );
}

export function Consent({ checked, onChange, error, children }: { checked: boolean; onChange: (v: boolean) => void; error?: string; children: ReactNode }) {
  return (
    <label className={`flex gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${checked ? 'border-primary/50 bg-primary/5' : error ? 'border-destructive/60' : 'border-border hover:border-primary/40'}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]" />
      <span className="text-sm text-foreground/90 leading-relaxed">{children}</span>
    </label>
  );
}

/** Invisible field bots fill in and humans don't. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Company website
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^(\+?91[\s-]?)?[6-9]\d{9}$/;
export const normPhone = (p: string) => p.replace(/[\s-]/g, '');
