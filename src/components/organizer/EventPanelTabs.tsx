import { Link, useLocation } from 'react-router-dom';

export type EventPanelTabKey = 'overview' | 'edit' | 'registrations' | 'rounds' | 'checkin' | 'communications' | 'analytics' | 'settings';

interface EventPanelTabsProps {
    eventId: string;
    active: EventPanelTabKey;
}

// Sub-navigation for the per-event organizer panel. Communications and Analytics
// tabs are added once those workstreams land — kept out for now so nothing 404s.
export default function EventPanelTabs({ eventId, active }: EventPanelTabsProps) {
    const location = useLocation();
    const tabs: { key: EventPanelTabKey; label: string; to: string }[] = [
        { key: 'overview', label: 'Overview', to: `/events/organizer/${eventId}` },
        { key: 'edit', label: 'Edit Event', to: `/events/organizer/${eventId}/edit` },
        { key: 'registrations', label: 'Registrations', to: `/events/organizer/${eventId}/registrations` },
        { key: 'rounds', label: 'Rounds & Submissions', to: `/events/organizer/${eventId}/rounds` },
        { key: 'checkin', label: 'Check-in', to: `/events/organizer/${eventId}/checkin` },
        { key: 'communications', label: 'Communications', to: `/events/organizer/${eventId}/communications` },
        { key: 'analytics', label: 'Analytics', to: `/events/organizer/${eventId}/analytics` },
        { key: 'settings', label: 'Settings', to: `/events/organizer/${eventId}/settings` },
    ];

    return (
        <div className="flex items-center gap-1 mb-6 overflow-x-auto border-b border-border/50">
            {tabs.map(tab => {
                const isActive = tab.key === active || (tab.key !== 'overview' && location.pathname.startsWith(tab.to));
                return (
                    <Link
                        key={tab.key}
                        to={tab.to}
                        className={`flex-shrink-0 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                            isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
