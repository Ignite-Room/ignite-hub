import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle, Clock, XCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import igniteLogo from '@/assets/ignite-logo.png';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPass, setShowPass] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusBanner, setStatusBanner] = useState<'pending' | 'rejected' | null>(null);

    // If there's a redirect intention in state, use it; otherwise determine by role after login
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setError('');
        setStatusBanner(null);
        setLoading(true);
        try {
            await login(data.email, data.password, rememberMe);
            // Get user from storage to determine role for redirect
            const savedUser = localStorage.getItem('ignite_user') || sessionStorage.getItem('ignite_user');
            const user = savedUser ? JSON.parse(savedUser) : null;
            const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

            // Admin → admin console, Ambassador → dashboard
            const destination = from || (isAdmin ? '/ambassador/admin' : '/ambassador/dashboard');
            navigate(destination, { replace: true });
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Login failed';
            if (msg.includes('PENDING_APPROVAL') || msg.includes('under review')) {
                setStatusBanner('pending');
            } else if (msg.includes('REJECTED') || msg.includes('not approved')) {
                setStatusBanner('rejected');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/8 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative"
            >
                {/* Card */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mb-8">
                        <img src={igniteLogo} alt="Ignite Room" className="h-8 w-auto" />
                        <Link to="/" className="text-xl font-bold text-gradient">Ignite Room</Link>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
                        <p className="text-muted-foreground text-sm">Sign in to your ambassador dashboard</p>
                    </div>

                    {statusBanner === 'pending' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
                        >
                            <div className="flex gap-2 mb-1"><Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" /><p className="text-sm font-medium text-amber-300">Application Under Review</p></div>
                            <p className="text-xs text-amber-400/80 ml-6">Your application is pending admin approval. You'll be able to log in once approved.</p>
                        </motion.div>
                    )}
                    {statusBanner === 'rejected' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30"
                        >
                            <div className="flex gap-2 mb-1"><XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /><p className="text-sm font-medium text-destructive">Application Not Approved</p></div>
                            <p className="text-xs text-destructive/80 ml-6">Contact <a href="mailto:admin@igniteroom.in" className="underline">admin@igniteroom.in</a> for details.</p>
                        </motion.div>
                    )}
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
                            <Label htmlFor="email" className="text-sm text-muted-foreground mb-1.5 block">Email</Label>
                            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com"
                                className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11"
                                {...register('email')} />
                            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-sm text-muted-foreground mb-1.5 block">Password</Label>
                            <div className="relative">
                                <Input id="password" type={showPass ? 'text' : 'password'} autoComplete="current-password"
                                    placeholder="Your password"
                                    className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pr-10"
                                    {...register('password')} />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <div
                                    onClick={() => setRememberMe(!rememberMe)}
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${rememberMe ? 'bg-primary border-primary' : 'border-border/60 bg-secondary/40'}`}
                                >
                                    {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <span className="text-sm text-muted-foreground">Remember me for 30 days</span>
                            </label>
                            <Link to="/ambassador/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold gap-2 mt-1" disabled={loading}>
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><LogIn className="w-4 h-4" /> Sign In</>
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/ambassador/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">Apply now</Link>
                    </p>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        <Link to="/ambassador" className="hover:text-foreground transition-colors">← Back to Ambassador Program</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
