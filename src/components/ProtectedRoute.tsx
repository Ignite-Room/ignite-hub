import { Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { useAuth, redirectPathForUser } from '@/lib/auth-context';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

// Gates the public marketing homepage ("/"). A logged-in visitor is bound to their
// dashboard as the site's real "home" for reload/back-button navigation — but can
// still explicitly click through to view the landing page (e.g. the navbar's Home
// link), since that's a normal in-app link click, not a reload or back operation.
//
// React Router reports the navigation "action" for a route change: 'POP' covers a
// fresh page load, a hard reload, and browser back/forward; 'PUSH' covers a normal
// in-app navigate()/<Link> click. Redirecting only on 'POP' means a click to "/"
// stays on the landing page, while reloading or going back to "/" lands on the
// dashboard, matching the requested Unstop-style behavior exactly.
export function LandingRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth();
    const navigationType = useNavigationType();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthenticated && user && navigationType === 'POP') {
        return <Navigate to={redirectPathForUser(user)} replace />;
    }

    return <>{children}</>;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

export function AdminRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
}

// Gates the /events/organizer/* pages — an approved Partner (organizer) profile
// is a separate privilege from any User.role, so this checks partnerStatus rather
// than role. Without this, a non-partner hitting these routes previously fell
// through to a page that silently spins forever on a 403 from the backend.
export function PartnerRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.partnerStatus !== 'APPROVED') {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
}
