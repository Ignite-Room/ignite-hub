import { MockAPI } from './mock-api';
import type { User } from './auth-context';
import type { Submission, LeaderboardEntry } from './mock-api';

// Dynamic, admin-manageable ambassador task (replaces the old hardcoded TaskKey
// enum-driven system). `fields` mirrors what used to be a static requirements map.
export interface Task {
    id: string;
    key: string;
    title: string;
    description: string;
    instructions: string | null;
    ctaUrl: string | null;
    ctaLabel: string | null;
    fields: { phone?: boolean; email?: boolean; github?: boolean };
    points: number;
}

// Admin/organizer accounts (email OTP) and any account with authenticator-app 2FA
// enabled return otpRequired instead of a token; the caller must complete the flow
// via api.verifyLoginOtp (method 'email') or api.verifyLoginTotp (method 'totp')
// before a session exists.
export type LoginResponse = { token: string; user: User } | { otpRequired: true; email: string; method: 'email' | 'totp' };

// ── Configuration ─────────────────────────────────────────────────────────
// VITE_USE_MOCK=true → use localStorage mock (development)
// VITE_USE_MOCK=false → use real Express backend (production)
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
// Ensure fallback works even if env var is empty string
const API_BASE = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '')
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3001/api';

if (USE_MOCK) MockAPI.init();

// ── Auth token helper ─────────────────────────────────────────────────────
function authHeader(): Record<string, string> {
    // Check both storages: localStorage for "Remember Me" sessions, sessionStorage for regular sessions
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Preserves the HTTP status code so callers can reliably branch on it (e.g. 401 ->
// the token is dead, log out) instead of parsing the message string.
export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

// ── Generic fetch wrapper (JSON endpoints) ────────────────────────────────
async function real<T>(path: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            ...opts?.headers,
        },
        ...opts,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new ApiError(err.message || err.error || `HTTP ${res.status}`, res.status);
    }
    return res.json() as Promise<T>;
}

// ── Multipart fetch wrapper (file upload endpoints) ────────────────────────
async function realForm<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { ...authHeader() }, // NO Content-Type — browser sets multipart boundary
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
}

// ═════════════════════════════════════════════════════════════════════════
// API surface — used everywhere in the frontend
// ═════════════════════════════════════════════════════════════════════════
export const api = {
    // ── Auth ───────────────────────────────────────────────────────────────
    async login(email: string, password: string, rememberMe = false) {
        if (USE_MOCK) return MockAPI.login(email, password) as unknown as LoginResponse;
        return real<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, rememberMe }),
        });
    },

    async verifyLoginOtp(email: string, code: string, rememberMe = false) {
        if (USE_MOCK) throw new Error('OTP login requires the real backend (set VITE_USE_MOCK=false)');
        return real<{ token: string; user: User }>('/auth/verify-login-otp', {
            method: 'POST',
            body: JSON.stringify({ email, code, rememberMe }),
        });
    },

    async resendLoginOtp(email: string) {
        if (USE_MOCK) return { ok: true, message: '' };
        return real<{ ok: boolean; message: string }>('/auth/resend-login-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    async verifyLoginTotp(email: string, code: string, rememberMe = false) {
        if (USE_MOCK) throw new Error('Authenticator login requires the real backend (set VITE_USE_MOCK=false)');
        return real<{ token: string; user: User }>('/auth/verify-login-totp', {
            method: 'POST',
            body: JSON.stringify({ email, code, rememberMe }),
        });
    },

    // ── Authenticator-app 2FA (account settings) ──────────────────────────────
    async get2faStatus() {
        return real<{ enabled: boolean }>('/profile/2fa/status');
    },

    async setup2fa() {
        return real<{ secret: string; qrCodeDataUrl: string }>('/profile/2fa/setup', { method: 'POST' });
    },

    async verify2fa(code: string) {
        return real<{ enabled: boolean; backupCodes: string[] }>('/profile/2fa/verify', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    },

    async disable2fa(code: string) {
        return real<{ enabled: boolean }>('/profile/2fa/disable', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    },

    async applyAmbassador(data: { college: string; enrollmentId: string; phone: string }) {
        if (USE_MOCK) throw new Error('Applying requires the real backend (set VITE_USE_MOCK=false)');
        return real<{ ok: boolean; user: User }>('/auth/apply-ambassador', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async registerGeneral(data: { name: string; email: string; password: string; phone?: string }) {
        if (USE_MOCK) throw new Error('Sign up requires the real backend (set VITE_USE_MOCK=false)');
        return real<{ token: string; user: User }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async loginWithGoogle(credential: string) {
        if (USE_MOCK) throw new Error('Google login requires the real backend (set VITE_USE_MOCK=false)');
        return real<LoginResponse>('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential }),
        });
    },

    async forgotPassword(email: string) {
        if (USE_MOCK) return; // mock not supported for this side flow yet
        return real<{ ok: boolean; message: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    async resetPassword(email: string, token: string, newPassword: string) {
        if (USE_MOCK) return; // mock not supported
        return real<{ ok: boolean; message: string }>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, token, newPassword }),
        });
    },

    // ── Referrals ──────────────────────────────────────────────────────────
    async getAmbassadorByCode(code: string) {
        if (USE_MOCK) return MockAPI.getAmbassadorByCode(code);
        return real<User | null>(`/ref/${code}`);
    },

    async logReferralVisit(ambassadorId: string) {
        if (USE_MOCK) return MockAPI.logReferralVisit(ambassadorId);
        return real<void>('/referrals/visit', {
            method: 'POST',
            body: JSON.stringify({ ambassadorId }),
        });
    },

    async getDailyReferrals(ambassadorId: string) {
        if (USE_MOCK) return MockAPI.getDailyReferrals(ambassadorId);
        return real<{ date: string; count: number }[]>(`/referrals/daily/${ambassadorId}`);
    },

    async getMyStats(ambassadorId: string) {
        if (USE_MOCK) return MockAPI.getMyStats(ambassadorId);
        return real<Awaited<ReturnType<typeof MockAPI.getMyStats>>>(`/referrals/stats/${ambassadorId}`);
    },

    // ── Ambassador Tasks (dynamic) ────────────────────────────────────────────
    async getTasks() {
        if (USE_MOCK) return [];
        return real<Task[]>('/tasks');
    },

    // ── Task Submissions ────────────────────────────────────────────────────
    async submitTask(data: {
        ambassadorCode: string;
        taskKey: string;
        name: string;
        email?: string;
        phone?: string;
        githubUsername?: string;
        screenshotFile: File;
        recaptchaToken?: string;
    }) {
        if (USE_MOCK) return MockAPI.submitTask(data as Parameters<typeof MockAPI.submitTask>[0]);

        const form = new FormData();
        form.append('ambassadorCode', data.ambassadorCode);
        form.append('taskKey', data.taskKey);
        form.append('name', data.name);
        if (data.email) form.append('email', data.email);
        if (data.phone) form.append('phone', data.phone);
        if (data.githubUsername) form.append('githubUsername', data.githubUsername);
        form.append('screenshot', data.screenshotFile);
        if (data.recaptchaToken) {
            form.append('recaptchaToken', data.recaptchaToken);
        }

        return realForm<{ id: string; message: string }>('/submissions', form);
    },

    async getMySubmissions(ambassadorId: string) {
        if (USE_MOCK) return MockAPI.getMySubmissions(ambassadorId);
        return real<Submission[]>(`/submissions/mine/${ambassadorId}`);
    },

    async getAllSubmissions() {
        if (USE_MOCK) return MockAPI.getAllSubmissions();
        return real<Submission[]>('/submissions');
    },

    async updateSubmissionStatus(id: string, status: 'verified' | 'rejected', _adminId: string) {
        if (USE_MOCK) return MockAPI.updateSubmissionStatus(id, status, _adminId);
        // Real backend uses uppercase enums
        const backendStatus = status === 'verified' ? 'VERIFIED' : 'REJECTED';
        return real<void>(`/submissions/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: backendStatus }),
        });
    },

    // ── Leaderboard ────────────────────────────────────────────────────────
    async getLeaderboard() {
        if (USE_MOCK) return MockAPI.getLeaderboard();
        return real<LeaderboardEntry[]>('/leaderboard');
    },

    // ── Site stats (public, aggregate-only) ─────────────────────────────────
    async getStats() {
        if (USE_MOCK) return { totalUsers: 0, hostedEvents: 0, approvedAmbassadors: 0 };
        return real<{ totalUsers: number; hostedEvents: number; approvedAmbassadors: number }>('/stats');
    },

    // ── Admin: task board ────────────────────────────────────────────────────
    async getAdminTasks() {
        return real<(Task & { status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT'; sortOrder: number; submissionCount: number })[]>('/admin/tasks');
    },

    async createTask(data: { key: string; title: string; description: string; instructions?: string; ctaUrl?: string; ctaLabel?: string; fields: Task['fields']; points?: number; status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT' }) {
        return real<Task>('/admin/tasks', { method: 'POST', body: JSON.stringify(data) });
    },

    async updateTask(id: string, data: Partial<{ title: string; description: string; instructions: string; ctaUrl: string; ctaLabel: string; fields: Task['fields']; points: number; status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT'; sortOrder: number }>) {
        return real<Task>(`/admin/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },

    async deleteTask(id: string) {
        return real<{ ok: boolean }>(`/admin/tasks/${id}`, { method: 'DELETE' });
    },

    // ── Admin ──────────────────────────────────────────────────────────────
    async getAllAmbassadors() {
        if (USE_MOCK) return MockAPI.getAllAmbassadors();
        return real<User[]>('/admin/ambassadors');
    },

    async addExternalReferrals(ambassadorId: string, count: number, _adminId: string) {
        if (USE_MOCK) return MockAPI.addExternalReferrals(ambassadorId, count, _adminId);
        return real<void>('/admin/external-referrals', {
            method: 'POST',
            body: JSON.stringify({ ambassadorId, count }),
        });
    },

    async revokeAllAmbassadors() {
        if (USE_MOCK) return { ok: true, count: 0 };
        return real<{ ok: boolean; count: number }>('/admin/ambassadors/revoke-all', {
            method: 'POST',
        });
    },

    async notifyAmbassadors(subject: string, content: string) {
        if (USE_MOCK) return { ok: true, count: 5 };
        return real<{ ok: boolean; count: number }>('/admin/notify-ambassadors', {
            method: 'POST',
            body: JSON.stringify({ subject, content }),
        });
    },

    async verifyGithubStar(username: string): Promise<{ starred: boolean }> {
        if (USE_MOCK) return { starred: Math.random() > 0.5 };
        return real<{ starred: boolean }>(`/admin/verify-github/${username}`);
    },
    async verifyGithubStarBatch(usernames: string[]): Promise<Record<string, boolean>> {
        if (USE_MOCK) {
            const res: Record<string, boolean> = {};
            usernames.forEach(u => res[u] = Math.random() > 0.5);
            return res;
        }
        const res = await real<{ results: Record<string, boolean> }>(`/admin/verify-github-batch?usernames=${usernames.join(',')}`);
        return res.results;
    },

    exportSubmissionsCSV() {
        if (USE_MOCK) return MockAPI.exportSubmissionsCSV();
        const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
        const url = `${API_BASE}/admin/submissions/export?token=${token}`;
        window.open(url, '_blank');
        return '';
    },

    exportAmbassadorsCSV() {
        if (USE_MOCK) return '';
        const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
        const url = `${API_BASE}/admin/ambassadors/export?token=${token}`;
        window.open(url, '_blank');
        return '';
    },

    // ── Profile ──────────────────────────────────────────────────────────────
    async getProfile(): Promise<User> {
        if (USE_MOCK) return {} as User;
        return real<User>('/profile');
    },
    async updateProfile(data: {
        gender?: string; state?: string; city?: string;
        degree?: string; techStack?: string[];
    }): Promise<User> {
        if (USE_MOCK) return {} as User;
        return real<User>('/profile', { method: 'PATCH', body: JSON.stringify(data) });
    },
    async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
        if (USE_MOCK) return { avatarUrl: '' };
        const form = new FormData();
        form.append('avatar', file);
        return realForm<{ avatarUrl: string }>('/profile/avatar', form);
    },

    // ── Admin: delete submission ──────────────────────────────────────────────
    async deleteSubmission(id: string): Promise<{ ok: boolean }> {
        if (USE_MOCK) return { ok: true };
        return real<{ ok: boolean }>(`/admin/submissions/${id}`, { method: 'DELETE' });
    },

    // ── Events (public) — no mock support, always hits the real backend ────
    async listEvents(params?: { category?: string; mode?: string; q?: string; from?: string; to?: string; cursor?: string; limit?: number }) {
        if (USE_MOCK) return { events: [], nextCursor: null };
        const qs = new URLSearchParams(Object.entries(params || {}).filter(([, v]) => v).map(([k, v]) => [k, String(v)]) as [string, string][]).toString();
        return real<{ events: EventSummary[]; nextCursor: string | null }>(`/events${qs ? `?${qs}` : ''}`);
    },

    async getEvent(slug: string) {
        if (USE_MOCK) throw new Error('Events require the real backend (set VITE_USE_MOCK=false)');
        return real<EventDetail>(`/events/${slug}`);
    },

    async getEventTicketTypes(slug: string) {
        if (USE_MOCK) return [];
        return real<TicketTypeWithAvailability[]>(`/events/${slug}/ticket-types`);
    },

    async registerForEvent(slug: string, data: EventRegistrationInput) {
        if (USE_MOCK) throw new Error('Events require the real backend (set VITE_USE_MOCK=false)');
        return real<EventRegistrationResult>(`/events/${slug}/register`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async verifyEventPayment(slug: string, data: VerifyPaymentInput) {
        if (USE_MOCK) throw new Error('Events require the real backend (set VITE_USE_MOCK=false)');
        return real<{ token: string; ticketUrl: string }>(`/events/${slug}/register/verify`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async getEventTicket(token: string) {
        if (USE_MOCK) throw new Error('Events require the real backend (set VITE_USE_MOCK=false)');
        return real<EventTicket>(`/events/ticket/${token}`);
    },

    async cancelEventTicket(token: string) {
        if (USE_MOCK) throw new Error('Events require the real backend (set VITE_USE_MOCK=false)');
        return real<{ ok: boolean; message: string }>(`/events/ticket/${token}/cancel`, { method: 'POST' });
    },

    async getTicketRounds(token: string) {
        if (USE_MOCK) return [];
        return real<TicketRound[]>(`/events/ticket/${token}/rounds`);
    },

    async applyOrganizer(data: OrganizerApplyInput) {
        if (USE_MOCK) throw new Error('Events require the real backend (set VITE_USE_MOCK=false)');
        return real<{ ok: boolean; message: string; id: string }>('/events/organizers/apply', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // ── Account: my registrations & transactions ────────────────────────────
    async getMyRegistrations() {
        if (USE_MOCK) return [];
        return real<MyRegistration[]>('/profile/registrations');
    },
};

// ── Events types ─────────────────────────────────────────────────────────────
export interface EventSummary {
    id: string; slug: string; title: string; tagline: string | null;
    category: string; mode: string; venueName: string | null; venueAddress: string | null;
    coverImageUrl: string | null; startAt: string; endAt: string; timezone: string;
    registrationDeadline: string | null; capacity: number | null; status: string; isFeatured: boolean;
    organizer: { orgName: string; logoUrl: string | null; orgType: string };
    registrationCount: number;
    startingPriceInPaise: number | null;
}

export interface EventCustomField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
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

export interface EventDetail extends Omit<EventSummary, 'registrationCount' | 'startingPriceInPaise'> {
    description: string;
    organizer: EventSummary['organizer'] & { website: string | null };
    ticketTypes: TicketTypeWithAvailability[];
    customFields: EventCustomField[] | null;
    prizes: EventPrize[] | null;
    faqs: EventFaq[] | null;
    rounds?: { id: string; name: string; order: number; submissionDeadline: string | null }[];
}

export interface TicketTypeWithAvailability {
    id: string; eventId: string; name: string; description: string | null;
    priceInPaise: number; quantity: number | null; quantitySold: number;
    minTeamSize: number; maxTeamSize: number; isActive: boolean;
    available: number | null; onSale: boolean;
}

export interface EventRegistrationInput {
    ticketTypeId: string;
    name: string;
    email: string;
    phone: string;
    teamName?: string;
    teamMembers?: { name: string; email?: string; phone?: string }[];
    answers?: Record<string, unknown>;
    recaptchaToken?: string;
}

export interface FreeRegistrationResult {
    requiresPayment?: false;
    token: string;
    ticketUrl: string;
}

export interface PaidRegistrationResult {
    requiresPayment: true;
    registrationId: string;
    razorpayOrderId: string;
    razorpayKeyId: string;
    amountInPaise: number;
    currency: string;
    name: string;
    email: string;
    phone: string;
    eventTitle: string;
}

export type EventRegistrationResult = FreeRegistrationResult | PaidRegistrationResult;

export interface VerifyPaymentInput {
    registrationId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface EventTicket {
    id: string; token: string; name: string; email: string; phone: string;
    teamName: string | null; status: string; checkedInAt: string | null; createdAt: string;
    teamMembers: { name: string; email: string | null; phone: string | null }[];
    ticketType: { name: string };
    event: {
        title: string; slug: string; startAt: string; endAt: string; mode: string;
        venueName: string | null; venueAddress: string | null; onlineUrl: string | null;
        status: string; organizer: { orgName: string };
    };
}

export interface TicketRound {
    id: string;
    name: string;
    description: string | null;
    submissionDeadline: string | null;
    allowFileUpload: boolean;
    allowLinks: boolean;
    deadlinePassed: boolean;
    submission: { status: 'PENDING' | 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED'; submittedAt: string | null } | null;
}

export interface MyRegistration {
    id: string;
    token: string;
    status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'NO_SHOW' | 'REFUNDED';
    teamName: string | null;
    createdAt: string;
    checkedInAt: string | null;
    event: {
        title: string; slug: string; startAt: string; endAt: string; mode: string;
        venueName: string | null; coverImageUrl: string | null; status: string;
    };
    ticketType: { name: string; priceInPaise: number };
    order: { id: string; amountInPaise: number; status: 'CREATED' | 'PAID' | 'FAILED' | 'REFUNDED'; gatewayPaymentId: string | null; createdAt: string } | null;
}

export interface OrganizerApplyInput {
    orgName: string;
    orgType: 'club' | 'community' | 'external' | 'individual';
    bio?: string;
    website?: string;
    contactEmail: string;
    contactPhone: string;
}

