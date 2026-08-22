interface SectionEyebrowProps {
  index?: string;
  label: string;
  className?: string;
}

/** Numbered section label used above section headings, e.g. "01 / Meet the Community". */
export default function SectionEyebrow({ index, label, className = '' }: SectionEyebrowProps) {
  return (
    <span className={`text-primary font-medium text-sm uppercase tracking-wider block mb-4 ${className}`}>
      {index ? `${index} / ${label}` : label}
    </span>
  );
}
