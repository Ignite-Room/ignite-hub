export default function AuthBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
                style={{
                    backgroundImage: 'radial-gradient(hsl(var(--foreground) / 0.18) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                    maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
                    WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
                }}
            />
            <div className="absolute top-1/4 right-[8%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/8 rounded-full blur-3xl" />
        </div>
    );
}
