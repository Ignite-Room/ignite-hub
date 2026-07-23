const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeader() {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminEventsFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}/admin${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

export function adminEventsExportUrl(eventId: string): string {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return `${API_URL}/admin/events/${eventId}/registrations?format=csv&token=${token}`;
}

export interface AdminEventSummary {
    id: string; slug: string; title: string; status: string; startAt: string; category: string; mode: string;
    isFeatured: boolean;
    organizer: { orgName: string };
    revenueInPaise: number;
    _count: { registrations: number };
}

export interface AdminTicketType {
    id: string; name: string; priceInPaise: number; quantity: number | null; quantitySold: number;
    minTeamSize: number; maxTeamSize: number; isActive: boolean;
}

export interface AdminEventDetail {
    id: string; slug: string; title: string; tagline: string | null; description: string;
    category: string; mode: string; venueName: string | null; venueAddress: string | null;
    onlineUrl: string | null; coverImageUrl: string | null;
    startAt: string; endAt: string; registrationDeadline: string | null; capacity: number | null;
    status: string; isFeatured: boolean; createdAt: string; updatedAt: string;
    organizer: {
        id: string; orgName: string; orgType: string; contactEmail: string; contactPhone: string;
        user: { name: string; email: string };
    };
    ticketTypes: AdminTicketType[];
    rounds: { id: string; name: string; order: number; _count: { submissions: number } }[];
    analytics: {
        totalRegistrations: number;
        registrationsByStatus: Record<string, number>;
        revenueInPaise: number;
        registrationsOverTime: { date: string; count: number }[];
    };
}

export interface AdminEventUpdateInput {
    title?: string;
    tagline?: string | null;
    description?: string;
    category?: string;
    mode?: string;
    venueName?: string | null;
    venueAddress?: string | null;
    onlineUrl?: string | null;
    coverImageUrl?: string | null;
    startAt?: string;
    endAt?: string;
    registrationDeadline?: string | null;
    capacity?: number | null;
    isFeatured?: boolean;
    status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}

export interface AdminRegistration {
    id: string; name: string; email: string; phone: string; teamName: string | null;
    status: string; checkedInAt: string | null; createdAt: string;
    ticketType: { name: string; priceInPaise: number };
    order: { id: string; status: string; amountInPaise: number; gatewayPaymentId: string | null } | null;
    teamMembers: { name: string; email: string | null; phone: string | null }[];
}

export interface EventsAnalytics {
    totalEvents: number;
    publishedEvents: number;
    draftEvents: number;
    totalRegistrations: number;
    confirmedRegistrations: number;
    totalRevenueInPaise: number;
    registrationsOverTime: { date: string; count: number }[];
    topEvents: { id: string; title: string; organizerName: string; registrations: number; revenueInPaise: number }[];
}

export async function fetchAdminEvent(id: string): Promise<AdminEventDetail> {
    return adminEventsFetch<AdminEventDetail>(`/events/${id}`);
}

export async function updateAdminEvent(id: string, data: AdminEventUpdateInput): Promise<AdminEventDetail> {
    return adminEventsFetch(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function fetchAdminRegistrations(id: string): Promise<AdminRegistration[]> {
    return adminEventsFetch<AdminRegistration[]>(`/events/${id}/registrations`);
}

export async function fetchEventsAnalytics(): Promise<EventsAnalytics> {
    return adminEventsFetch<EventsAnalytics>('/analytics/events');
}

export async function refundOrder(orderId: string): Promise<{ ok: boolean; message: string }> {
    return adminEventsFetch(`/orders/${orderId}/refund`, { method: 'POST' });
}
