import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
    label: string;
    value: number | string;
    icon: ReactNode;
    color: 'primary' | 'green' | 'blue' | 'amber';
    isString?: boolean;
}

const colorMap = {
    primary: {
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        icon: 'text-primary',
        value: 'text-primary',
        glow: 'shadow-primary/10',
    },
    green: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        icon: 'text-green-400',
        value: 'text-green-400',
        glow: 'shadow-green-500/10',
    },
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        icon: 'text-blue-400',
        value: 'text-blue-400',
        glow: 'shadow-blue-500/10',
    },
    amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: 'text-amber-400',
        value: 'text-amber-400',
        glow: 'shadow-amber-500/10',
    },
};

export default function StatsCard({ label, value, icon, color, isString = false }: StatsCardProps) {
    const c = colorMap[color];

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
            className={`bg-card p-5 border-t-2 ${c.border} relative overflow-hidden`}
        >
            {/* Background glow */}
            <div className={`absolute top-0 right-0 w-20 h-20 ${c.bg} rounded-full blur-2xl -translate-y-4 translate-x-4 pointer-events-none`} />

            <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center mb-3 ${c.icon}`}>
                {icon}
            </div>

            <p className="text-2xl font-heading font-bold text-foreground">
                {isString
                    ? value
                    : <motion.span
                        key={String(value)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {value}
                    </motion.span>
                }
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </motion.div>
    );
}
