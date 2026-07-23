import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth, LoginOutcome } from '@/lib/auth-context';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

interface GoogleSignInButtonProps {
    onError: (message: string) => void;
    onSuccess: (outcome: LoginOutcome) => void;
}

function GoogleSignInInner({ onError, onSuccess }: GoogleSignInButtonProps) {
    const { loginWithGoogle } = useAuth();

    return (
        <>
            <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                <div className="h-px flex-1 bg-border/50" />
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        if (!credentialResponse.credential) {
                            onError('Google sign-in did not return a valid credential.');
                            return;
                        }
                        try {
                            const outcome = await loginWithGoogle(credentialResponse.credential);
                            onSuccess(outcome);
                        } catch (e) {
                            onError(e instanceof Error ? e.message : 'Google sign-in failed');
                        }
                    }}
                    onError={() => onError('Google sign-in failed')}
                    theme="filled_black"
                    shape="pill"
                    width="320"
                />
            </div>
        </>
    );
}

// Renders nothing when VITE_GOOGLE_CLIENT_ID isn't configured — the regular
// email/password form stays fully functional either way.
export default function GoogleSignInButton(props: GoogleSignInButtonProps) {
    if (!GOOGLE_CLIENT_ID) return null;

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleSignInInner {...props} />
        </GoogleOAuthProvider>
    );
}
