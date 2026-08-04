import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizerFetch } from './organizerApi';

export interface Evaluator {
    id: string;
    eventId: string;
    roundId: string;
    name: string;
    email: string;
    accessToken: string;
    accessCode: string;
    isActive: boolean;
    createdAt: string;
    assignedCount: number;
    scoredCount: number;
    completionPercent: number;
}

export interface EvaluatorProgress {
    perEvaluator: {
        evaluatorId: string;
        name: string;
        totalAssigned: number;
        totalScored: number;
        totalPending: number;
        completionPercent: number;
        averageScore: number | null;
    }[];
    totalAssigned: number;
    totalScored: number;
}

const key = (eventId: string, roundId: string) => ['evaluators', eventId, roundId];

export function useEvaluators(eventId: string, roundId: string) {
    return useQuery({
        queryKey: key(eventId, roundId),
        queryFn: () => organizerFetch<Evaluator[]>(`/${eventId}/rounds/${roundId}/evaluators`),
        enabled: !!eventId && !!roundId,
    });
}

export function useEvaluatorProgress(eventId: string, roundId: string) {
    return useQuery({
        queryKey: [...key(eventId, roundId), 'progress'],
        queryFn: () => organizerFetch<EvaluatorProgress>(`/${eventId}/rounds/${roundId}/evaluator-progress`),
        enabled: !!eventId && !!roundId,
        refetchInterval: 15000,
    });
}

export function useAddEvaluators(eventId: string, roundId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (evaluators: { name: string; email: string }[]) =>
            organizerFetch<Evaluator[]>(`/${eventId}/rounds/${roundId}/evaluators`, {
                method: 'POST',
                body: JSON.stringify({ evaluators }),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: key(eventId, roundId) }),
    });
}

export function useRemoveEvaluator(eventId: string, roundId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (evaluatorId: string) =>
            organizerFetch(`/${eventId}/rounds/${roundId}/evaluators/${evaluatorId}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: key(eventId, roundId) }),
    });
}

export function useAutoAssign(eventId: string, roundId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () =>
            organizerFetch<{ assigned: number; totalEvaluators: number }>(`/${eventId}/rounds/${roundId}/evaluators/assign`, {
                method: 'POST',
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: key(eventId, roundId) }),
    });
}

export function useReassignSubmissions(eventId: string, roundId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ evaluatorId, submissionIds, targetEvaluatorId }: { evaluatorId: string; submissionIds: string[]; targetEvaluatorId: string }) =>
            organizerFetch(`/${eventId}/rounds/${roundId}/evaluators/${evaluatorId}/reassign`, {
                method: 'POST',
                body: JSON.stringify({ submissionIds, targetEvaluatorId }),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: key(eventId, roundId) }),
    });
}

export function evaluatorPortalUrl(accessToken: string): string {
    return `https://igniteroom.in/evaluate?token=${accessToken}`;
}
