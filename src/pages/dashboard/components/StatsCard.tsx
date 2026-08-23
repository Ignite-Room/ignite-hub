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
        bg: 'bg-primary/15',
        border: 'border-primary/30',
        icon: 'text-primary',
        value: 'text-primary',
        glow: 'shadow-primary/10',
    },
    green: {
        bg: 'bg-green-500/15',
        border: 'border-green-500/30',
        icon: 'text-green-600 dark:text-green-400',
        value: 'text-green-600 dark:text-green-400',
        glow: 'shadow-green-500/10',
    },
    blue: {
        bg: 'bg-blue-500/15',
        border: 'border-blue-500/30',
        icon: 'text-blue-600 dark:text-blue-400',
        value: 'text-blue-600 dark:text-blue-400',
        glow: 'shadow-blue-500/10',
    },
    amber: {
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/30',
        icon: 'text-orange-600 dark:text-orange-400',
        value: 'text-orange-600 dark:text-orange-400',
        glow: 'shadow-orange-500/10',
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

            <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3 ${c.icon}`}>
                {icon}
            </div>

            <p className="text-3xl font-heading font-bold text-foreground">
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
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        </motion.div>
    );
}
