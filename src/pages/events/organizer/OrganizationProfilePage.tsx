import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Upload, Building2 } from 'lucide-react';
import OrganizerLayout from '@/components/organizer/OrganizerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizerProfile, useUpdateOrganizerProfile, useUploadOrganizerLogo } from './organizerProfileApi';

const ORG_TYPES = [
    { value: 'club', label: 'Club' },
    { value: 'community', label: 'Community' },
    { value: 'external', label: 'External Organization' },
    { value: 'individual', label: 'Individual' },
];

const profileSchema = z.object({
    orgName: z.string().min(2, 'Organization name is required'),
    orgType: z.string().min(1, 'Select an organization type'),
    bio: z.string().max(2000).optional(),
    website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
    contactEmail: z.string().email('Enter a valid email'),
    contactPhone: z.string().min(6, 'Enter a valid phone number'),
});
type ProfileFormData = z.infer<typeof profileSchema>;

export default function OrganizationProfilePage() {
    const { data: profile, isLoading } = useOrganizerProfile();
    const updateProfile = useUpdateOrganizerProfile();
    const uploadLogo = useUploadOrganizerLogo();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { orgName: '', orgType: '', bio: '', website: '', contactEmail: '', contactPhone: '' },
    });

    useEffect(() => {
        if (profile) {
            reset({
                orgName: profile.orgName,
                orgType: profile.orgType,
                bio: profile.bio || '',
                website: profile.website || '',
                contactEmail: profile.contactEmail,
                contactPhone: profile.contactPhone,
            });
        }
    }, [profile, reset]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            await updateProfile.mutateAsync(data);
            toast.success('Organization profile updated');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to update profile');
        }
    });

    const handleLogoSelect = async (file: File) => {
        try {
            await uploadLogo.mutateAsync(file);
            toast.success('Logo updated');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Logo upload failed');
        }
    };

    if (isLoading) {
        return (
            <OrganizerLayout title="Organization Profile" breadcrumb={['Organizer']}>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </OrganizerLayout>
        );
    }

    return (
        <OrganizerLayout title="Organization Profile" breadcrumb={['Organizer']}>
            <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
                <div className="rounded-2xl bg-gradient-card border border-border/60 p-6 flex items-center gap-5">
                    <div className="w-20 h-20 rounded-xl bg-secondary/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {profile?.logoUrl ? (
                            <img src={profile.logoUrl} alt="Organization logo" className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoSelect(f); e.target.value = ''; }}
                        />
                        <Button type="button" variant="outline" size="sm" disabled={uploadLogo.isPending} onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-4 h-4 mr-1.5" /> {uploadLogo.isPending ? 'Uploading...' : 'Upload Logo'}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG, or WebP. Max 3 MB.</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-gradient-card border border-border/60 p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Organization Name</Label>
                            <Input {...register('orgName')} />
                            {errors.orgName && <p className="text-xs text-destructive">{errors.orgName.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Organization Type</Label>
                            <Select value={watch('orgType')} onValueChange={(v) => setValue('orgType', v, { shouldDirty: true })}>
                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent>
                                    {ORG_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.orgType && <p className="text-xs text-destructive">{errors.orgType.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Bio</Label>
                        <Textarea {...register('bio')} rows={4} placeholder="Tell attendees about your organization (markdown supported)" />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Website</Label>
                        <Input {...register('website')} placeholder="https://" />
                        {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Contact Email</Label>
                            <Input type="email" {...register('contactEmail')} />
                            {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Contact Phone</Label>
                            <Input {...register('contactPhone')} />
                            {errors.contactPhone && <p className="text-xs text-destructive">{errors.contactPhone.message}</p>}
                        </div>
                    </div>
                </div>

                <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </OrganizerLayout>
    );
}
