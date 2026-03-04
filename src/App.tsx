import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

// Existing site pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CodeOfConduct from "./pages/CodeOfConduct";
import Disclaimer from "./pages/Disclaimer";
import Accessibility from "./pages/Accessibility";
import CookiePolicy from "./pages/CookiePolicy";
import JoinUs from "./pages/JoinUs";
import Blog from "./pages/Blog";
import Newsletter from "./pages/Newsletter";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";

// Ambassador platform pages
import AmbassadorLanding from "./pages/ambassador/AmbassadorLanding";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import PendingApprovalPage from "./pages/auth/PendingApprovalPage";
import AmbassadorDashboard from "./pages/dashboard/AmbassadorDashboard";
import ReferralLanding from "./pages/referral/ReferralLanding";
import LeaderboardPage from "./pages/leaderboard/LeaderboardPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ── Main Site ─────────────────────────────────────── */}
            <Route path="/" element={<Index />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/code-of-conduct" element={<CodeOfConduct />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />

            {/* ── Ambassador Platform (all under /ambassador) ───── */}
            {/* Landing page */}
            <Route path="/ambassador" element={<AmbassadorLanding />} />

            {/* Auth */}
            <Route path="/ambassador/login" element={<LoginPage />} />
            <Route path="/ambassador/signup" element={<SignupPage />} />
            <Route path="/ambassador/pending" element={<PendingApprovalPage />} />

            {/* Protected ambassador pages */}
            <Route path="/ambassador/dashboard" element={
              <ProtectedRoute><AmbassadorDashboard /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/ambassador/admin" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />

            {/* Public pages */}
            <Route path="/ambassador/leaderboard" element={<LeaderboardPage />} />

            {/* Referral links — kept short intentionally for sharing */}
            <Route path="/ref/:code" element={<ReferralLanding />} />

            {/* Legacy redirects — in case bookmarks exist */}
            <Route path="/login" element={<Navigate to="/ambassador/login" replace />} />
            <Route path="/signup" element={<Navigate to="/ambassador/signup" replace />} />
            <Route path="/dashboard" element={<Navigate to="/ambassador/dashboard" replace />} />
            <Route path="/leaderboard" element={<Navigate to="/ambassador/leaderboard" replace />} />
            <Route path="/admin" element={<Navigate to="/ambassador/admin" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
