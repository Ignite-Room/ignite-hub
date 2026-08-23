import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, redirectPathForUser } from '@/lib/auth-context';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

// Gates the public marketing homepage ("/"). A logged-in visitor is bound to their
// dashboard as the site's real "home" — reloading, hitting back, or landing on "/"
// from a stale bookmark all resolve to their dashboard instead of the landing page,
// the same pattern Unstop and similar platforms use. Logged-out visitors see the
// landing page as normal.
export function LandingRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthenticated && user) {
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
