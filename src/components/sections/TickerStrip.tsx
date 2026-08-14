import { Flame } from 'lucide-react';

const WORDS = ['Create', 'Ship', 'Build', 'Connect', 'Create', 'Ship'];

/** Infinite-scrolling pink marquee strip, matching the "CREATE + BUILD + SHIP" ticker in the brand refresh. */
export default function TickerStrip() {
  const track = (
    <div className="flex shrink-0 items-center">
      {WORDS.map((word, i) => (
        <span key={i} className="flex items-center gap-3 px-6 py-3 text-sm md:text-base font-heading font-semibold uppercase tracking-wide text-primary-foreground">
          {word}
          <Flame className="h-3.5 w-3.5 shrink-0 fill-current opacity-80" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-primary select-none">
      <div className="flex w-max animate-marquee">
        {track}
        {track}
      </div>
    </div>
  );
}
