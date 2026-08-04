import { LayoutDashboard, CalendarDays, Plus, IndianRupee, Landmark, Building2, type LucideIcon } from 'lucide-react';

export interface OrganizerNavItem {
    label: string;
    to: string;
    icon: LucideIcon;
}

export interface OrganizerNavGroup {
    label: string;
    items: OrganizerNavItem[];
}

export const ORGANIZER_NAV: OrganizerNavGroup[] = [
    {
        label: 'Events',
        items: [
            { label: 'Dashboard', to: '/events/organizer', icon: LayoutDashboard },
            { label: 'My Events', to: '/events/organizer/events', icon: CalendarDays },
            { label: 'Create Event', to: '/events/organizer/new', icon: Plus },
        ],
    },
    {
        label: 'Payments',
        items: [
            { label: 'Earnings & Payouts', to: '/events/organizer/earnings', icon: IndianRupee },
            { label: 'Payout Settings', to: '/events/organizer/payout-settings', icon: Landmark },
        ],
    },
    {
        label: 'Organization',
        items: [
            { label: 'Organization Profile', to: '/events/organizer/profile', icon: Building2 },
        ],
    },
];
