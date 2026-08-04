import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizerFetch } from './organizerApi';

export type CollaboratorRole = 'MANAGER' | 'VIEWER' | 'CHECKIN';
export type CollaboratorStatus = 'INVITED' | 'ACCEPTED' | 'REMOVED';

export interface Collaborator {
    id: string;
    email: string;
    name: string | null;
    role: CollaboratorRole;
    status: CollaboratorStatus;
    createdAt: string;
}

export function useCollaborators(eventId: string) {
    return useQuery({
        queryKey: ['collaborators', eventId],
        queryFn: () => organizerFetch<Collaborator[]>(`/${eventId}/collaborators`),
        enabled: !!eventId,
    });
}

export function useInviteCollaborator(eventId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { email: string; name?: string; role: CollaboratorRole }) =>
            organizerFetch<Collaborator>(`/${eventId}/collaborators`, { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['collaborators', eventId] }),
    });
}

export function useRemoveCollaborator(eventId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (collaboratorId: string) =>
            organizerFetch(`/${eventId}/collaborators/${collaboratorId}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['collaborators', eventId] }),
    });
}
