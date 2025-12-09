// App Router - All routes with guards
import { Routes, Route, Navigate } from "react-router-dom";

// Route guards
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

// Marketing pages
import LandingPage from "../pages/marketing/LandingPage";
import FeaturesPage from "../pages/marketing/FeaturesPage";

// Auth pages
import AuthPage from "../pages/auth/AuthPage";

// App pages
import AppLayout from "../components/layout/AppLayout";
import ChatsPage from "../pages/app/ChatsPage";
import ChatPage from "../pages/app/ChatPage";
import StatusPage from "../pages/app/StatusPage";
import CallsPage from "../pages/app/CallsPage";
import SettingsPage from "../pages/app/SettingsPage";
import UserSearchPage from "../pages/app/UserSearchPage";
import AIChatPage from "../pages/app/AIChatPage";

// Legal & Support pages
import HelpPage from "../pages/support/HelpPage";
import PrivacyPage from "../pages/legal/PrivacyPage";
import TermsPage from "../pages/legal/TermsPage";

// Admin pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminUserDetailPage from "../pages/admin/AdminUserDetailPage";

const AppRouter = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Legal public routes */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/help" element={<HelpPage />} />

            {/* Protected app routes */}
            <Route
                path="/app"
                element={
                    <PrivateRoute>
                        <AppLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Navigate to="/app/chats" replace />} />
                <Route path="chats" element={<ChatsPage />} />
                <Route path="chats/:chatId" element={<ChatPage />} />
                <Route path="status" element={<StatusPage />} />
                <Route path="calls" element={<CallsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="search" element={<UserSearchPage />} />
                <Route path="ai" element={<AIChatPage />} />
            </Route>

            {/* Admin routes */}
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminDashboardPage />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <AdminRoute>
                        <AdminUsersPage />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/user/:uid"
                element={
                    <AdminRoute>
                        <AdminUserDetailPage />
                    </AdminRoute>
                }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;
