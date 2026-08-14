import { Badge } from '@/components/ui/badge';
import type { Submission } from '@/lib/mock-api';

interface SubmissionsTableProps {
    submissions: Submission[];
    title?: string;
    showActions?: boolean;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onPreview?: (url: string) => void;
}

const statusConfig = {
    pending: { label: 'Pending', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    verified: { label: 'Verified', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
    rejected: { label: 'Rejected', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SubmissionsTable({
    submissions,
    title = 'Recent Submissions',
    showActions = false,
    onApprove,
    onReject,
    onPreview,
}: SubmissionsTableProps) {
    return (
        <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50">
                <h3 className="font-semibold text-foreground">{title}</h3>
            </div>

            {submissions.length === 0 ? (
                <div className="px-5 py-12 text-center text-muted-foreground text-sm">
                    No submissions yet
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/30">
                                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Details</th>
                                {showActions && (
                                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Screenshot</th>
                                )}
                                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                                {showActions && (
                                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub, i) => {
                                const sc = statusConfig[sub.status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
                                return (
                                    <tr key={sub.id} className={`border-b border-border/20 hover:bg-white/[0.02] transition-colors ${i === submissions.length - 1 ? 'border-b-0' : ''}`}>
                                        <td className="px-5 py-3.5 font-medium text-foreground">{sub.name}</td>
                                        <td className="px-5 py-3.5">
                                            {sub.githubUsername ? (
                                                <a
                                                    href={sub.githubUsername.startsWith('http') ? sub.githubUsername : `https://github.com/${sub.githubUsername}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    {sub.githubUsername.startsWith('http') ? sub.githubUsername.replace(/^https?:\/\/(www\.)?github\.com\//i, '@') : `@${sub.githubUsername}`}
                                                </a>
                                            ) : sub.email ? (
                                                <span className="text-muted-foreground">{sub.email}</span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        {showActions && (
                                            <td className="px-5 py-3.5">
                                                <button
                                                    onClick={() => onPreview?.(sub.screenshotUrl)}
                                                    className="w-12 h-8 rounded overflow-hidden border border-border/50 hover:border-primary/50 transition-colors focus:outline-none"
                                                >
                                                    <img src={sub.screenshotUrl} alt="screenshot" className="w-full h-full object-cover" />
                                                </button>
                                            </td>
                                        )}
                                        <td className="px-5 py-3.5">
                                            <Badge variant="outline" className={`text-xs ${sc.className}`}>
                                                {sc.label}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted-foreground">{formatDate(sub.createdAt)}</td>
                                        {showActions && sub.status === 'pending' && (
                                            <td className="px-5 py-3.5">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => onApprove?.(sub.id)}
                                                        className="px-3 py-1 rounded-lg text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 transition-colors font-medium"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => onReject?.(sub.id)}
                                                        className="px-3 py-1 rounded-lg text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition-colors font-medium"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                        {showActions && sub.status !== 'pending' && (
                                            <td className="px-5 py-3.5 text-muted-foreground text-xs">-</td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
