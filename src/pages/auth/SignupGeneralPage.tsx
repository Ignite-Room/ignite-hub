import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, redirectPathForUser } from '@/lib/auth-context';
import { api } from '@/lib/api';
import igniteLogo from '@/assets/ignite-logo.png';
import AuthSidebar from '@/components/auth/AuthSidebar';
import AuthBackground from '@/components/auth/AuthBackground';
import WelcomeBackSplash from '@/components/auth/WelcomeBackSplash';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function SignupGeneralPage() {
    const { registerGeneral, isAuthenticated, user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [stats, setStats] = useState<{ totalUsers: number; hostedEvents: number } | null>(null);
    useEffect(() => {
        api.getStats().then((s) => setStats(s)).catch(() => setStats(null));
    }, []);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setError('');
        setLoading(true);
        try {
            const user = await registerGeneral({ name: data.name, email: data.email, password: data.password });
            navigate(redirectPathForUser(user), { replace: true });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Sign up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated && currentUser) {
        return (
            <WelcomeBackSplash
                email={currentUser.email}
                onContinue={() => navigate(redirectPathForUser(currentUser), { replace: true })}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-stretch relative overflow-hidden">
            <AuthBackground />

            <AuthSidebar stats={stats} />

            <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-md relative"
                >
                    <div className="glass-card rounded-md p-6 sm:p-8 border border-border/50 shadow-2xl">
                        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                            <img src={igniteLogo} alt="Ignite Room" className="h-8 w-auto" />
                            <Link to="/" className="text-xl font-bold text-gradient">Ignite Room</Link>
                        </div>

                        <div className="flex items-center gap-6 mb-6 border-b border-border/50">
                            <Link to="/login" className="text-muted-foreground hover:text-foreground font-semibold text-sm pb-3 transition-colors">Sign in</Link>
                            <span className="text-foreground font-semibold text-sm pb-3 border-b-2 border-primary">Create account</span>
                        </div>

                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
                            <p className="text-muted-foreground text-sm">Browse events, register, and apply as an organizer.</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-sm text-muted-foreground mb-1.5 block">Full Name</Label>
                                <Input id="name" placeholder="Your name" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" {...register('name')} />
                                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-sm text-muted-foreground mb-1.5 block">Email</Label>
                                <Input id="email" type="email" placeholder="you@example.com" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" {...register('email')} />
                                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-sm text-muted-foreground mb-1.5 block">Password</Label>
                                <div className="relative">
                                    <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pr-10" {...register('password')} />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground mb-1.5 block">Confirm Password</Label>
                                <Input id="confirmPassword" type="password" placeholder="Re-enter password" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" {...register('confirmPassword')} />
                                {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>}
                            </div>

                            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold gap-2 mt-1 rounded-full" disabled={loading}>
                                {loading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><UserPlus className="w-4 h-4" /> Create account</>
                                )}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Log in</Link>
                        </p>
                        <p className="mt-3 text-center text-sm text-muted-foreground">
                            Want to become a Campus Ambassador? Create your account above, then{' '}
                            <Link to="/ambassador/apply" className="hover:text-foreground transition-colors underline">apply here</Link>.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
