import { Users, CalendarDays } from 'lucide-react';

interface AuthStatsProps {
    stats: { totalUsers: number; hostedEvents: number } | null;
}

export default function AuthStats({ stats }: AuthStatsProps) {
    return (
        <div className="flex items-center gap-6 sm:gap-10 mt-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>
                    <span className="font-heading font-bold text-foreground">{stats ? `${stats.totalUsers.toLocaleString()}+` : '-'}</span> builders active
                </span>
            </div>
            <div className="h-4 w-px bg-border/60" />
            <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>
                    <span className="font-heading font-bold text-foreground">{stats ? `${stats.hostedEvents}+` : '-'}</span> events hosted
                </span>
            </div>
        </div>
    );
}
