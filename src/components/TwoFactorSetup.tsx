import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldOff, AlertCircle, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import OtpCodeInput from '@/components/OtpCodeInput';

type Stage = 'loading' | 'idle' | 'setup' | 'backup-codes' | 'disable';

export default function TwoFactorSetup() {
    const [stage, setStage] = useState<Stage>('loading');
    const [enabled, setEnabled] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [disableCode, setDisableCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api.get2faStatus()
            .then((res) => { setEnabled(res.enabled); setStage('idle'); })
            .catch(() => setStage('idle'));
    }, []);

    const startSetup = async () => {
        setError('');
        setBusy(true);
        try {
            const res = await api.setup2fa();
            setQrCodeDataUrl(res.qrCodeDataUrl);
            setSecret(res.secret);
            setCode('');
            setStage('setup');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not start setup');
        } finally {
            setBusy(false);
        }
    };

    const confirmSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) return;
        setError('');
        setBusy(true);
        try {
            const res = await api.verify2fa(code);
            setBackupCodes(res.backupCodes);
            setEnabled(true);
            setStage('backup-codes');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Incorrect code');
        } finally {
            setBusy(false);
        }
    };

    const confirmDisable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (disableCode.trim().length < 6) return;
        setError('');
        setBusy(true);
        try {
            await api.disable2fa(disableCode.trim());
            setEnabled(false);
            setDisableCode('');
            setStage('idle');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Incorrect code');
        } finally {
            setBusy(false);
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (stage === 'loading') {
        return (
            <div className="glass-card rounded-md p-6 border border-border/50 flex justify-center py-10">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="glass-card rounded-md p-6 border border-border/50">
            <div className="flex items-start gap-3 mb-1">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                    {enabled ? <ShieldCheck className="w-4.5 h-4.5 text-green-400" /> : <ShieldCheck className="w-4.5 h-4.5 text-primary" />}
                </div>
                <div>
                    <p className="font-medium text-foreground">Authenticator app (2FA)</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {enabled
                            ? 'Enabled — a code from your authenticator app is required at login.'
                            : 'Add an extra layer of security using an app like Google Authenticator or Authy.'}
                    </p>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive"
                >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {stage === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                        {enabled ? (
                            <Button variant="outline" onClick={() => { setStage('disable'); setError(''); }} className="gap-2">
                                <ShieldOff className="w-4 h-4" /> Disable 2FA
                            </Button>
                        ) : (
                            <Button onClick={startSetup} disabled={busy} className="gap-2 rounded-full">
                                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Enable 2FA
                            </Button>
                        )}
                    </motion.div>
                )}

                {stage === 'setup' && (
                    <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Scan this QR code with your authenticator app, then enter the 6-digit code it generates.
                        </p>
                        {qrCodeDataUrl && (
                            <div className="flex justify-center p-4 bg-white rounded-xl w-fit">
                                <img src={qrCodeDataUrl} alt="2FA QR code" className="w-40 h-40" />
                            </div>
                        )}
                        <details className="text-sm text-muted-foreground">
                            <summary className="cursor-pointer select-none">Can't scan? Enter this key manually</summary>
                            <p className="mt-2 font-mono text-xs break-all bg-secondary/50 rounded-lg p-3">{secret}</p>
                        </details>
                        <form onSubmit={confirmSetup} className="space-y-4">
                            <OtpCodeInput value={code} onChange={setCode} error={!!error} disabled={busy} autoFocus />
                            <div className="flex gap-3">
                                <Button type="submit" disabled={busy || code.length < 6} className="gap-2 rounded-full">
                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Confirm & Enable
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => { setStage('idle'); setError(''); }}>Cancel</Button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {stage === 'backup-codes' && (
                    <motion.div key="backup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-sm text-green-400">
                            <ShieldCheck className="w-4 h-4 flex-shrink-0" /> Two-factor authentication is now enabled.
                        </div>
                        <div>
                            <p className="text-sm text-foreground font-medium mb-1">Save your backup codes</p>
                            <p className="text-sm text-muted-foreground mb-3">
                                Each code can be used once to sign in if you lose access to your authenticator app. Store them somewhere safe — they won't be shown again.
                            </p>
                            <div className="grid grid-cols-2 gap-2 bg-secondary/50 rounded-xl p-4 font-mono text-sm">
                                {backupCodes.map((c) => <span key={c}>{c}</span>)}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={copyBackupCodes} className="gap-2">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy codes'}
                            </Button>
                            <Button onClick={() => setStage('idle')} className="rounded-full">Done</Button>
                        </div>
                    </motion.div>
                )}

                {stage === 'disable' && (
                    <motion.div key="disable" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Enter a code from your authenticator app (or a backup code) to disable 2FA.
                        </p>
                        <form onSubmit={confirmDisable} className="space-y-4">
                            <Input
                                value={disableCode}
                                onChange={(e) => setDisableCode(e.target.value)}
                                placeholder="6-digit code or backup code"
                                autoFocus
                                disabled={busy}
                                className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 max-w-xs"
                            />
                            <div className="flex gap-3">
                                <Button type="submit" variant="destructive" disabled={busy || disableCode.trim().length < 6} className="gap-2">
                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />} Disable 2FA
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => { setStage('idle'); setError(''); }}>Cancel</Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
