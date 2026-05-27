import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "./pages/Landing.tsx";
import Welcome from "./pages/Welcome.tsx";
import NotFound from "./pages/NotFound.tsx";

// Auth
import SignUp from "./pages/auth/SignUp.tsx";
import Login from "./pages/auth/Login.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import ProfileSetup from "./pages/auth/ProfileSetup.tsx";

// Web (desktop) app
import { WebShell } from "./components/WebShell";
import WebDashboard from "./pages/web/WebDashboard.tsx";
import WebSubjects from "./pages/web/WebSubjects.tsx";
import WebTopic from "./pages/web/WebTopic.tsx";
import WebTutor from "./pages/web/WebTutor.tsx";
import WebLeaderboard from "./pages/web/WebLeaderboard.tsx";
import WebProfile from "./pages/web/WebProfile.tsx";

// Past Questions
import PastQuestionsExams from "./pages/web/PastQuestionsExams.tsx";
import PastQuestionsYears from "./pages/web/PastQuestionsYears.tsx";
import PastQuestionsList from "./pages/web/PastQuestionsList.tsx";
import PastQuestionDetail from "./pages/web/PastQuestionDetail.tsx";
import PastQuestionExplanation from "./pages/web/PastQuestionExplanation.tsx";

// Quiz + Exam
import QuizSetup from "./pages/web/QuizSetup.tsx";
import QuizReview from "./pages/web/QuizReview.tsx";
import QuizResults from "./pages/web/QuizResults.tsx";
import ExamSetup from "./pages/web/ExamSetup.tsx";
import ExamResults from "./pages/web/ExamResults.tsx";

// Gamification + Social
import Achievements from "./pages/web/Achievements.tsx";
import Battles from "./pages/web/Battles.tsx";
import BattleLive from "./pages/web/BattleLive.tsx";
import BattleResult from "./pages/web/BattleResult.tsx";
import StudyPlan from "./pages/web/StudyPlan.tsx";
import StudyPlanToday from "./pages/web/StudyPlanToday.tsx";
import Community from "./pages/web/Community.tsx";
import CommunityChat from "./pages/web/CommunityChat.tsx";

// Inbox
import Notifications from "./pages/web/Notifications.tsx";
import Activity from "./pages/web/Activity.tsx";

// Payments + Settings
import Pricing from "./pages/web/Pricing.tsx";
import Checkout from "./pages/web/Checkout.tsx";
import CheckoutSuccess from "./pages/web/CheckoutSuccess.tsx";
import CheckoutFailed from "./pages/web/CheckoutFailed.tsx";
import Settings from "./pages/web/Settings.tsx";
import SettingsAccount from "./pages/web/SettingsAccount.tsx";
import SettingsNotifications from "./pages/web/SettingsNotifications.tsx";
import SettingsPrivacy from "./pages/web/SettingsPrivacy.tsx";
import SettingsSubscription from "./pages/web/SettingsSubscription.tsx";

// Playground
import Playground from "./pages/web/Playground.tsx";
import MathSolver from "./pages/web/MathSolver.tsx";
import Graphing from "./pages/web/Graphing.tsx";
import PhysicsSim from "./pages/web/PhysicsSim.tsx";
import ChemistryVis from "./pages/web/ChemistryVis.tsx";

// Admin
import { AdminShell } from "./components/AdminShell";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminQuestions from "./pages/admin/AdminQuestions.tsx";
import AdminQuestionsUpload from "./pages/admin/AdminQuestionsUpload.tsx";
import AdminExams from "./pages/admin/AdminExams.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminContent from "./pages/admin/AdminContent.tsx";
import AdminGamification from "./pages/admin/AdminGamification.tsx";

// Shared full-screen flows
import Quiz from "./pages/Quiz.tsx";
import ExamSimulation from "./pages/ExamSimulation.tsx";

// Mobile prototype gallery
import MobileGallery from "./pages/MobileGallery.tsx";
import { MobileShell } from "./components/MobileShell";
import Dashboard from "./pages/Dashboard.tsx";
import Subjects from "./pages/Subjects.tsx";
import Topic from "./pages/Topic.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import Tutor from "./pages/Tutor.tsx";
import Profile from "./pages/Profile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Marketing */}
            <Route path="/" element={<Landing />} />
            <Route path="/welcome" element={<Welcome />} />

            {/* Auth (public) */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarded={false}>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />

            {/* Full-screen flows */}
            <Route path="/app/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/app/exam" element={<ProtectedRoute><ExamSimulation /></ProtectedRoute>} />
            <Route path="/app/battles/live" element={<ProtectedRoute><BattleLive /></ProtectedRoute>} />
            <Route path="/app/battles/result" element={<ProtectedRoute><BattleResult /></ProtectedRoute>} />
            <Route path="/app/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
            <Route path="/app/checkout/failed" element={<ProtectedRoute><CheckoutFailed /></ProtectedRoute>} />

            {/* Desktop web app (protected) */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <WebShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<WebDashboard />} />
              <Route path="subjects" element={<WebSubjects />} />
              <Route path="subjects/:subjectId" element={<WebTopic />} />
              <Route path="tutor" element={<WebTutor />} />
              <Route path="leaderboard" element={<WebLeaderboard />} />
              <Route path="profile" element={<WebProfile />} />

              {/* Past Questions */}
              <Route path="past-questions" element={<PastQuestionsExams />} />
              <Route path="past-questions/:exam" element={<PastQuestionsYears />} />
              <Route path="past-questions/:exam/:year" element={<PastQuestionsList />} />
              <Route path="past-questions/:exam/:year/:qid" element={<PastQuestionDetail />} />
              <Route path="past-questions/:exam/:year/:qid/explanation" element={<PastQuestionExplanation />} />

              {/* Quiz + Exam */}
              <Route path="quiz/setup" element={<QuizSetup />} />
              <Route path="quiz/review" element={<QuizReview />} />
              <Route path="quiz/results" element={<QuizResults />} />
              <Route path="exam/setup" element={<ExamSetup />} />
              <Route path="exam/results" element={<ExamResults />} />

              {/* Gamification + Social */}
              <Route path="achievements" element={<Achievements />} />
              <Route path="battles" element={<Battles />} />
              <Route path="study-plan" element={<StudyPlan />} />
              <Route path="study-plan/today" element={<StudyPlanToday />} />
              <Route path="community" element={<Community />} />
              <Route path="community/:groupId" element={<CommunityChat />} />

              {/* Inbox */}
              <Route path="notifications" element={<Notifications />} />
              <Route path="activity" element={<Activity />} />

              {/* Payments */}
              <Route path="pricing" element={<Pricing />} />
              <Route path="checkout" element={<Checkout />} />

              {/* Settings */}
              <Route path="settings" element={<Settings />} />
              <Route path="settings/account" element={<SettingsAccount />} />
              <Route path="settings/notifications" element={<SettingsNotifications />} />
              <Route path="settings/privacy" element={<SettingsPrivacy />} />
              <Route path="settings/subscription" element={<SettingsSubscription />} />

              {/* Playground */}
              <Route path="playground" element={<Playground />} />
              <Route path="playground/math-solver" element={<MathSolver />} />
              <Route path="playground/graphing" element={<Graphing />} />
              <Route path="playground/physics" element={<PhysicsSim />} />
              <Route path="playground/chemistry" element={<ChemistryVis />} />
            </Route>

            {/* Admin Panel */}
            <Route path="/admin" element={<ProtectedRoute><AdminShell /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="questions" element={<AdminQuestions />} />
              <Route path="questions/upload" element={<AdminQuestionsUpload />} />
              <Route path="exams" element={<AdminExams />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="gamification" element={<AdminGamification />} />
            </Route>

            {/* Mobile prototype */}
            <Route path="/m" element={<MobileGallery />} />
            <Route path="/m/quiz" element={<Quiz />} />
            <Route path="/m/exam" element={<ExamSimulation />} />
            <Route path="/m/app" element={<MobileShell />}>
              <Route index element={<Dashboard />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="subjects/:subjectId" element={<Topic />} />
              <Route path="tutor" element={<Tutor />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
