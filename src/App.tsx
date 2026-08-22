import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { Analytics } from "@vercel/analytics/react";

// Existing site pages
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CodeOfConduct from "./pages/CodeOfConduct";
import Disclaimer from "./pages/Disclaimer";
import Accessibility from "./pages/Accessibility";
import CookiePolicy from "./pages/CookiePolicy";
import JoinUs from "./pages/JoinUs";
import PartnersPage from "./pages/PartnersPage";
import Blog from "./pages/Blog";
import Newsletter from "./pages/Newsletter";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";
import AppComingSoon from "./pages/AppComingSoon";
import CareersPage from "./pages/careers/CareersPage";
import RoleDetailPage from "./pages/careers/RoleDetailPage";
import ApplyPage from "./pages/careers/ApplyPage";
import CareersAdmin from "./pages/admin/CareersAdmin";
import ChallengePage from "./pages/careers/ChallengePage";
import InterviewPage from "./pages/careers/InterviewPage";
import MailCenter from "./pages/admin/MailCenter";

// Ambassador platform pages
import AmbassadorLanding from "./pages/ambassador/AmbassadorLanding";
import LoginPage from "./pages/auth/LoginPage";
import AmbassadorApplyPage from "./pages/auth/AmbassadorApplyPage";
import PendingApprovalPage from "./pages/auth/PendingApprovalPage";
import SignupGeneralPage from "./pages/auth/SignupGeneralPage";
import AmbassadorDashboard from "./pages/dashboard/AmbassadorDashboard";
import ReferralLanding from "./pages/referral/ReferralLanding";
import LeaderboardPage from "./pages/leaderboard/LeaderboardPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AccountPage from "./pages/profile/AccountPage";
import ExternalVerificationPage from "./pages/admin/ExternalVerificationPage";

// Events platform pages
import EventsListPage from "./pages/events/EventsListPage";
import EventDetailPage from "./pages/events/EventDetailPage";
import EventRegisterPage from "./pages/events/EventRegisterPage";
import EventTicketPage from "./pages/events/EventTicketPage";
import OrganizerApplyPage from "./pages/events/OrganizerApplyPage";
import CollaboratorAcceptPage from "./pages/events/CollaboratorAcceptPage";
import OrganizerDashboardPage from "./pages/events/organizer/OrganizerDashboardPage";
import MyEventsPage from "./pages/events/organizer/MyEventsPage";
import OrganizationProfilePage from "./pages/events/organizer/OrganizationProfilePage";
import EventWizard from "./pages/events/organizer/wizard/EventWizard";
import EventOverviewPage from "./pages/events/organizer/EventOverviewPage";
import EventRoundsListPage from "./pages/events/organizer/EventRoundsListPage";
import EventSettingsPage from "./pages/events/organizer/EventSettingsPage";
import CommunicationsPage from "./pages/events/organizer/CommunicationsPage";
import AnalyticsPage from "./pages/events/organizer/AnalyticsPage";
import OrganizerRegistrationsPage from "./pages/events/organizer/OrganizerRegistrationsPage";
import OrganizerCheckinPage from "./pages/events/organizer/OrganizerCheckinPage";
import OrganizerRoundSubmissionsPage from "./pages/events/organizer/OrganizerRoundSubmissionsPage";
import EvaluatorsPage from "./pages/events/organizer/EvaluatorsPage";
import EvaluatorPortalPage from "./pages/evaluate/EvaluatorPortalPage";
import EarningsPage from "./pages/events/organizer/EarningsPage";
import PayoutSettingsPage from "./pages/events/organizer/PayoutSettingsPage";
import RoundSubmitPage from "./pages/events/RoundSubmitPage";
import EventsAdmin from "./pages/admin/EventsAdmin";
import AdminEventDetail from "./pages/admin/AdminEventDetail";
import AdminPayoutsPage from "./pages/admin/AdminPayoutsPage";
import AdminPayoutDetailPage from "./pages/admin/AdminPayoutDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Analytics />
        <BrowserRouter>
          <Routes>
            {/* ── Main Site ─────────────────────────────────────── */}
            <Route path="/" element={<Index />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/partners" element={<PartnersPage />} />
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
            <Route path="/app" element={<AppComingSoon />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/careers/:slug" element={<RoleDetailPage />} />
            <Route path="/careers/:slug/apply" element={<ApplyPage />} />
            <Route path="/careers/challenge/:token" element={<ChallengePage />} />
            <Route path="/careers/interview/:token" element={<InterviewPage />} />

            {/* ── Events Platform ───────────────────────────────── */}
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/organizers/apply" element={<OrganizerApplyPage />} />
            <Route path="/events/collaborator/accept" element={
              <ProtectedRoute><CollaboratorAcceptPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer" element={
              <ProtectedRoute><OrganizerDashboardPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/events" element={
              <ProtectedRoute><MyEventsPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/profile" element={
              <ProtectedRoute><OrganizationProfilePage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/earnings" element={
              <ProtectedRoute><EarningsPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/payout-settings" element={
              <ProtectedRoute><PayoutSettingsPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/new" element={
              <ProtectedRoute><EventWizard /></ProtectedRoute>
            } />
            <Route path="/events/organizer/:id/edit" element={
              <ProtectedRoute><EventWizard /></ProtectedRoute>
            } />
            <Route path="/events/organizer/:id/registrations" element={
              <ProtectedRoute><OrganizerRegistrationsPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/:id/checkin" element={
              <ProtectedRoute><OrganizerCheckinPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/:id/rounds/:roundId" element={
              <ProtectedRoute><OrganizerRoundSubmissionsPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/:id/rounds/:roundId/evaluators" element={
              <ProtectedRoute><EvaluatorsPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/:id/rounds" element={
              <ProtectedRoute><EventRoundsListPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/:id/communications" element={
              <ProtectedRoute><CommunicationsPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/:id/analytics" element={
              <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/:id/settings" element={
              <ProtectedRoute><EventSettingsPage /></ProtectedRoute>
            } />
            <Route path="/events/organizer/:id" element={
              <ProtectedRoute><EventOverviewPage /></ProtectedRoute>
            } />
            <Route path="/evaluate" element={<EvaluatorPortalPage />} />
            <Route path="/events/ticket/:token/rounds/:roundId" element={<RoundSubmitPage />} />
            <Route path="/events/ticket/:token" element={<EventTicketPage />} />
            {/* Slug routes last — anything not matched above falls through here */}
            <Route path="/events/:slug/register" element={
              <ProtectedRoute><EventRegisterPage /></ProtectedRoute>
            } />
            <Route path="/events/:slug" element={<EventDetailPage />} />

            {/* ── Ambassador Platform (all under /ambassador) ───── */}
            {/* Landing page */}
            <Route path="/ambassador" element={<AmbassadorLanding />} />

            {/* Auth — one login for everyone; /ambassador/login is a legacy alias */}
            <Route path="/ambassador/login" element={<Navigate to="/login" replace />} />
            <Route path="/staff-login" element={<LoginPage variant="staff" />} />
            <Route path="/ambassador/apply" element={<AmbassadorApplyPage />} />
            <Route path="/ambassador/signup" element={<Navigate to="/ambassador/apply" replace />} />
            <Route path="/ambassador/pending" element={<PendingApprovalPage />} />
            <Route path="/ambassador/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected ambassador pages */}
            <Route path="/ambassador/dashboard" element={
              <ProtectedRoute><AmbassadorDashboard /></ProtectedRoute>
            } />
            <Route path="/ambassador/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/ambassador/admin" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />
            <Route path="/ambassador/admin/external-verification" element={
              <AdminRoute><ExternalVerificationPage /></AdminRoute>
            } />
            <Route path="/ambassador/admin/careers" element={
              <AdminRoute><CareersAdmin /></AdminRoute>
            } />
            <Route path="/ambassador/admin/events" element={
              <AdminRoute><EventsAdmin /></AdminRoute>
            } />
            <Route path="/ambassador/admin/events/:id" element={
              <AdminRoute><AdminEventDetail /></AdminRoute>
            } />
            <Route path="/ambassador/admin/payouts" element={
              <AdminRoute><AdminPayoutsPage /></AdminRoute>
            } />
            <Route path="/ambassador/admin/payouts/:organizerId" element={
              <AdminRoute><AdminPayoutDetailPage /></AdminRoute>
            } />
            <Route path="/ambassador/admin/mail" element={
              <AdminRoute><MailCenter /></AdminRoute>
            } />

            {/* Public pages */}
            <Route path="/ambassador/leaderboard" element={<LeaderboardPage />} />

            {/* Referral links — kept short intentionally for sharing */}
            <Route path="/ref/:code" element={<ReferralLanding />} />

            {/* General account access — works for anyone, not just ambassadors */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupGeneralPage />} />
            <Route path="/home" element={
              <ProtectedRoute><HomePage /></ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute><AccountPage /></ProtectedRoute>
            } />

            {/* Legacy redirects — in case bookmarks exist */}
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
  </ThemeProvider>
);

export default App;
