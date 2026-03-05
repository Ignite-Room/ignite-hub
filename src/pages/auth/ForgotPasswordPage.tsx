import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, AlertCircle, ArrowLeft, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import igniteLogo from '@/assets/ignite-logo.png';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);

    // Step 1: Request Reset
    const [email, setEmail] = useState('');
    const [sendingCode, setSendingCode] = useState(false);
    const [sendError, setSendError] = useState('');

    // Step 2: Reset Password
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resetError, setResetError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setSendingCode(true);
        setSendError('');
        try {
            await api.forgotPassword(email);
            setStep(2);
        } catch (err: any) {
            setSendError(err.message || 'Failed to send reset code');
        } finally {
            setSendingCode(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !newPassword || !confirmPassword) return;
        if (newPassword !== confirmPassword) {
            setResetError('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setResetError('Password must be at least 8 characters');
            return;
        }

        setResetting(true);
        setResetError('');
        try {
            await api.resetPassword(email, token, newPassword);
            setSuccess(true);
            setTimeout(() => {
                navigate('/ambassador/login');
            }, 3000);
        } catch (err: any) {
            setResetError(err.message || 'Failed to reset password');
        } finally {
            setResetting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10 glass-card rounded-2xl p-8 border border-border/50 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Password Reset!</h2>
                    <p className="text-muted-foreground mb-8">Your password has been changed successfully. Redirecting you to login...</p>
                    <Button onClick={() => navigate('/ambassador/login')} className="bg-primary hover:bg-primary/90 text-white w-full">Go to Login</Button>
                </motion.div>
            </div>
        );
    }

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
                className="w-full max-w-md relative z-10"
            >
                {/* Card */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-8">
                        <img src={igniteLogo} alt="Ignite Room" className="h-8 w-auto" />
                        <span className="text-xl font-bold text-gradient">Ignite Room</span>
                    </div>

                    <Link to="/ambassador/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Login
                    </Link>

                    {step === 1 ? (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-foreground mb-1">Reset Password</h1>
                                <p className="text-muted-foreground text-sm">Enter the email associated with your account and we'll send you a 6-digit reset code.</p>
                            </div>

                            {sendError && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {sendError}
                                </motion.div>
                            )}

                            <form onSubmit={handleSendCode} className="space-y-4">
                                <div>
                                    <Label htmlFor="email" className="text-sm text-muted-foreground mb-1.5 block">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                        <Input
                                            id="email" type="email" required autoFocus placeholder="you@example.com"
                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pl-10"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold mt-2" disabled={sendingCode}>
                                    {sendingCode ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : 'Send Reset Code'}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-foreground mb-1">Check Your Email</h1>
                                <p className="text-muted-foreground text-sm">We've sent a 6-digit code to <strong className="text-foreground">{email}</strong>. The code expires in 15 minutes.</p>
                            </div>

                            {resetError && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {resetError}
                                </motion.div>
                            )}

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <Label htmlFor="token" className="text-sm text-muted-foreground mb-1.5 block">Reset Code</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                        <Input
                                            id="token" type="text" required autoFocus placeholder="123456" maxLength={6}
                                            value={token} onChange={(e) => setToken(e.target.value)}
                                            className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pl-10 tracking-widest text-center text-lg font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="new-password" className="text-sm text-muted-foreground mb-1.5 block">New Password</Label>
                                    <div className="relative">
                                        <Input id="new-password" type={showPass ? 'text' : 'password'} required placeholder="At least 8 characters"
                                            className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pr-10"
                                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="confirm-password" className="text-sm text-muted-foreground mb-1.5 block">Confirm Password</Label>
                                    <Input id="confirm-password" type={showPass ? 'text' : 'password'} required placeholder="Confirm new password"
                                        className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11"
                                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </div>

                                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold mt-2" disabled={resetting}>
                                    {resetting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting...</> : 'Reset Password'}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
