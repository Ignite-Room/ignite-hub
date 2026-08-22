import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle, Check, ArrowLeft, ShieldCheck, KeyRound, Users, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, redirectPathForUser, LoginOutcome, User } from '@/lib/auth-context';
import { maskEmail } from '@/lib/utils';
import { api } from '@/lib/api';
import OtpCodeInput from '@/components/OtpCodeInput';
import igniteLogo from '@/assets/ignite-logo.png';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const RESEND_COOLDOWN_SECONDS = 45;

interface LoginPageProps {
    variant?: 'general' | 'staff';
}

export default function LoginPage({ variant = 'general' }: LoginPageProps) {
    const { login, completeOtpLogin, completeTotpLogin, resendLoginOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPass, setShowPass] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [step, setStep] = useState<'credentials' | 'otp' | 'totp' | 'verified'>('credentials');
    const [otpEmail, setOtpEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [backupCode, setBackupCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const [stats, setStats] = useState<{ totalUsers: number; hostedEvents: number } | null>(null);
    useEffect(() => {
        api.getStats().then((s) => setStats(s)).catch(() => setStats(null));
    }, []);

    // If there's a redirect intention in state, use it; otherwise determine by role after login
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (cooldown <= 0) return;
        const interval = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000);
        return () => clearInterval(interval);
    }, [cooldown]);

    const redirectAfterLogin = (user: User) => {
        navigate(from || redirectPathForUser(user), { replace: true });
    };

    const handleAuthError = (msg: string) => setError(msg);

    const handleOutcome = (outcome: LoginOutcome) => {
        if (outcome.otpRequired) {
            setOtpEmail(outcome.email);
            setOtpCode('');
            setBackupCode('');
            setUseBackupCode(false);
            setError('');
            if (outcome.method === 'totp') {
                setStep('totp');
            } else {
                setStep('otp');
                setCooldown(RESEND_COOLDOWN_SECONDS);
            }
            return;
        }
        redirectAfterLogin(outcome.user);
    };

    const onSubmit = async (data: FormData) => {
        setError('');
        setLoading(true);
        try {
            const outcome = await login(data.email, data.password, rememberMe);
            handleOutcome(outcome);
        } catch (e) {
            handleAuthError(e instanceof Error ? e.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const onVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otpCode.length < 6) {
            setError('Enter the 6-digit code from your email');
            return;
        }
        setError('');
        setVerifying(true);
        try {
            const user = await completeOtpLogin(otpEmail, otpCode, rememberMe);
            setStep('verified');
            setTimeout(() => redirectAfterLogin(user), 800);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const onVerifyTotp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = useBackupCode ? backupCode.trim() : otpCode;
        if (useBackupCode ? code.length < 6 : code.length < 6) {
            setError(useBackupCode ? 'Enter a backup code' : 'Enter the 6-digit code from your authenticator app');
            return;
        }
        setError('');
        setVerifying(true);
        try {
            const user = await completeTotpLogin(otpEmail, code, rememberMe);
            setStep('verified');
            setTimeout(() => redirectAfterLogin(user), 800);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const onResend = async () => {
        if (cooldown > 0 || resending) return;
        setResending(true);
        setError('');
        try {
            await resendLoginOtp(otpEmail);
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to resend code');
        } finally {
            setResending(false);
        }
    };

    const heading = variant === 'staff' ? 'Organizer & Admin Sign In' : 'Welcome back.';
    const subheading = variant === 'staff'
        ? 'Sign in with your organizer or admin account'
        : 'Sign in to your Ignite Room account.';

    return (
        <div className="min-h-screen bg-background flex items-stretch relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/8 rounded-full blur-3xl" />
            </div>

            {/* Left: stats sidebar (desktop only) */}
            <div className="hidden lg:flex flex-col justify-center w-[42%] px-16 relative z-10">
                <Link to="/" className="flex items-center gap-2.5 mb-14">
                    <img src={igniteLogo} alt="Ignite Room" className="h-8 w-auto" />
                    <span className="text-xl font-bold text-gradient">Ignite Room</span>
                </Link>

                <div className="space-y-10">
                    <div>
                        <div className="text-5xl font-heading font-bold text-foreground">
                            {stats ? `${stats.totalUsers.toLocaleString()}+` : ' '}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                            <Users className="w-3.5 h-3.5" /> Builders active
                        </div>
                    </div>
                    <div>
                        <div className="text-5xl font-heading font-bold text-foreground">
                            {stats ? `${stats.hostedEvents}+` : ' '}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                            <CalendarDays className="w-3.5 h-3.5" /> Events hosted
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: auth card */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-md relative"
                >
                    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-2xl">
                        {/* Logo (mobile only, sidebar covers desktop) */}
                        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                            <img src={igniteLogo} alt="Ignite Room" className="h-8 w-auto" />
                            <Link to="/" className="text-xl font-bold text-gradient">Ignite Room</Link>
                        </div>

                        {step === 'credentials' && variant === 'general' && (
                            <div className="flex items-center gap-6 mb-6 border-b border-border/50">
                                <span className="text-foreground font-semibold text-sm pb-3 border-b-2 border-primary">Sign in</span>
                                <Link to="/signup" className="text-muted-foreground hover:text-foreground font-semibold text-sm pb-3 transition-colors">Create account</Link>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === 'credentials' && (
                                <motion.div
                                    key="credentials"
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="mb-6">
                                        <h1 className="text-2xl font-bold text-foreground mb-1">
                                            {variant === 'staff' ? heading : (
                                                <>Welcome <span className="text-gradient">back.</span></>
                                            )}
                                        </h1>
                                        <p className="text-muted-foreground text-sm">{subheading}</p>
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
                                            <Label htmlFor="email" className="text-sm text-muted-foreground mb-1.5 block">Email</Label>
                                            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com"
                                                className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11"
                                                {...register('email')} />
                                            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
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
                                            {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
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

                                        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold gap-2 mt-1 rounded-full" disabled={loading}>
                                            {loading ? (
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><LogIn className="w-4 h-4" /> Enter the room</>
                                            )}
                                        </Button>
                                    </form>

                                    {variant === 'staff' ? (
                                        <p className="mt-6 text-center text-sm text-muted-foreground">
                                            Not an organizer or admin?{' '}
                                            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Go to regular sign in</Link>
                                        </p>
                                    ) : (
                                        <>
                                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                                New here?{' '}
                                                <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">Create a free account</Link>
                                            </p>
                                            <p className="mt-3 text-center text-sm text-muted-foreground">
                                                Want to become a Campus Ambassador?{' '}
                                                <Link to="/ambassador/apply" className="hover:text-foreground transition-colors underline">Apply here</Link>
                                            </p>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {step === 'otp' && (
                                <motion.div
                                    key="otp"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => { setStep('credentials'); setError(''); }}
                                        className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-5"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>

                                    <div className="mb-6 flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-foreground mb-1">Enter verification code</h1>
                                            <p className="text-muted-foreground text-sm">
                                                We sent a 6-digit code to <span className="text-foreground font-medium">{maskEmail(otpEmail)}</span>
                                            </p>
                                        </div>
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

                                    <form onSubmit={onVerifyOtp} className="space-y-5">
                                        <OtpCodeInput value={otpCode} onChange={setOtpCode} error={!!error} disabled={verifying} autoFocus />

                                        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold gap-2 rounded-full" disabled={verifying || otpCode.length < 6}>
                                            {verifying ? (
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><ShieldCheck className="w-4 h-4" /> Verify & Sign In</>
                                            )}
                                        </Button>

                                        <button
                                            type="button"
                                            onClick={onResend}
                                            disabled={cooldown > 0 || resending}
                                            className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                                        >
                                            {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending...' : 'Resend code'}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {step === 'totp' && (
                                <motion.div
                                    key="totp"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => { setStep('credentials'); setError(''); }}
                                        className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-5"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>

                                    <div className="mb-6 flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <KeyRound className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-foreground mb-1">Two-factor authentication</h1>
                                            <p className="text-muted-foreground text-sm">
                                                {useBackupCode
                                                    ? 'Enter one of your saved backup codes.'
                                                    : 'Enter the 6-digit code from your authenticator app.'}
                                            </p>
                                        </div>
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

                                    <form onSubmit={onVerifyTotp} className="space-y-5">
                                        {useBackupCode ? (
                                            <Input
                                                value={backupCode}
                                                onChange={(e) => setBackupCode(e.target.value)}
                                                placeholder="XXXXX-XXXXX"
                                                autoFocus
                                                disabled={verifying}
                                                className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 text-center tracking-widest font-mono"
                                            />
                                        ) : (
                                            <OtpCodeInput value={otpCode} onChange={setOtpCode} error={!!error} disabled={verifying} autoFocus />
                                        )}

                                        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold gap-2 rounded-full" disabled={verifying || (useBackupCode ? backupCode.length < 6 : otpCode.length < 6)}>
                                            {verifying ? (
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><ShieldCheck className="w-4 h-4" /> Verify & Sign In</>
                                            )}
                                        </Button>

                                        <button
                                            type="button"
                                            onClick={() => { setUseBackupCode(!useBackupCode); setError(''); }}
                                            className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                        >
                                            {useBackupCode ? 'Use my authenticator app instead' : 'Use a backup code instead'}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {step === 'verified' && (
                                <motion.div
                                    key="verified"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col items-center text-center gap-4 py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.1 }}
                                        className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center"
                                    >
                                        <Check className="w-8 h-8 text-green-400" strokeWidth={3} />
                                    </motion.div>
                                    <div>
                                        <p className="font-bold text-foreground text-lg">Verified successfully</p>
                                        <p className="text-sm text-muted-foreground mt-1">Taking you to your dashboard...</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
