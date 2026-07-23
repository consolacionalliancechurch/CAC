import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Activities from '@/pages/Activities';
import Celebrations from '@/pages/Celebrations';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import WorshipSchedule from '@/pages/WorshipSchedule';
import PrayerMeeting from '@/pages/PrayerMeeting';
import SermonArchive from '@/pages/SermonArchive';
import Vlogs from '@/pages/Vlogs';
import SuperAdmin from '@/pages/admin/SuperAdmin';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 rounded-full border-slate-200 border-t-slate-800 animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      {/* Admin-only login — not linked anywhere in the UI, access via direct URL */}
      <Route path="/admin-login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public routes — no auth required */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/worship-schedule" element={<WorshipSchedule />} />
        <Route path="/prayer-meeting" element={<PrayerMeeting />} />
        <Route path="/prayer-request" element={<PrayerMeeting />} />
        <Route path="/sermons" element={<SermonArchive />} />
        <Route path="/vlogs" element={<Vlogs />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/celebrations" element={<Celebrations />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Admin panel — protected, but still inside AppLayout */}
        <Route path="/super-admin" element={<ProtectedRoute><SuperAdmin /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;