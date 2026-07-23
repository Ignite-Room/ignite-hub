const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeader() {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function payoutsFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}/admin/payouts${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

export interface OrganizerPayoutSummary {
    organizerId: string;
    orgName: string;
    contactEmail: string;
    payoutConfigured: boolean;
    totalEarnedInPaise: number;
    pendingInPaise: number;
    lastPayoutAt: string | null;
}

export interface PendingOrder {
    id: string;
    eventId: string;
    eventTitle: string;
    amountInPaise: number;
    createdAt: string;
}

export interface AdminPayoutRecord {
    id: string;
    invoiceNumber: string;
    amountInPaise: number;
    method: 'BANK_TRANSFER' | 'UPI';
    status: 'COMPLETED' | 'FAILED';
    referenceNumber: string;
    createdAt: string;
    invoiceEmailSentAt: string | null;
}

export interface BankPayoutDetails {
    method: 'BANK_TRANSFER';
    bankAccountNumber: string | null;
    bankIfsc: string | null;
    bankName: string | null;
    beneficiaryName: string | null;
}

export interface UpiPayoutDetails {
    method: 'UPI';
    upiId: string | null;
    upiPayeeName: string | null;
}

export interface OrganizerPayoutDetail {
    organizerId: string;
    orgName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    payoutDetails: BankPayoutDetails | UpiPayoutDetails | null;
    pendingOrders: PendingOrder[];
    pendingTotalInPaise: number;
    payouts: AdminPayoutRecord[];
}

export async function fetchPayoutOrganizers(): Promise<OrganizerPayoutSummary[]> {
    return payoutsFetch('/organizers');
}

export async function fetchPayoutOrganizerDetail(organizerId: string): Promise<OrganizerPayoutDetail> {
    return payoutsFetch(`/organizers/${organizerId}`);
}

export async function createPayout(data: {
    organizerId: string;
    orderIds: string[];
    amountInPaise: number;
    referenceNumber: string;
    notes?: string;
}): Promise<{ id: string; invoiceNumber: string; invoiceEmailSent: boolean }> {
    return payoutsFetch('/', { method: 'POST', body: JSON.stringify(data) });
}

export async function fetchAllPayouts(): Promise<(AdminPayoutRecord & { orgName: string; organizerId: string })[]> {
    return payoutsFetch('/');
}

export async function resendInvoice(payoutId: string): Promise<{ ok: boolean }> {
    return payoutsFetch(`/${payoutId}/resend-invoice`, { method: 'POST' });
}

export function adminPayoutInvoiceUrl(payoutId: string): string {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return `${API_URL}/admin/payouts/${payoutId}/invoice?token=${token}`;
}
