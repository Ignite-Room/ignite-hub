import { MockAPI } from './mock-api';
import type { User } from './auth-context';
import type { Submission, LeaderboardEntry } from './mock-api';

// ── Configuration ─────────────────────────────────────────────────────────
// VITE_USE_MOCK=true → use localStorage mock (development)
// VITE_USE_MOCK=false → use real Express backend (production)
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

if (USE_MOCK) MockAPI.init();

// ── Auth token helper ─────────────────────────────────────────────────────
function authHeader(): Record<string, string> {
    // Check both storages: localStorage for "Remember Me" sessions, sessionStorage for regular sessions
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
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
        throw new Error(err.message || `HTTP ${res.status}`);
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
    async login(email: string, password: string) {
        if (USE_MOCK) return MockAPI.login(email, password);
        return real<{ token: string; user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    async signup(data: { name: string; email: string; phone: string; password: string }) {
        if (USE_MOCK) return MockAPI.signup(data);
        return real<{ token: string; user: User }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
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

    // ── Task Submissions ────────────────────────────────────────────────────
    async submitTask(data: {
        ambassadorCode: string;
        name: string;
        phone: string;
        githubUsername: string;
        screenshotFile: File;
        recaptchaToken?: string;
    }) {
        if (USE_MOCK) return MockAPI.submitTask(data);

        const form = new FormData();
        form.append('ambassadorCode', data.ambassadorCode);
        form.append('name', data.name);
        form.append('phone', data.phone);
        form.append('githubUsername', data.githubUsername);
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

    exportSubmissionsCSV() {
        if (USE_MOCK) return MockAPI.exportSubmissionsCSV();
        // Real backend streams CSV — open in new tab for download
        const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
        const url = `${API_BASE}/admin/submissions/export`;
        const a = document.createElement('a');
        a.href = url;
        // The Authorization header can't be sent via anchor tag — use query param
        // Backend needs to support ?token=xxx for CSV download
        a.href = `${url}?token=${token}`;
        a.click();
        return ''; // void-like
    },
};
