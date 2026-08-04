import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizerFetch } from './organizerApi';

export type RecipientFilter = 'ALL' | 'CONFIRMED' | 'CHECKED_IN' | 'ROUND_SHORTLISTED';

export interface Announcement {
    id: string;
    subject: string;
    body: string;
    recipientFilter: RecipientFilter;
    recipientCount: number;
    createdAt: string;
    round: { name: string } | null;
}

export function useAnnouncements(eventId: string) {
    return useQuery({
        queryKey: ['announcements', eventId],
        queryFn: () => organizerFetch<Announcement[]>(`/${eventId}/announcements`),
        enabled: !!eventId,
    });
}

export function useSendAnnouncement(eventId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { subject: string; body: string; recipientFilter: RecipientFilter; roundId?: string }) =>
            organizerFetch<{ sent: number; total: number }>(`/${eventId}/announce`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements', eventId] }),
    });
}
