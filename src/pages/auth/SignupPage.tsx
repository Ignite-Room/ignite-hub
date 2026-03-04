import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import igniteLogo from '@/assets/ignite-logo.png';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    college: z.string().min(2, 'College name is required'),
    enrollmentId: z.string().min(2, 'Enrollment / Employee ID is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function SignupPage() {
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setError('');
        setLoading(true);
        try {
            if (USE_MOCK) {
                // Mock mode: skip to dashboard
                navigate('/ambassador/dashboard', { replace: true });
                return;
            }

            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    college: data.college,
                    enrollmentId: data.enrollmentId,
                    password: data.password,
                }),
            });

            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Signup failed');

            // Redirect to pending approval page — no auto-login
            navigate('/ambassador/pending', {
                replace: true,
                state: { name: body.name, college: body.college },
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-accent/6 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative"
            >
                <div className="glass-card rounded-2xl p-8 border border-border/50 shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mb-6">
                        <img src={igniteLogo} alt="Ignite Room" className="h-8 w-auto" />
                        <Link to="/" className="text-xl font-bold text-gradient">Ignite Room</Link>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-foreground mb-1">Apply as Campus Ambassador</h1>
                        <p className="text-muted-foreground text-sm">Your application will be reviewed by our team before you can log in.</p>
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
                        {/* Name */}
                        <div>
                            <Label htmlFor="name" className="text-sm text-muted-foreground mb-1.5 block">Full Name</Label>
                            <Input id="name" placeholder="Satyam Sharma" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" {...register('name')} />
                            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <Label htmlFor="email" className="text-sm text-muted-foreground mb-1.5 block">Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" {...register('email')} />
                            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <Label htmlFor="phone" className="text-sm text-muted-foreground mb-1.5 block">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="9876543210" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" {...register('phone')} />
                            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                        </div>

                        {/* College */}
                        <div>
                            <Label htmlFor="college" className="text-sm text-muted-foreground mb-1.5 block">College / Institution</Label>
                            <Input id="college" placeholder="IIIT Delhi" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" {...register('college')} />
                            {errors.college && <p className="mt-1 text-xs text-destructive">{errors.college.message}</p>}
                        </div>

                        {/* Enrollment ID */}
                        <div>
                            <Label htmlFor="enrollmentId" className="text-sm text-muted-foreground mb-1.5 block">Enrollment / Employee ID</Label>
                            <Input id="enrollmentId" placeholder="MT23001 or EMP-0042" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" {...register('enrollmentId')} />
                            {errors.enrollmentId && <p className="mt-1 text-xs text-destructive">{errors.enrollmentId.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <Label htmlFor="password" className="text-sm text-muted-foreground mb-1.5 block">Password</Label>
                            <div className="relative">
                                <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pr-10" {...register('password')} />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground mb-1.5 block">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" placeholder="Re-enter password" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" {...register('confirmPassword')} />
                            {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold gap-2 mt-2" disabled={loading}>
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><UserPlus className="w-4 h-4" /> Submit Application</>
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already approved?{' '}
                        <Link to="/ambassador/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Sign in</Link>
                    </p>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        <Link to="/ambassador" className="hover:text-foreground transition-colors">← Back to Ambassador Program</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
