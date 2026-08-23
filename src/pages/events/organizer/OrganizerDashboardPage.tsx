import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Plus, IndianRupee, Users, Rocket, CalendarDays, ArrowRight, Sparkles } from 'lucide-react';
import OrganizerLayout from '@/components/organizer/OrganizerLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { fetchDashboardStats } from './organizerApi';

const STATUS_COLOR: Record<string, string> = {
    DRAFT: 'bg-secondary text-muted-foreground',
    PUBLISHED: 'bg-emerald-500/20 text-emerald-400',
    CANCELLED: 'bg-destructive/20 text-destructive',
    COMPLETED: 'bg-blue-500/20 text-blue-400',
};

function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function monthLabel(month: string): string {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
    return (
        <div className="rounded-2xl bg-gradient-card border border-border/60 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <p className="text-2xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
        </div>
    );
}

export default function OrganizerDashboardPage() {
    const { user } = useAuth();
    const { data: stats, isLoading } = useQuery({ queryKey: ['organizer-dashboard-stats'], queryFn: fetchDashboardStats });

    const chartData = stats?.monthlyRevenue.map(m => ({ month: monthLabel(m.month), revenue: m.revenueInPaise / 100 })) ?? [];

    return (
        <OrganizerLayout
            title="Dashboard"
            breadcrumb={['Organizer']}
            actions={<Button asChild size="sm"><Link to="/events/organizer/new"><Plus className="w-4 h-4 mr-1" /> New Event</Link></Button>}
        >
            <div className="mb-8">
                <h2 className="text-xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Organizer'}</h2>
                <p className="text-sm text-muted-foreground mt-1">Here's how your events are performing.</p>
            </div>

            {isLoading || !stats ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
                <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard icon={CalendarDays} label="Total Events" value={stats.totalEvents} />
                        <StatCard icon={Rocket} label="Active Events" value={stats.activeEvents} />
                        <StatCard icon={Users} label="Total Registrations" value={stats.totalRegistrations} />
                        <StatCard icon={IndianRupee} label="Total Revenue" value={formatRupees(stats.totalRevenueInPaise)} />
                    </div>

                    <div className="grid lg:grid-cols-5 gap-6 mb-8">
                        <div className="lg:col-span-3 rounded-2xl bg-gradient-card border border-border/60 p-5">
                            <h3 className="font-semibold mb-4">Revenue — Last 6 Months</h3>
                            <div className="h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                                        <CartesianGrid vertical={false} stroke="hsl(0 0% 100% / 0.06)" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(0 0% 60%)', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(0 0% 60%)', fontSize: 12 }} width={40} tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
                                        <Tooltip
                                            cursor={{ fill: 'hsl(0 0% 100% / 0.04)' }}
                                            contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(0 0% 100% / 0.1)', borderRadius: 8, fontSize: 12 }}
                                            labelStyle={{ color: 'hsl(0 0% 90%)' }}
                                            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                                        />
                                        <Bar dataKey="revenue" fill="hsl(345 100% 59%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lg:col-span-2 rounded-2xl bg-gradient-card border border-border/60 p-5 space-y-3">
                            <h3 className="font-semibold mb-1">Quick Actions</h3>
                            <Button asChild variant="outline" className="w-full justify-start"><Link to="/events/organizer/new"><Plus className="w-4 h-4 mr-2" /> Create New Event</Link></Button>
                            <Button asChild variant="outline" className="w-full justify-start"><Link to="/events/organizer/earnings"><IndianRupee className="w-4 h-4 mr-2" /> View Earnings</Link></Button>
                            <Button asChild variant="outline" className="w-full justify-start"><Link to="/events/organizer/events"><CalendarDays className="w-4 h-4 mr-2" /> Manage My Events</Link></Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Recent Events</h3>
                        <Link to="/events/organizer/events" className="text-sm text-primary hover:underline flex items-center gap-1">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {stats.recentEvents.length === 0 ? (
                        <div className="glass-card rounded-md p-8 text-center border border-border/50">
                            <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
                            <Button asChild><Link to="/events/organizer/new"><Plus className="w-4 h-4 mr-1" /> Create Your First Event</Link></Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentEvents.map(event => (
                                <div key={event.id} className="rounded-2xl bg-gradient-card border border-border/60 p-4 flex flex-wrap items-center gap-4 justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                                        <div className="w-14 h-10 rounded-lg bg-secondary/40 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {event.coverImageUrl ? (
                                                <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Sparkles className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <Badge className={STATUS_COLOR[event.status]}>{event.status}</Badge>
                                            </div>
                                            <p className="font-medium text-sm">{event.title}</p>
                                            <p className="text-xs text-muted-foreground">{event.registrationCount} registered</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button asChild size="sm" variant="outline"><Link to={`/events/organizer/${event.id}/edit`}>Edit</Link></Button>
                                        <Button asChild size="sm" variant="outline"><Link to={`/events/organizer/${event.id}/registrations`}>Registrations</Link></Button>
                                        <Button asChild size="sm" variant="ghost"><Link to={`/events/${event.slug}`} target="_blank">Public Page</Link></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </OrganizerLayout>
    );
}
