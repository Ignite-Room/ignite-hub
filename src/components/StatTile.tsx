import { ReactNode } from 'react';

export function StatTileGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
    const colsClass = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';
    const divideClass = cols === 2
        ? 'divide-x divide-border/60'
        : 'divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-border/60';
    return (
        <div className={`info-section grid ${colsClass} ${divideClass}`}>
            {children}
        </div>
    );
}

export default function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
    return (
        <div className="info-block flex items-center gap-3 p-4">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-lg font-bold text-foreground truncate">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}
