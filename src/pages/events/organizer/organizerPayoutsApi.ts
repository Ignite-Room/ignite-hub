const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeader() {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// These endpoints live under /organizer directly (not /organizer/events like organizerFetch), so
// they use their own small fetch wrapper rather than organizerApi.ts's organizerFetch.
async function organizerRootFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}/organizer${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

export interface PayoutDetails {
    payoutMethod: 'BANK_TRANSFER' | 'UPI' | null;
    bankAccountNumberMasked: string | null;
    bankIfsc: string | null;
    bankName: string | null;
    beneficiaryName: string | null;
    upiIdMasked: string | null;
    upiPayeeName: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    updatedAt: string | null;
}

export interface BankPayoutInput {
    method: 'BANK_TRANSFER';
    bankAccountNumber: string;
    bankIfsc: string;
    bankName: string;
    beneficiaryName: string;
    contactPhone: string;
    contactEmail: string;
}

export interface UpiPayoutInput {
    method: 'UPI';
    upiId: string;
    upiPayeeName: string;
    contactPhone: string;
    contactEmail: string;
}

export type PayoutDetailsInput = BankPayoutInput | UpiPayoutInput;

export interface EarningsEventBreakdown {
    eventId: string;
    eventTitle: string;
    totalInPaise: number;
    pendingInPaise: number;
}

export interface Earnings {
    totalEarnedInPaise: number;
    paidOutInPaise: number;
    pendingInPaise: number;
    events: EarningsEventBreakdown[];
}

export interface OrganizerPayout {
    id: string;
    invoiceNumber: string;
    amountInPaise: number;
    method: 'BANK_TRANSFER' | 'UPI';
    status: 'COMPLETED' | 'FAILED';
    referenceNumber: string;
    createdAt: string;
    eventTitles: string[];
}

export async function fetchPayoutDetails(): Promise<PayoutDetails> {
    return organizerRootFetch('/payout-details');
}

export async function savePayoutDetails(data: PayoutDetailsInput): Promise<{ ok: boolean }> {
    return organizerRootFetch('/payout-details', { method: 'PUT', body: JSON.stringify(data) });
}

export async function fetchEarnings(): Promise<Earnings> {
    return organizerRootFetch('/earnings');
}

export async function fetchOrganizerPayouts(): Promise<OrganizerPayout[]> {
    return organizerRootFetch('/payouts');
}

export function organizerPayoutInvoiceUrl(payoutId: string): string {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return `${API_URL}/organizer/payouts/${payoutId}/invoice?token=${token}`;
}
