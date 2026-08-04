import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'ignite_evaluator_token';

export function getStoredEvaluatorToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
}
export function storeEvaluatorToken(token: string) {
    sessionStorage.setItem(TOKEN_KEY, token);
}
export function clearEvaluatorToken() {
    sessionStorage.removeItem(TOKEN_KEY);
}

async function evaluatorFetch<T>(path: string, opts: { token?: string; code?: string; method?: string; body?: unknown } = {}): Promise<T> {
    const params = new URLSearchParams();
    if (opts.code) params.set('code', opts.code);
    const qs = params.toString();
    const res = await fetch(`${API_URL}/evaluate${path}${qs ? `?${qs}` : ''}`, {
        method: opts.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(opts.token ? { 'x-evaluator-token': opts.token } : {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
    }
    return res.json();
}

export interface EvaluatorCriterion {
    id: string;
    name: string;
    maxPoints: number;
    order: number;
}

export interface VerifyResponse {
    evaluatorId: string;
    name: string;
    accessToken: string;
    eventTitle: string;
    roundName: string;
    criteria: EvaluatorCriterion[];
}

export interface EvaluatorSubmission {
    id: string;
    repoUrl: string | null;
    liveUrl: string | null;
    fileUrl: string | null;
    notes: string | null;
    registration: { name: string; email: string; teamName: string | null };
    scores: { id: string; criterionId: string; points: number }[];
}

export interface EvaluatorAssignment {
    id: string;
    isComplete: boolean;
    submission: EvaluatorSubmission;
}

export function verifyEvaluator(params: { token?: string; code?: string }) {
    return evaluatorFetch<VerifyResponse>('/verify', params);
}

export function useEvaluatorSubmissions(token: string | null) {
    return useQuery({
        queryKey: ['evaluator-submissions', token],
        queryFn: () => evaluatorFetch<{ criteria: EvaluatorCriterion[]; assignments: EvaluatorAssignment[] }>('/submissions', { token: token! }),
        enabled: !!token,
    });
}

export function useEvaluatorProgress(token: string | null) {
    return useQuery({
        queryKey: ['evaluator-self-progress', token],
        queryFn: () => evaluatorFetch<{ total: number; completed: number; pending: number }>('/progress', { token: token! }),
        enabled: !!token,
        refetchInterval: 10000,
    });
}

export function useSaveScores(token: string | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ assignmentId, scores }: { assignmentId: string; scores: { criterionId: string; points: number }[] }) =>
            evaluatorFetch<EvaluatorAssignment>(`/submissions/${assignmentId}/scores`, {
                token: token!,
                method: 'PUT',
                body: { scores },
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['evaluator-submissions', token] });
            qc.invalidateQueries({ queryKey: ['evaluator-self-progress', token] });
        },
    });
}
