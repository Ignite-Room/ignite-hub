import {
    LayoutDashboard, Users, FileCheck, Building2, Trophy, ShieldCheck,
    CalendarDays, UserCog, Briefcase, Send, Mail, Landmark, type LucideIcon,
} from 'lucide-react';

export interface AdminNavItem {
    label: string;
    to: string;
    icon: LucideIcon;
}

export interface AdminNavGroup {
    label: string;
    items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', to: '/ambassador/admin?tab=applications', icon: LayoutDashboard },
        ],
    },
    {
        label: 'Ambassador Program',
        items: [
            { label: 'Applications', to: '/ambassador/admin?tab=applications', icon: Users },
            { label: 'Submissions', to: '/ambassador/admin?tab=submissions', icon: FileCheck },
            { label: 'Ambassadors', to: '/ambassador/admin?tab=ambassadors', icon: Building2 },
            { label: 'Leaderboard', to: '/ambassador/admin?tab=leaderboard', icon: Trophy },
            { label: 'External Verification', to: '/ambassador/admin/external-verification', icon: ShieldCheck },
        ],
    },
    {
        label: 'Events',
        items: [
            { label: 'All Events', to: '/ambassador/admin/events?tab=events', icon: CalendarDays },
            { label: 'Organizer Applications', to: '/ambassador/admin/events?tab=organizers', icon: UserCog },
        ],
    },
    {
        label: 'Finance',
        items: [
            { label: 'Organizer Payouts', to: '/ambassador/admin/payouts', icon: Landmark },
        ],
    },
    {
        label: 'Careers',
        items: [
            { label: 'Careers', to: '/ambassador/admin/careers', icon: Briefcase },
        ],
    },
    {
        label: 'Communications',
        items: [
            { label: 'Mail Center', to: '/ambassador/admin/mail', icon: Send },
            { label: 'Ambassador Mailing', to: '/ambassador/admin?tab=mailing', icon: Mail },
        ],
    },
];
