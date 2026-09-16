import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { AdminSidebar } from "./components/layout/AdminSidebar";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { MarketProvider } from "./context/MarketContext";
import { SettingsProvider } from "./context/SettingsContext";
import { useAuth } from "./hooks/useAuth";
import { useSettings } from "./context/SettingsContext";
import { SocketProvider } from "./context/SocketContext";
import { CryptoLoader } from "./components/ui/CryptoLoader";

import { lazy, Suspense } from "react";

// Auth Pages
const Login = lazy(() =>
  import("./pages/auth/Login").then((m) => ({ default: m.Login })),
);
const Register = lazy(() =>
  import("./pages/auth/Register").then((m) => ({ default: m.Register })),
);
const ForgotPassword = lazy(() =>
  import("./pages/auth/ForgotPassword").then((m) => ({
    default: m.ForgotPassword,
  })),
);
const AdminLogin = lazy(() =>
  import("./pages/auth/AdminLogin").then((m) => ({ default: m.AdminLogin })),
);
const AdminRegister = lazy(() =>
  import("./pages/auth/AdminRegister").then((m) => ({
    default: m.AdminRegister,
  })),
);

// Dashboard Pages
const Overview = lazy(() =>
  import("./pages/dashboard/Overview").then((m) => ({ default: m.Overview })),
);
const Portfolio = lazy(() =>
  import("./pages/dashboard/Portfolio").then((m) => ({ default: m.Portfolio })),
);
const Plans = lazy(() =>
  import("./pages/dashboard/Plans").then((m) => ({ default: m.Plans })),
);
const Deposit = lazy(() =>
  import("./pages/dashboard/Deposit").then((m) => ({ default: m.Deposit })),
);
const Withdraw = lazy(() =>
  import("./pages/dashboard/Withdraw").then((m) => ({ default: m.Withdraw })),
);
const Settings = lazy(() =>
  import("./pages/dashboard/Settings").then((m) => ({ default: m.Settings })),
);
const Support = lazy(() =>
  import("./pages/dashboard/Support").then((m) => ({ default: m.Support })),
);

// Admin Pages
const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const Deposits = lazy(() =>
  import("./pages/admin/Deposits").then((m) => ({ default: m.Deposits })),
);
const Withdrawals = lazy(() =>
  import("./pages/admin/Withdrawals").then((m) => ({ default: m.Withdrawals })),
);
const Users = lazy(() =>
  import("./pages/admin/Users").then((m) => ({ default: m.Users })),
);
const Wallets = lazy(() =>
  import("./pages/admin/Wallets").then((m) => ({ default: m.Wallets })),
);
const AdminPlans = lazy(() =>
  import("./pages/admin/Plans").then((m) => ({ default: m.Plans })),
);
const AdminSettings = lazy(() =>
  import("./pages/admin/AdminSettings").then((m) => ({
    default: m.AdminSettings,
  })),
);
const AdminTickets = lazy(() =>
  import("./pages/admin/AdminTickets").then((m) => ({
    default: m.AdminTickets,
  })),
);
const Maintenance = lazy(() =>
  import("./pages/Maintenance").then((m) => ({ default: m.Maintenance })),
);
const AdminInvestments = lazy(() =>
  import("./pages/admin/Investments").then((m) => ({ default: m.Investments })),
);
const ManageUsers = lazy(() =>
  import("./pages/admin/ManageUsers").then((m) => ({ default: m.ManageUsers })),
);
const Admins = lazy(() =>
  import("./pages/admin/Admins").then((m) => ({ default: m.Admins })),
);

const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar
        onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      <div className="flex flex-1 pt-16 overflow-hidden">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar
        onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      <div className="flex flex-1 pt-16 overflow-hidden">
        <AdminSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();

  // Dynamic Title
  useEffect(() => {
    if (settings?.platformName) {
      document.title = settings.platformName;
    }
  }, [settings?.platformName]);

  if (authLoading || settingsLoading) {
    return <CryptoLoader />;
  }

  // Handle Maintenance Mode
  const isMaintenance = settings.maintenanceMode;
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white font-sans antialiased selection:bg-crypto-accent/30">
      <Suspense fallback={<CryptoLoader />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Auth Routes */}
          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route
              path="register"
              element={
                isMaintenance && !isAdmin ? (
                  <Navigate to="/maintenance" replace />
                ) : (
                  <Register />
                )
              }
            />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="gulu-gulu/maal-ki-malik" element={<AdminRegister />} />
          </Route>

          <Route
            path="/maintenance"
            element={
              isMaintenance && !isAdmin ? (
                <Maintenance />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* User Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                isMaintenance && !isAdmin ? (
                  <Navigate to="/maintenance" replace />
                ) : (
                  <DashboardLayout />
                )
              }
            >
              <Route path="/dashboard" element={<Overview />} />
              <Route path="/dashboard/portfolio" element={<Portfolio />} />
              <Route path="/dashboard/plans" element={<Plans />} />
              <Route path="/dashboard/deposit" element={<Deposit />} />
              <Route path="/dashboard/withdraw" element={<Withdraw />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/support" element={<Support />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="deposits" element={<Deposits />} />
              <Route path="withdrawals" element={<Withdrawals />} />
              <Route path="users" element={<Users />} />
              <Route path="maal-pasand-nhi-aayi" element={<Admins />} />
              <Route path="manage-users" element={<ManageUsers />} />
              <Route path="wallets" element={<Wallets />} />
              <Route path="investments" element={<AdminInvestments />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="settings" element={<AdminSettings />} />
              {/* Admin uses Settings page to config support, so no separate support page needed here unless requested */}
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <AuthProvider>
      <MarketProvider>
        <SocketProvider>
          <SettingsProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#121419",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  fontSize: "14px",
                },
              }}
            />
          </SettingsProvider>
        </SocketProvider>
      </MarketProvider>
    </AuthProvider>
  );
}
