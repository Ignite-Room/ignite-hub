interface SectionEyebrowProps {
  index?: string;
  label: string;
  className?: string;
}

/** Numbered section label used above section headings, e.g. "01 / Meet the Community". */
export default function SectionEyebrow({ index, label, className = '' }: SectionEyebrowProps) {
  return (
    <span className={`font-body text-primary font-bold text-xs uppercase tracking-[0.15em] block mb-4 ${className}`}>
      {index ? `${index} / ${label}` : label}
    </span>
  );
}
