import { useEffect, useState } from 'react';
import { ArrowUpRight, Github, ListChecks, Loader2, Trophy } from 'lucide-react';
import RevealOnScroll from '@/components/design-system/RevealOnScroll';
import { api, type Task } from '@/lib/api';

/** Read-only board of currently active ambassador tasks — used on the public
 * Ambassador landing page and the Ambassador dashboard to show what's live right
 * now. The actual submission form lives on the referral landing page (/ref/:code),
 * since tasks are completed by the person an ambassador refers, not the ambassador. */
export default function TaskBoard({ className = '' }: { className?: string }) {
    const [tasks, setTasks] = useState<Task[] | null>(null);

    useEffect(() => {
        api.getTasks().then(setTasks).catch(() => setTasks([]));
    }, []);

    if (tasks === null) {
        return (
            <div className={`flex justify-center py-10 ${className}`}>
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className={`glow-card p-8 text-center ${className}`}>
                <p className="text-muted-foreground text-sm">No tasks are live right now — check back soon.</p>
            </div>
        );
    }

    return (
        <div className={`grid sm:grid-cols-2 gap-5 ${className}`}>
            {tasks.map((task, index) => (
                <RevealOnScroll key={task.id} delay={index * 0.08}>
                    <div className="glow-card p-6 h-full flex flex-col">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {task.fields.github ? <Github className="w-5 h-5 text-primary" /> : <ListChecks className="w-5 h-5 text-primary" />}
                            </div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary flex-shrink-0">
                                <Trophy className="w-3.5 h-3.5" /> {task.points} pt{task.points === 1 ? '' : 's'}
                            </span>
                        </div>
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{task.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{task.description}</p>
                        {task.ctaUrl && (
                            <a
                                href={task.ctaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-4"
                            >
                                {task.ctaLabel || 'View task'} <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </RevealOnScroll>
            ))}
        </div>
    );
}
