import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Save, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import OrganizerLayout from '@/components/organizer/OrganizerLayout';
import { fetchPayoutDetails, savePayoutDetails, PayoutDetails } from './organizerPayoutsApi';

type Method = 'BANK_TRANSFER' | 'UPI';

interface FormState {
    method: Method;
    bankAccountNumber: string;
    bankIfsc: string;
    bankName: string;
    beneficiaryName: string;
    upiId: string;
    upiPayeeName: string;
    contactPhone: string;
    contactEmail: string;
}

const emptyForm: FormState = {
    method: 'BANK_TRANSFER',
    bankAccountNumber: '',
    bankIfsc: '',
    bankName: '',
    beneficiaryName: '',
    upiId: '',
    upiPayeeName: '',
    contactPhone: '',
    contactEmail: '',
};

export default function PayoutSettingsPage() {
    const [details, setDetails] = useState<PayoutDetails | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchPayoutDetails()
            .then(d => {
                setDetails(d);
                setForm(prev => ({
                    ...prev,
                    method: d.payoutMethod || 'BANK_TRANSFER',
                    bankIfsc: d.bankIfsc || '',
                    bankName: d.bankName || '',
                    beneficiaryName: d.beneficiaryName || '',
                    upiPayeeName: d.upiPayeeName || '',
                    contactPhone: d.contactPhone || '',
                    contactEmail: d.contactEmail || '',
                }));
            })
            .catch(e => setError(e instanceof Error ? e.message : 'Failed to load payout details'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setError('');
        setSaved(false);
        setSaving(true);
        try {
            if (form.method === 'BANK_TRANSFER') {
                await savePayoutDetails({
                    method: 'BANK_TRANSFER',
                    bankAccountNumber: form.bankAccountNumber,
                    bankIfsc: form.bankIfsc.toUpperCase(),
                    bankName: form.bankName,
                    beneficiaryName: form.beneficiaryName,
                    contactPhone: form.contactPhone,
                    contactEmail: form.contactEmail,
                });
            } else {
                await savePayoutDetails({
                    method: 'UPI',
                    upiId: form.upiId,
                    upiPayeeName: form.upiPayeeName,
                    contactPhone: form.contactPhone,
                    contactEmail: form.contactEmail,
                });
            }
            const refreshed = await fetchPayoutDetails();
            setDetails(refreshed);
            setForm(prev => ({ ...prev, bankAccountNumber: '', upiId: '' }));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save payout details');
        } finally {
            setSaving(false);
        }
    };

    return (
        <OrganizerLayout title="Payout Settings" breadcrumb={['Organizer', 'Payments']}>
            {loading ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
                    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border/50 space-y-5">
                        <div className="flex items-start gap-3 pb-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Where should we send your payouts?</h2>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Ignite Room collects ticket payments on your behalf via Razorpay, then settles your revenue to this account. Details are encrypted at rest and only visible to you and platform admins.
                                </p>
                            </div>
                        </div>

                        {details?.updatedAt && (
                            <div className="text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                Currently on file: {details.payoutMethod === 'UPI' ? `UPI ${details.upiIdMasked}` : `Bank a/c ${details.bankAccountNumberMasked}`}
                                {' '}&middot; last updated {new Date(details.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-destructive flex items-center gap-1.5"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}</p>
                        )}
                        {saved && (
                            <p className="text-sm text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Payout details saved.</p>
                        )}

                        <div>
                            <Label className="text-sm text-muted-foreground mb-1.5 block">Payout method</Label>
                            <ToggleGroup
                                type="single"
                                value={form.method}
                                onValueChange={(v) => v && setForm(prev => ({ ...prev, method: v as Method }))}
                                className="justify-start"
                            >
                                <ToggleGroupItem value="BANK_TRANSFER" className="h-9 px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border/50">Bank Transfer</ToggleGroupItem>
                                <ToggleGroupItem value="UPI" className="h-9 px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border/50">UPI</ToggleGroupItem>
                            </ToggleGroup>
                        </div>

                        {form.method === 'BANK_TRANSFER' ? (
                            <>
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Account Number</Label>
                                    <Input
                                        type="text" inputMode="numeric" placeholder={details?.bankAccountNumberMasked ? `Currently ${details.bankAccountNumberMasked} — re-enter to change` : 'Enter account number'}
                                        value={form.bankAccountNumber}
                                        onChange={e => setForm(prev => ({ ...prev, bankAccountNumber: e.target.value.replace(/\D/g, '') }))}
                                        className="bg-secondary/50 border-border/50 h-11"
                                    />
                                    <p className="text-xs text-muted-foreground/60 mt-1">Re-enter the full account number each time you save, as a safeguard against partial edits.</p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1.5 block">IFSC Code</Label>
                                        <Input
                                            placeholder="HDFC0001234" value={form.bankIfsc}
                                            onChange={e => setForm(prev => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                                            className="bg-secondary/50 border-border/50 h-11 uppercase"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-1.5 block">Bank Name</Label>
                                        <Input
                                            placeholder="HDFC Bank" value={form.bankName}
                                            onChange={e => setForm(prev => ({ ...prev, bankName: e.target.value }))}
                                            className="bg-secondary/50 border-border/50 h-11"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Beneficiary Name</Label>
                                    <Input
                                        placeholder="Name as per bank records" value={form.beneficiaryName}
                                        onChange={e => setForm(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                                        className="bg-secondary/50 border-border/50 h-11"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">UPI ID</Label>
                                    <Input
                                        placeholder={details?.upiIdMasked ? `Currently ${details.upiIdMasked} — re-enter to change` : 'yourname@bank'} value={form.upiId}
                                        onChange={e => setForm(prev => ({ ...prev, upiId: e.target.value }))}
                                        className="bg-secondary/50 border-border/50 h-11"
                                    />
                                    <p className="text-xs text-muted-foreground/60 mt-1">Re-enter the full UPI ID each time you save, as a safeguard against partial edits.</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground mb-1.5 block">Payee Name</Label>
                                    <Input
                                        placeholder="Name linked to this UPI ID" value={form.upiPayeeName}
                                        onChange={e => setForm(prev => ({ ...prev, upiPayeeName: e.target.value }))}
                                        className="bg-secondary/50 border-border/50 h-11"
                                    />
                                </div>
                            </>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Contact Phone</Label>
                                <Input
                                    type="tel" placeholder="9876543210" value={form.contactPhone}
                                    onChange={e => setForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                                    className="bg-secondary/50 border-border/50 h-11"
                                />
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-1.5 block">Contact Email</Label>
                                <Input
                                    type="email" placeholder="you@example.com" value={form.contactEmail}
                                    onChange={e => setForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                                    className="bg-secondary/50 border-border/50 h-11"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground/60">Payout confirmations and invoices are sent to this email.</p>

                        <div className="pt-2">
                            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Payout Details
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </OrganizerLayout>
    );
}
