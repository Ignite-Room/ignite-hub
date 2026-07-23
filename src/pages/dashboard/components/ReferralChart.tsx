import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReferralChartProps {
    data: { date: string; count: number }[];
    title?: string;
    label?: string;
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// Show every 5th label
function tickFormatter(value: string, index: number) {
    return index % 5 === 0 ? formatDate(value) : '';
}

export default function ReferralChart({ data, title = 'Referrals Over Time', label = 'Referrals' }: ReferralChartProps) {
    return (
        <div className="glass-card rounded-2xl p-5 border border-border/50 h-full">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {title}
            </h3>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="refGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(345, 100%, 59%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(345, 100%, 59%)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(345 20% 18%)" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={tickFormatter}
                            tick={{ fill: 'hsl(0 0% 60%)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: 'hsl(0 0% 60%)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(0 10% 8%)',
                                border: '1px solid hsl(345 20% 18%)',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                            labelFormatter={(value) => formatDate(value)}
                            formatter={(value) => [value, label]}
                            labelStyle={{ color: 'hsl(0 0% 60%)' }}
                            itemStyle={{ color: 'hsl(345 100% 59%)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="hsl(345, 100%, 59%)"
                            strokeWidth={2}
                            fill="url(#refGradient)"
                            dot={false}
                            activeDot={{ r: 4, fill: 'hsl(345, 100%, 59%)', strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
