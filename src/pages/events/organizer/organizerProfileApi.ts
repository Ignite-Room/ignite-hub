import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeader() {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function profileFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}/organizer/profile${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
    }
    return res.json();
}

export interface OrganizerProfile {
    id: string;
    orgName: string;
    orgType: string;
    bio: string | null;
    logoUrl: string | null;
    website: string | null;
    contactEmail: string;
    contactPhone: string;
    status: string;
    createdAt: string;
}

export function useOrganizerProfile() {
    return useQuery({
        queryKey: ['organizer-profile'],
        queryFn: () => profileFetch<OrganizerProfile>('/'),
    });
}

export function useUpdateOrganizerProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Pick<OrganizerProfile, 'orgName' | 'orgType' | 'bio' | 'website' | 'contactEmail' | 'contactPhone'>>) =>
            profileFetch<OrganizerProfile>('/', { method: 'PATCH', body: JSON.stringify(data) }),
        onSuccess: (updated) => qc.setQueryData(['organizer-profile'], updated),
    });
}

export function useUploadOrganizerLogo() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('logo', file);
            const res = await fetch(`${API_URL}/organizer/profile/logo`, {
                method: 'POST',
                headers: { ...authHeader() },
                body: formData,
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || `HTTP ${res.status}`);
            }
            return res.json() as Promise<{ logoUrl: string }>;
        },
        onSuccess: ({ logoUrl }) => {
            qc.setQueryData<OrganizerProfile | undefined>(['organizer-profile'], prev => prev ? { ...prev, logoUrl } : prev);
        },
    });
}
