import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, Building2, IdCard, Lock, Camera,
    Save, ArrowLeft, Tag, X, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import AvatarCropModal from '@/components/AvatarCropModal';
import TwoFactorSetup from '@/components/TwoFactorSetup';
import igniteLogo from '@/assets/ignite-logo.png';

const GENDER_OPTIONS = ['Prefer not to say', 'Male', 'Female', 'Non-binary', 'Other'];

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry', 'Other',
];

function Avatar({ url, name, size = 'lg' }: { url?: string; name?: string; size?: 'sm' | 'lg' }) {
    const dim = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-10 h-10 text-sm';
    if (url) {
        return (
            <img
                src={url}
                alt={name || 'Avatar'}
                className={`${dim} rounded-full object-cover border-2 border-primary/30`}
            />
        );
    }
    return (
        <div className={`${dim} rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary border-2 border-primary/30`}>
            {name?.charAt(0)?.toUpperCase() ?? <User className="w-6 h-6" />}
        </div>
    );
}

interface Toast { type: 'success' | 'error'; message: string }

export default function ProfilePage() {
    const { user, login: _login } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile state
    const [profile, setProfile] = useState({
        gender: user?.gender ?? '',
        state: user?.state ?? '',
        city: user?.city ?? '',
        degree: user?.degree ?? '',
        techStack: user?.techStack ?? [] as string[],
        avatarUrl: user?.avatarUrl ?? '',
    });

    const [techInput, setTechInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Load full profile from server on mount
    useEffect(() => {
        api.getProfile().then((data) => {
            setProfile({
                gender: data.gender ?? '',
                state: data.state ?? '',
                city: data.city ?? '',
                degree: data.degree ?? '',
                techStack: data.techStack ?? [],
                avatarUrl: data.avatarUrl ?? '',
            });
        }).catch(() => {/* use local user fields */});
    }, []);

    const showToast = useCallback((type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    }, []);

    // ── Avatar upload flow ───────────────────────────────────────────────────
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setCropSrc(reader.result as string);
        reader.readAsDataURL(file);
        e.target.value = ''; // reset so same file can be re-selected
    };

    const onCropConfirm = async (blob: Blob) => {
        setCropSrc(null);
        setUploadingAvatar(true);
        try {
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            const { avatarUrl } = await api.uploadAvatar(file);
            setProfile(prev => ({ ...prev, avatarUrl }));
            showToast('success', 'Profile photo updated.');
        } catch (e) {
            showToast('error', e instanceof Error ? e.message : 'Avatar upload failed.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    // ── Save profile ─────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateProfile({
                gender: profile.gender || undefined,
                state: profile.state || undefined,
                city: profile.city || undefined,
                degree: profile.degree || undefined,
                techStack: profile.techStack.length > 0 ? profile.techStack : undefined,
            });
            showToast('success', 'Profile saved successfully.');
        } catch (e) {
            showToast('error', e instanceof Error ? e.message : 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    // ── Tech stack tag helpers ────────────────────────────────────────────────
    const addTech = () => {
        const t = techInput.trim();
        if (!t || profile.techStack.includes(t) || profile.techStack.length >= 15) return;
        setProfile(prev => ({ ...prev, techStack: [...prev.techStack, t] }));
        setTechInput('');
    };
    const removeTech = (tech: string) => {
        setProfile(prev => ({ ...prev, techStack: prev.techStack.filter(t => t !== tech) }));
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={igniteLogo} alt="Ignite Room" className="h-6 w-auto" />
                        <span className="font-bold text-gradient text-base hidden xs:block">Ignite Room</span>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                        <Link to="/ambassador/dashboard">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Toast */}
            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm shadow-lg ${
                            toast.type === 'success'
                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                : 'bg-destructive/10 border-destructive/30 text-destructive'
                        }`}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                        {toast.message}
                    </motion.div>
                </div>
            )}

            {/* Crop Modal */}
            {cropSrc && (
                <AvatarCropModal
                    imageDataUrl={cropSrc}
                    onConfirm={onCropConfirm}
                    onCancel={() => setCropSrc(null)}
                />
            )}

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                    className="space-y-6"
                >
                    {/* Page title */}
                    <motion.div variants={itemVariants}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage your ambassador profile and personal details.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ── Left: Avatar + read-only info ── */}
                        <motion.div variants={itemVariants} className="space-y-4">
                            {/* Avatar card */}
                            <div className="glass-card rounded-2xl p-6 border border-border/50 flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Avatar url={profile.avatarUrl} name={user?.name} size="lg" />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                                        title="Upload photo"
                                    >
                                        {uploadingAvatar
                                            ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                                            : <Camera className="w-3.5 h-3.5 text-white" />}
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-foreground">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{user?.college || 'Ambassador'}</p>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Click the camera icon to upload a new photo. Circular crop is applied automatically.
                                </p>
                            </div>

                            {/* Read-only info */}
                            <div className="glass-card rounded-2xl p-5 border border-border/50 space-y-3">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" /> Account Details
                                </h3>
                                {[
                                    { icon: <User className="w-3.5 h-3.5" />, label: 'Name', value: user?.name },
                                    { icon: <Mail className="w-3.5 h-3.5" />, label: 'Email', value: user?.email },
                                    { icon: <Phone className="w-3.5 h-3.5" />, label: 'Phone', value: user?.phone },
                                    { icon: <Building2 className="w-3.5 h-3.5" />, label: 'College', value: user?.college || '-' },
                                    { icon: <IdCard className="w-3.5 h-3.5" />, label: 'Enrollment ID', value: user?.enrollmentId || '-' },
                                ].map(({ icon, label, value }) => (
                                    <div key={label} className="flex items-start gap-2.5">
                                        <div className="w-6 h-6 rounded-md bg-secondary/60 flex items-center justify-center text-muted-foreground flex-shrink-0 mt-0.5">
                                            {icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">{label}</p>
                                            <p className="text-sm text-foreground truncate">{value}</p>
                                        </div>
                                    </div>
                                ))}
                                <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> These fields cannot be changed.
                                </p>
                            </div>

                            <TwoFactorSetup />
                        </motion.div>

                        {/* ── Right: Editable fields ── */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
                            <div className="glass-card rounded-2xl p-5 sm:p-6 border border-border/50 space-y-5">
                                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" /> Personal Details
                                </h3>

                                {/* Gender */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Gender</label>
                                    <select
                                        value={profile.gender}
                                        onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                                        className="w-full bg-secondary/40 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="">Select gender</option>
                                        {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>

                                {/* State + City */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">State</label>
                                        <select
                                            value={profile.state}
                                            onChange={e => setProfile(p => ({ ...p, state: e.target.value }))}
                                            className="w-full bg-secondary/40 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                        >
                                            <option value="">Select state</option>
                                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">City</label>
                                        <input
                                            type="text"
                                            placeholder="Your city"
                                            value={profile.city}
                                            onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                                            className="w-full bg-secondary/40 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Degree */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Degree / Course</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. B.Tech Computer Science"
                                        value={profile.degree}
                                        onChange={e => setProfile(p => ({ ...p, degree: e.target.value }))}
                                        className="w-full bg-secondary/40 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>

                                {/* Tech Stack */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> Tech Stack
                                        <span className="text-muted-foreground/60 font-normal ml-1">({profile.techStack.length}/15)</span>
                                    </label>

                                    {/* Tags */}
                                    {profile.techStack.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {profile.techStack.map(tech => (
                                                <span
                                                    key={tech}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-medium"
                                                >
                                                    {tech}
                                                    <button
                                                        onClick={() => removeTech(tech)}
                                                        className="hover:text-destructive transition-colors ml-0.5"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add a skill (e.g. React, Python)"
                                            value={techInput}
                                            onChange={e => setTechInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                                            className="flex-1 bg-secondary/40 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={addTech}
                                            disabled={!techInput.trim() || profile.techStack.length >= 15}
                                            className="h-auto px-4 border-border/50 hover:border-primary/40"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Press Enter or click Add. Maximum 15 skills.</p>
                                </div>

                                {/* Save button */}
                                <div className="pt-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full sm:w-auto gap-2"
                                    >
                                        {saving
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
