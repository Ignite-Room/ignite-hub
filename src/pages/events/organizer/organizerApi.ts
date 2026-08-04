const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeader() {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function organizerFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}/organizer/events${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

export async function organizerUpload<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(`${API_URL}/organizer/events${path}`, {
        method: 'POST',
        headers: { ...authHeader() },
        body: formData,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

export async function fetchOrganizerEvent(id: string): Promise<OrganizerEvent> {
    return organizerFetch<OrganizerEvent>(`/${id}`);
}

export function organizerExportUrl(eventId: string): string {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return `${API_URL}/organizer/events/${eventId}/registrations?format=csv&token=${token}`;
}

export interface CustomField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
}

export interface ScoreCriterion {
    id: string;
    roundId: string;
    name: string;
    maxPoints: number;
    order: number;
}

export interface EventRound {
    id: string; eventId: string; name: string; description: string | null;
    order: number; submissionDeadline: string | null;
    type: 'EVALUATION' | 'SCREENING';
    allowFileUpload: boolean; allowLinks: boolean;
    criteria: ScoreCriterion[];
    _count?: { submissions: number };
}

export interface EventPrize {
    position: string;
    reward: string;
    description?: string;
}

export interface EventFaq {
    question: string;
    answer: string;
}

export interface OrganizerEvent {
    id: string; slug: string; title: string; tagline: string | null; description: string;
    category: string; mode: string; venueName: string | null; venueAddress: string | null;
    onlineUrl: string | null; coverImageUrl: string | null;
    startAt: string; endAt: string; registrationDeadline: string | null;
    capacity: number | null; status: string; isFeatured: boolean;
    customFields: CustomField[] | null;
    prizes: EventPrize[] | null;
    faqs: EventFaq[] | null;
    ticketTypes: OrganizerTicketType[];
    rounds: EventRound[];
    _count: { registrations: number };
}

export interface OrganizerTicketType {
    id: string; eventId: string; name: string; description: string | null;
    priceInPaise: number; quantity: number | null; quantitySold: number;
    minTeamSize: number; maxTeamSize: number; isActive: boolean;
}

export interface OrganizerRegistration {
    id: string; name: string; email: string; phone: string; teamName: string | null;
    status: string; checkedInAt: string | null; createdAt: string;
    ticketType: { name: string; priceInPaise: number };
    order: { status: string; amountInPaise: number } | null;
    teamMembers: { name: string; email: string | null; phone: string | null }[];
}

export interface SubmissionScore {
    id: string;
    criterionId: string;
    points: number;
}

export interface RoundSubmission {
    id: string; roundId: string; registrationId: string;
    fileUrl: string | null; repoUrl: string | null; liveUrl: string | null; notes: string | null;
    status: 'PENDING' | 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED';
    submittedAt: string | null; reviewedAt: string | null;
    registration: { name: string; email: string; teamName: string | null };
    scores: SubmissionScore[];
}

export function organizerRoundExportUrl(eventId: string, roundId: string): string {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return `${API_URL}/organizer/events/${eventId}/rounds/${roundId}/submissions?format=csv&token=${token}`;
}

export interface DashboardStats {
    totalEvents: number;
    activeEvents: number;
    totalRegistrations: number;
    totalRevenueInPaise: number;
    monthlyRevenue: { month: string; revenueInPaise: number }[];
    recentEvents: {
        id: string; slug: string; title: string; status: string;
        startAt: string; coverImageUrl: string | null; registrationCount: number;
    }[];
}

export function fetchDashboardStats(): Promise<DashboardStats> {
    return organizerFetch<DashboardStats>('/dashboard-stats');
}

export interface EventOverviewStats {
    totalRegistrations: number;
    confirmedCount: number;
    checkedInCount: number;
    revenueInPaise: number;
    registrationTrend: { date: string; count: number }[];
}

export function fetchEventOverviewStats(eventId: string): Promise<EventOverviewStats> {
    return organizerFetch<EventOverviewStats>(`/${eventId}/overview-stats`);
}
