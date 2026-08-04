import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis } from 'recharts';
import { Users, CheckCircle2, QrCode } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventPanelTabs from '@/components/organizer/EventPanelTabs';
import { organizerFetch } from './organizerApi';

const CATEGORICAL = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9'];

interface AnalyticsData {
    funnel: { registrations: number; confirmed: number; checkedIn: number };
    ticketRevenue: { ticketTypeName: string; revenueInPaise: number }[];
    dailyRegistrations: { date: string; count: number }[];
    demographics: { colleges: { label: string; count: number }[] | null; cities: { label: string; count: number }[] | null };
}

function formatRupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function FunnelStep({ icon: Icon, label, value, max }: { icon: typeof Users; label: string; value: number; max: number }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm text-muted-foreground">{value} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
            </div>
        </div>
    );
}

function DemographicList({ title, items }: { title: string; items: { label: string; count: number }[] }) {
    const max = Math.max(...items.map(i => i.count), 1);
    return (
        <div className="rounded-2xl bg-gradient-card border border-border/60 p-5">
            <h3 className="font-semibold mb-4">{title}</h3>
            <div className="space-y-2.5">
                {items.map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                        <span className="text-sm w-28 truncate flex-shrink-0">{item.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${(item.count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right flex-shrink-0">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useQuery({
        queryKey: ['event-analytics', id],
        queryFn: () => organizerFetch<AnalyticsData>(`/${id}/analytics`),
        enabled: !!id,
    });

    if (!id) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
                <EventPanelTabs eventId={id} active="analytics" />

                <h1 className="text-2xl font-bold mb-1">Analytics</h1>
                <p className="text-sm text-muted-foreground mb-6">Registration funnel, revenue, and demographics for this event.</p>

                {isLoading || !data ? (
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-gradient-card border border-border/60 p-5">
                            <h3 className="font-semibold mb-4">Registration Funnel</h3>
                            <div className="space-y-4">
                                <FunnelStep icon={Users} label="Registrations" value={data.funnel.registrations} max={data.funnel.registrations} />
                                <FunnelStep icon={CheckCircle2} label="Confirmed" value={data.funnel.confirmed} max={data.funnel.registrations} />
                                <FunnelStep icon={QrCode} label="Checked In" value={data.funnel.checkedIn} max={data.funnel.registrations} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">Page-view tracking isn't wired up yet, so the funnel starts at Registrations.</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="rounded-2xl bg-gradient-card border border-border/60 p-5">
                                <h3 className="font-semibold mb-4">Daily Registrations</h3>
                                {data.dailyRegistrations.length > 1 ? (
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data.dailyRegistrations} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="dailyRegGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="hsl(345 100% 59%)" stopOpacity={0.35} />
                                                        <stop offset="100%" stopColor="hsl(345 100% 59%)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(0 0% 60%)', fontSize: 11 }}
                                                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                                                <Tooltip
                                                    contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(0 0% 100% / 0.1)', borderRadius: 8, fontSize: 12 }}
                                                    labelFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    formatter={(value: number) => [value, 'Registrations']}
                                                />
                                                <Area type="monotone" dataKey="count" stroke="hsl(345 100% 59%)" strokeWidth={2} fill="url(#dailyRegGradient)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground py-8 text-center">Not enough data yet.</p>
                                )}
                            </div>

                            <div className="rounded-2xl bg-gradient-card border border-border/60 p-5">
                                <h3 className="font-semibold mb-4">Revenue by Ticket Type</h3>
                                {data.ticketRevenue.length > 0 ? (
                                    <div className="h-[200px] flex items-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={data.ticketRevenue} dataKey="revenueInPaise" nameKey="ticketTypeName" innerRadius={45} outerRadius={75} paddingAngle={2}>
                                                    {data.ticketRevenue.map((entry, i) => (
                                                        <Cell key={entry.ticketTypeName} fill={CATEGORICAL[i % CATEGORICAL.length]} stroke="hsl(0 0% 8%)" strokeWidth={2} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ background: 'hsl(0 0% 8%)', border: '1px solid hsl(0 0% 100% / 0.1)', borderRadius: 8, fontSize: 12 }}
                                                    formatter={(value: number, name: string) => [formatRupees(value), name]}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground py-8 text-center">No paid revenue yet.</p>
                                )}
                                {data.ticketRevenue.length > 0 && (
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
                                        {data.ticketRevenue.map((t, i) => (
                                            <span key={t.ticketTypeName} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <span className="w-2 h-2 rounded-full" style={{ background: CATEGORICAL[i % CATEGORICAL.length] }} />
                                                {t.ticketTypeName} ({formatRupees(t.revenueInPaise)})
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {(data.demographics.colleges || data.demographics.cities) && (
                            <div className="grid lg:grid-cols-2 gap-6">
                                {data.demographics.colleges && data.demographics.colleges.length > 0 && (
                                    <DemographicList title="Top Colleges" items={data.demographics.colleges} />
                                )}
                                {data.demographics.cities && data.demographics.cities.length > 0 && (
                                    <DemographicList title="Top Cities" items={data.demographics.cities} />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
