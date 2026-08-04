import { useMutation } from '@tanstack/react-query';
import { organizerFetch } from './organizerApi';

export interface EvaluatorStat {
    evaluatorId: string;
    name: string;
    mean: number;
    stddev: number;
    scores: { submissionId: string; percent: number }[];
}

export interface NormalizationReviewRow {
    submissionId: string;
    name: string;
    teamName: string | null;
    rawScore: number;
    rawPercent: number;
    normalizedScore: number | null;
    note: string;
}

export interface NormalizationResult {
    evaluatorStats: EvaluatorStat[];
    review: NormalizationReviewRow[];
    overallBiasNote: string;
}

export function useNormalizeScores(eventId: string, roundId: string) {
    return useMutation({
        mutationFn: () => organizerFetch<NormalizationResult>(`/${eventId}/rounds/${roundId}/normalize`, { method: 'POST' }),
    });
}

export function useApplyNormalization(eventId: string, roundId: string) {
    return useMutation({
        mutationFn: (data: { cutoffScore: number; action: 'shortlist_above' | 'reject_below' }) =>
            organizerFetch<{ affected: number; total: number }>(`/${eventId}/rounds/${roundId}/normalize/apply`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    });
}
