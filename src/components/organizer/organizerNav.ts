import { LayoutDashboard, IndianRupee, Landmark, type LucideIcon } from 'lucide-react';

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
        ],
    },
    {
        label: 'Payments',
        items: [
            { label: 'Earnings & Payouts', to: '/events/organizer/earnings', icon: IndianRupee },
            { label: 'Payout Settings', to: '/events/organizer/payout-settings', icon: Landmark },
        ],
    },
];
