/**
 * Mock API – fully functional localStorage-based backend simulation.
 * Replace with real API calls by switching USE_MOCK=false in api.ts
 */

import { User } from './auth-context';

// ── Types ──────────────────────────────────────────────────────────────────
export type TaskKey = 'GITHUB_STAR' | 'CODEKITCHEN_SIGNUP' | 'ANAKIN_STAR';

export interface Submission {
    id: string;
    ambassadorId: string;
    ambassadorName: string;
    taskKey: TaskKey;
    name: string;
    email?: string;
    phone?: string;
    githubUsername?: string;
    screenshotUrl: string;
    status: 'pending' | 'verified' | 'rejected';
    verifiedBy?: string;
    createdAt: string;
}

export interface LeaderboardEntry {
    rank: number;
    ambassadorId: string;
    ambassadorName: string;
    avatarUrl?: string | null;
    email: string;
    verifiedTasks: number;
    externalReferrals: number;
    totalScore: number;
}

export interface ReferralVisit {
    id: string;
    ambassadorId: string;
    visitedAt: string;
}

export interface DailyReferral {
    date: string;
    count: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateReferralCode(name: string): string {
    const base = name.toLowerCase().replace(/\s+/g, '').slice(0, 8);
    const suffix = Math.floor(Math.random() * 1000);
    return `${base}${suffix}`;
}

function generateToken(userId: string): string {
    // Simple mock token (not real JWT)
    return btoa(JSON.stringify({ userId, exp: Date.now() + 86400000 }));
}

function parseToken(token: string): { userId: string } | null {
    try {
        return JSON.parse(atob(token));
    } catch {
        return null;
    }
}

function hashPassword(password: string): string {
    // Simple mock hash (not real bcrypt – backend uses bcrypt)
    let h = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        h = ((h << 5) - h) + char;
        h = h & h;
    }
    return 'mock_' + Math.abs(h).toString(16);
}

function getStore<T>(key: string, fallback: T): T {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
}

function setStore<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
}

// ── Seed Data ──────────────────────────────────────────────────────────────
function seedData() {
    const users = getStore<User[]>('mock_users', []);
    if (users.length > 0) return; // already seeded

    const adminUser: User & { passwordHash: string } = {
        id: 'admin-001',
        name: 'Ignite Admin',
        email: 'admin@ignitehub.com',
        phone: '0000000000',
        referralCode: 'admin',
        role: 'admin',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        passwordHash: hashPassword('admin123'),
    };

    const ambassadors = [
        { name: 'Satyam Sharma', email: 'satyam@example.com', phone: '9876543210', referralCode: 'satyam123' },
        { name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', referralCode: 'priya456' },
        { name: 'Arjun Singh', email: 'arjun@example.com', phone: '9876543212', referralCode: 'arjun789' },
        { name: 'Neha Kumar', email: 'neha@example.com', phone: '9876543213', referralCode: 'neha321' },
        { name: 'Rahul Verma', email: 'rahul@example.com', phone: '9876543214', referralCode: 'rahul654' },
    ].map((a, i) => ({
        id: `amb-00${i + 1}`,
        ...a,
        role: 'ambassador' as const,
        createdAt: new Date(Date.now() - (20 - i * 3) * 86400000).toISOString(),
        passwordHash: hashPassword('password123'),
    }));

    setStore('mock_users', [adminUser, ...ambassadors]);

    // Seed submissions
    const statuses: Submission['status'][] = ['verified', 'verified', 'pending', 'rejected', 'pending'];
    const githubNames = ['john-dev', 'priya-codes', 'arjun42', 'neha-hub', 'rahulv'];
    const submissions: Submission[] = ambassadors.map((a, i) => ({
        id: `sub-00${i + 1}`,
        ambassadorId: ambassadors[0].id, // all from first ambassador for demo dashboard
        ambassadorName: ambassadors[0].name,
        taskKey: 'GITHUB_STAR',
        name: a.name,
        phone: a.phone,
        githubUsername: githubNames[i],
        screenshotUrl: `https://picsum.photos/800/500?random=${i + 1}`,
        status: statuses[i],
        verifiedBy: statuses[i] === 'verified' ? 'admin-001' : undefined,
        createdAt: new Date(Date.now() - (10 - i * 2) * 86400000).toISOString(),
    }));
    setStore('mock_submissions', submissions);

    // Seed leaderboard
    const leaderboard: LeaderboardEntry[] = ambassadors.map((a, i) => ({
        rank: i + 1,
        ambassadorId: a.id,
        ambassadorName: a.name,
        email: a.email,
        verifiedTasks: [12, 9, 7, 5, 3][i],
        externalReferrals: [8, 15, 4, 10, 2][i],
        totalScore: [20, 24, 11, 15, 5][i],
    })).sort((a, b) => b.totalScore - a.totalScore)
        .map((e, i) => ({ ...e, rank: i + 1 }));
    setStore('mock_leaderboard', leaderboard);

    // Seed referral visits (last 30 days)
    const visits: ReferralVisit[] = [];
    for (let d = 29; d >= 0; d--) {
        const count = Math.floor(Math.random() * 8);
        for (let j = 0; j < count; j++) {
            visits.push({
                id: generateId(),
                ambassadorId: ambassadors[0].id,
                visitedAt: new Date(Date.now() - d * 86400000 - j * 3600000).toISOString(),
            });
        }
    }
    setStore('mock_visits', visits);
}

// ── Mock API Implementation ────────────────────────────────────────────────
export const MockAPI = {
    init() {
        seedData();
    },

    async login(email: string, password: string): Promise<{ token: string; user: User }> {
        await delay(400);
        const users = getStore<(User & { passwordHash: string })[]>('mock_users', []);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) throw new Error('No account found with that email.');
        if (user.passwordHash !== hashPassword(password)) throw new Error('Incorrect password.');
        const token = generateToken(user.id);
        const { passwordHash: _, ...safeUser } = user;
        return { token, user: safeUser as User };
    },

    async signup(data: { name: string; email: string; phone: string; password: string }): Promise<{ token: string; user: User }> {
        await delay(500);
        const users = getStore<(User & { passwordHash: string })[]>('mock_users', []);
        if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
            throw new Error('An account with this email already exists.');
        }
        if (users.find(u => u.phone === data.phone)) {
            throw new Error('An account with this phone number already exists.');
        }
        const newUser = {
            id: generateId(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            referralCode: generateReferralCode(data.name),
            role: 'ambassador' as const,
            createdAt: new Date().toISOString(),
            passwordHash: hashPassword(data.password),
        };
        users.push(newUser);
        setStore('mock_users', users);

        // Create leaderboard entry
        const lb = getStore<LeaderboardEntry[]>('mock_leaderboard', []);
        lb.push({
            rank: lb.length + 1,
            ambassadorId: newUser.id,
            ambassadorName: newUser.name,
            email: newUser.email,
            verifiedTasks: 0,
            externalReferrals: 0,
            totalScore: 0,
        });
        setStore('mock_leaderboard', lb);

        const token = generateToken(newUser.id);
        const { passwordHash: _, ...safeUser } = newUser;
        return { token, user: safeUser as User };
    },

    async getMe(token: string): Promise<User> {
        const parsed = parseToken(token);
        if (!parsed) throw new Error('Invalid token');
        const users = getStore<(User & { passwordHash: string })[]>('mock_users', []);
        const user = users.find(u => u.id === parsed.userId);
        if (!user) throw new Error('User not found');
        const { passwordHash: _, ...safeUser } = user;
        return safeUser as User;
    },

    async getAmbassadorByCode(code: string): Promise<User | null> {
        await delay(200);
        const users = getStore<User[]>('mock_users', []);
        return users.find(u => u.referralCode === code) || null;
    },

    async logReferralVisit(ambassadorId: string): Promise<void> {
        await delay(100);
        const visits = getStore<ReferralVisit[]>('mock_visits', []);
        visits.push({ id: generateId(), ambassadorId, visitedAt: new Date().toISOString() });
        setStore('mock_visits', visits);
    },

    async getDailyReferrals(ambassadorId: string): Promise<DailyReferral[]> {
        await delay(200);
        const visits = getStore<ReferralVisit[]>('mock_visits', []);
        const myVisits = visits.filter(v => v.ambassadorId === ambassadorId);
        const map: Record<string, number> = {};
        const days = 30;
        for (let d = days - 1; d >= 0; d--) {
            const date = new Date(Date.now() - d * 86400000);
            const key = date.toISOString().slice(0, 10);
            map[key] = 0;
        }
        for (const v of myVisits) {
            const key = v.visitedAt.slice(0, 10);
            if (key in map) map[key]++;
        }
        return Object.entries(map).map(([date, count]) => ({ date, count }));
    },

    async submitTask(data: {
        ambassadorCode: string;
        taskKey: TaskKey;
        name: string;
        email?: string;
        phone?: string;
        githubUsername?: string;
        screenshotFile: File;
    }): Promise<{ id: string }> {
        await delay(800);
        const users = getStore<User[]>('mock_users', []);
        const ambassador = users.find(u => u.referralCode === data.ambassadorCode);
        if (!ambassador) throw new Error('Invalid referral code.');

        // Anti-cheat: self-referral
        if (data.phone && ambassador.phone === data.phone) {
            throw new Error('Ambassadors cannot submit using their own referral link.');
        }
        if (data.email && ambassador.email.toLowerCase() === data.email.toLowerCase()) {
            throw new Error('Ambassadors cannot submit using their own referral link.');
        }

        // Anti-cheat: dedup, scoped to this task
        const submissions = getStore<Submission[]>('mock_submissions', []);
        const sameTask = (s: Submission) => s.taskKey === data.taskKey && s.status !== 'rejected';
        if (data.phone && submissions.find(s => sameTask(s) && s.phone === data.phone)) {
            throw new Error('A submission with this phone number already exists for this task.');
        }
        if (data.email && submissions.find(s => sameTask(s) && s.email?.toLowerCase() === data.email!.toLowerCase())) {
            throw new Error('A submission with this email already exists for this task.');
        }
        if (data.githubUsername && submissions.find(s => sameTask(s) && s.githubUsername?.toLowerCase() === data.githubUsername!.toLowerCase())) {
            throw new Error('This GitHub account has already been submitted for this task.');
        }

        // Mock screenshot URL (use object URL for preview)
        const screenshotUrl = URL.createObjectURL(data.screenshotFile);

        const sub: Submission = {
            id: generateId(),
            ambassadorId: ambassador.id,
            ambassadorName: ambassador.name,
            taskKey: data.taskKey,
            name: data.name,
            email: data.email,
            phone: data.phone,
            githubUsername: data.githubUsername,
            screenshotUrl,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        submissions.push(sub);
        setStore('mock_submissions', submissions);
        return { id: sub.id };
    },

    async getMySubmissions(ambassadorId: string): Promise<Submission[]> {
        await delay(200);
        const submissions = getStore<Submission[]>('mock_submissions', []);
        return submissions.filter(s => s.ambassadorId === ambassadorId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async getAllSubmissions(): Promise<Submission[]> {
        await delay(200);
        return getStore<Submission[]>('mock_submissions', [])
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async updateSubmissionStatus(id: string, status: 'verified' | 'rejected', adminId: string): Promise<void> {
        await delay(300);
        const submissions = getStore<Submission[]>('mock_submissions', []);
        const idx = submissions.findIndex(s => s.id === id);
        if (idx === -1) throw new Error('Submission not found');
        submissions[idx].status = status;
        submissions[idx].verifiedBy = adminId;
        setStore('mock_submissions', submissions);

        // Update leaderboard if verified
        if (status === 'verified') {
            const ambassadorId = submissions[idx].ambassadorId;
            const lb = getStore<LeaderboardEntry[]>('mock_leaderboard', []);
            const lbIdx = lb.findIndex(e => e.ambassadorId === ambassadorId);
            if (lbIdx !== -1) {
                lb[lbIdx].verifiedTasks++;
                lb[lbIdx].totalScore = lb[lbIdx].verifiedTasks + lb[lbIdx].externalReferrals;
            }
            // Sort and re-rank
            lb.sort((a, b) => b.totalScore - a.totalScore);
            lb.forEach((e, i) => { e.rank = i + 1; });
            setStore('mock_leaderboard', lb);
        }
    },

    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        await delay(200);
        return getStore<LeaderboardEntry[]>('mock_leaderboard', []);
    },

    async getAllAmbassadors(): Promise<User[]> {
        await delay(200);
        const users = getStore<(User & { passwordHash?: string })[]>('mock_users', []);
        return users
            .filter(u => u.role === 'ambassador')
            .map(({ passwordHash: _, ...u }) => u as User);
    },

    async addExternalReferrals(ambassadorId: string, count: number, adminId: string): Promise<void> {
        await delay(300);
        const lb = getStore<LeaderboardEntry[]>('mock_leaderboard', []);
        const idx = lb.findIndex(e => e.ambassadorId === ambassadorId);
        if (idx === -1) throw new Error('Ambassador not found in leaderboard');
        lb[idx].externalReferrals += count;
        lb[idx].totalScore = lb[idx].verifiedTasks + lb[idx].externalReferrals;
        lb.sort((a, b) => b.totalScore - a.totalScore);
        lb.forEach((e, i) => { e.rank = i + 1; });
        setStore('mock_leaderboard', lb);

        // Log external referral
        const ext = getStore<{ id: string; ambassadorId: string; count: number; addedBy: string; source: string; createdAt: string }[]>('mock_ext_referrals', []);
        ext.push({ id: generateId(), ambassadorId, count, addedBy: adminId, source: 'unstop', createdAt: new Date().toISOString() });
        setStore('mock_ext_referrals', ext);
    },

    async getMyStats(ambassadorId: string): Promise<{
        totalReferrals: number;
        verifiedTasks: number;
        externalReferrals: number;
        rank: number;
    }> {
        await delay(200);
        const visits = getStore<ReferralVisit[]>('mock_visits', []);
        const lb = getStore<LeaderboardEntry[]>('mock_leaderboard', []);
        const lbEntry = lb.find(e => e.ambassadorId === ambassadorId);
        return {
            totalReferrals: visits.filter(v => v.ambassadorId === ambassadorId).length,
            verifiedTasks: lbEntry?.verifiedTasks ?? 0,
            externalReferrals: lbEntry?.externalReferrals ?? 0,
            rank: lbEntry?.rank ?? 0,
        };
    },

    exportSubmissionsCSV(): string {
        const subs = getStore<Submission[]>('mock_submissions', []);
        const header = 'ID,Ambassador,Name,Phone,GitHub,Status,Date';
        const rows = subs.map(s =>
            `${s.id},${s.ambassadorName},${s.name},${s.phone},${s.githubUsername},${s.status},${s.createdAt}`
        );
        return [header, ...rows].join('\n');
    },
};

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
