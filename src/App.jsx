// import { useState, useEffect } from "react";
// import LandingPage from "./pages/LandingPage.jsx";
// import Login from "./components/Login.jsx";
// import Register from "./components/Register.jsx";
// import Dashboard from "./components/Dashboard.jsx";
// import UserProfile from "./components/UserProfile.jsx";
// import CertificatesPage from "./components/CertificatesPage.jsx";
// import ExamStatusPage from "./components/ExamStatusPage.jsx";
// import AdminPanel from "./components/AdminPanel.jsx";
// import InstructorPanel from "./components/InstructorPanel.jsx";
// import ExamGenerator from "./components/ExamGenerator.jsx";
// import ExamInterface from "./components/ExamInterface.jsx";
// import ExamResults from "./components/ExamResults.jsx";
// import SkillsPage from "./components/SkillsPage.jsx";
// import LeaderboardPage from "./components/LeaderboardPage.jsx";
// import AnalyticsPage from "./components/AnalyticsPage.jsx";
// import AchievementsPage from "./components/AchievementsPage.jsx";
// import Header from "./components/Header.jsx";
// import Chatbot from "./components/Chatbot.jsx";

// function App() {
//   const [currentPage, setCurrentPage] = useState("landing");
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [examData, setExamData] = useState(null);
//   const [examResults, setExamResults] = useState(null);

//   // Restore session on reload
//   useEffect(() => {
//     try {
//       const savedUser = localStorage.getItem("skillforge_user");
//       const savedAuth = localStorage.getItem("skillforge_auth");

//       if (savedUser && savedAuth === "true") {
//         const parsedUser = JSON.parse(savedUser);

//         // Validate saved data
//         if (parsedUser?.email) {
//           setUser(parsedUser);
//           setIsAuthenticated(true);
//           setCurrentPage("dashboard");
//         }
//       }
//     } catch (error) {
//       console.error("Session restore failed:", error);
//       localStorage.removeItem("skillforge_user");
//       localStorage.removeItem("skillforge_auth");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // Navigation helpers
//   const goToLogin = () => setCurrentPage("login");
//   const goToRegister = () => setCurrentPage("register");
//   const goToLanding = () => setCurrentPage("landing");
//   const goToDashboard = () => setCurrentPage("dashboard");

//   // FIXED LOGIN HANDLER
//   const handleLogin = (userData) => {
//     // prevent login if authentication failed
//     if (!userData || !userData.email) {
//       console.warn("Login rejected — invalid user data");
//       return;
//     }

//     try {
//       setUser(userData);
//       setIsAuthenticated(true);

//       // Role-based redirect
//       if (userData.role === "admin") {
//         setCurrentPage("admin");
//       } else if (userData.role === "instructor") {
//         setCurrentPage("instructor");
//       } else {
//         setCurrentPage("dashboard");
//       }

//       // Persist session
//       localStorage.setItem("skillforge_user", JSON.stringify(userData));
//       localStorage.setItem("skillforge_auth", "true");
//     } catch (error) {
//       console.error("User session store failed:", error);
//     }
//   };

//   // Register handler
//   const handleRegister = (userData) => {
//     if (!userData?.email) return;

//     try {
//       setUser(userData);
//       setIsAuthenticated(true);
//       setCurrentPage("dashboard");
//       localStorage.setItem("skillforge_user", JSON.stringify(userData));
//       localStorage.setItem("skillforge_auth", "true");
//     } catch (error) {
//       console.error("Register error:", error);
//     }
//   };

//   // Profile update handler
//   const handleUpdateUser = (updatedUser) => {
//     try {
//       setUser(updatedUser);
//       localStorage.setItem("skillforge_user", JSON.stringify(updatedUser));
//     } catch (error) {
//       console.error("Profile update error:", error);
//     }
//   };

//   // Logout
//   const handleLogout = () => {
//     try {
//       setUser(null);
//       setIsAuthenticated(false);
//       setCurrentPage("landing");
//       setExamData(null);
//       setExamResults(null);
//       localStorage.removeItem("skillforge_user");
//       localStorage.removeItem("skillforge_auth");
//       localStorage.removeItem("skillforge_token");
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   // Exam handlers
//   const handleStartExam = (data) => {
//     setExamData(data);
//     setCurrentPage("exam");
//   };

//   const handleExamComplete = (results) => {
//     setExamResults(results);
//     setCurrentPage("results");
//   };

//   const handleRetakeExam = () => {
//     setExamResults(null);
//     setCurrentPage("exam-generator");
//   };

//   const handleGenerateExamFromSkill = () => {
//     setCurrentPage("exam-generator");
//   };

//   // Loading screen
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600 font-medium">Loading SkillForge AI...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Show Header when logged out */}
//       {!isAuthenticated && (
//         <Header
//           goToLogin={goToLogin}
//           goToRegister={goToRegister}
//           user={user}
//           onLogout={handleLogout}
//         />
//       )}

//       {/* Public Routes */}
//       {currentPage === "landing" && !isAuthenticated && (
//         <LandingPage goToLogin={goToLogin} goToRegister={goToRegister} />
//       )}

//       {currentPage === "login" && !isAuthenticated && (
//         <Login
//           goToRegister={goToRegister}
//           goToLanding={goToLanding}
//           onLogin={handleLogin}
//         />
//       )}

//       {currentPage === "register" && !isAuthenticated && (
//         <Register
//           goToLogin={goToLogin}
//           goToLanding={goToLanding}
//           onRegister={handleRegister}
//         />
//       )}

//       {/* Protected Routes */}
//       {currentPage === "dashboard" && isAuthenticated && (
//         <Dashboard
//           user={user}
//           onLogout={handleLogout}
//           onNavigate={setCurrentPage}
//         />
//       )}

//       {currentPage === "profile" && isAuthenticated && (
//         <UserProfile
//           user={user}
//           onUpdateUser={handleUpdateUser}
//           onBack={goToDashboard}
//         />
//       )}

//       {currentPage === "certificates" && isAuthenticated && (
//         <CertificatesPage onBack={goToDashboard} />
//       )}

//       {currentPage === "exam-status" && isAuthenticated && (
//         <ExamStatusPage onBack={goToDashboard} onStartExam={handleStartExam} />
//       )}

//       {currentPage === "admin" && isAuthenticated && (
//         <AdminPanel onBack={goToDashboard} />
//       )}

//       {currentPage === "instructor" && isAuthenticated && (
//         <InstructorPanel
//           onBack={goToDashboard}
//           onCreateExam={() => setCurrentPage("exam-generator")}
//         />
//       )}

//       {currentPage === "skills" && isAuthenticated && (
//         <SkillsPage
//           onGenerateExam={handleGenerateExamFromSkill}
//           onBack={goToDashboard}
//         />
//       )}

//       {currentPage === "leaderboard" && isAuthenticated && <LeaderboardPage />}

//       {currentPage === "analytics" && isAuthenticated && <AnalyticsPage />}

//       {currentPage === "achievements" && isAuthenticated && <AchievementsPage />}

//       {currentPage === "exam-generator" && isAuthenticated && (
//         <ExamGenerator onBack={goToDashboard} onStartExam={handleStartExam} />
//       )}

//       {currentPage === "exam" && isAuthenticated && examData && (
//         <ExamInterface
//           examData={examData}
//           onExamComplete={handleExamComplete}
//           onBack={() => setCurrentPage("exam-generator")}
//         />
//       )}

//       {currentPage === "results" && isAuthenticated && examResults && (
//         <ExamResults
//           results={examResults}
//           onRetakeExam={handleRetakeExam}
//           onBackToDashboard={goToDashboard}
//         />
//       )}

//       {/* Chatbot always visible */}
//       <Chatbot />
//     </div>
//   );
// }

// export default App;

import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import UserProfile from "./components/UserProfile.jsx";
import CertificatesPage from "./components/CertificatesPage.jsx";
import ExamStatusPage from "./components/ExamStatusPage.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import InstructorPanel from "./components/InstructorPanel.jsx";
import ExamGenerator from "./components/ExamGenerator.jsx";
import ExamInterface from "./components/ExamInterface.jsx";
import ExamResults from "./components/ExamResults.jsx";
import SkillsPage from "./components/SkillsPage.jsx";
import LeaderboardPage from "./components/LeaderboardPage.jsx";
import AnalyticsPage from "./components/AnalyticsPage.jsx";
import AchievementsPage from "./components/AchievementsPage.jsx";
import CoursesPage from "./components/CoursesPage.jsx";
import ChallengesPage from "./components/ChallengesPage.jsx";
import CareerRoadmapPage from "./components/CareerRoadmapPage.jsx";
import TestimonialsPage from "./components/TestimonialsPage.jsx";
import Header from "./components/Header.jsx";
import Chatbot from "./components/Chatbot.jsx";
import { GamificationNotificationProvider } from "./components/GamificationNotification.jsx";
import { ToastProvider } from "./components/ToastNotification.jsx";
import { RealTimeDataProvider } from "./hooks/useRealTimeData.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [examResults, setExamResults] = useState(null);

  // Restore session on reload
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("skillforge_user");
      const savedAuth = localStorage.getItem("skillforge_auth");

      if (savedUser && savedAuth === "true") {
        const parsedUser = JSON.parse(savedUser);

        // Validate saved data
        if (parsedUser?.email) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          setCurrentPage("dashboard");
        }
      }
    } catch (error) {
      console.error("Session restore failed:", error);
      localStorage.removeItem("skillforge_user");
      localStorage.removeItem("skillforge_auth");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Navigation helpers
  const goToLogin = () => setCurrentPage("login");
  const goToRegister = () => setCurrentPage("register");
  const goToLanding = () => setCurrentPage("landing");
  const goToDashboard = () => setCurrentPage("dashboard");

  // FIXED LOGIN HANDLER
  const handleLogin = (userData) => {
    // prevent login if authentication failed
    if (!userData || !userData.email) {
      console.warn("Login rejected — invalid user data");
      return;
    }

    try {
      setUser(userData);
      setIsAuthenticated(true);

      // Role-based redirect
      if (userData.role === "admin") {
        setCurrentPage("admin");
      } else if (userData.role === "instructor") {
        setCurrentPage("instructor");
      } else {
        setCurrentPage("dashboard");
      }

      // Persist session
      localStorage.setItem("skillforge_user", JSON.stringify(userData));
      localStorage.setItem("skillforge_auth", "true");
    } catch (error) {
      console.error("User session store failed:", error);
    }
  };

  // Register handler
  const handleRegister = (userData) => {
    if (!userData?.email) return;

    try {
      setUser(userData);
      setIsAuthenticated(true);
      setCurrentPage("dashboard");
      localStorage.setItem("skillforge_user", JSON.stringify(userData));
      localStorage.setItem("skillforge_auth", "true");
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  // Profile update handler
  const handleUpdateUser = (updatedUser) => {
    try {
      setUser(updatedUser);
      localStorage.setItem("skillforge_user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  // Logout
  const handleLogout = () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      setCurrentPage("landing");
      setExamData(null);
      setExamResults(null);
      localStorage.removeItem("skillforge_user");
      localStorage.removeItem("skillforge_auth");
      localStorage.removeItem("skillforge_token");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Exam handlers
  const handleStartExam = (data) => {
    setExamData(data);
    setCurrentPage("exam");
  };

  const handleExamComplete = async (results) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      const token = localStorage.getItem('token');
      
      // Debug: Log the full examData to see what's available
      console.log('Full examData object:', examData);
      console.log('examData.skill:', examData?.skill);
      console.log('examData.examMeta?.subject:', examData?.examMeta?.subject);
      
      // Get the skill name from examData - check multiple possible locations
      const skillName = examData?.skill || examData?.examMeta?.subject || examData?.title || examData?.skillName || 'Exam';
      console.log('Final skillName to submit:', skillName);
      
      // Submit exam results to backend
      const response = await fetch(`${API_URL}/api/exams/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skillName: skillName,
          skillId: examData?.skillId || null,
          score: results.score,
          totalQuestions: results.totalQuestions,
          correctAnswers: results.questions?.filter((q, i) => results.answers[i] === q.correctAnswer).length || 0,
          timeSpent: results.timeSpent,
          answers: results.answers,
          passed: results.score >= 70 // Default passing score
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Add certificate info to results if created
        if (data.certificate) {
          results.certificateId = data.certificate;
          results.certificateCreated = true;
        }
        results.passed = data.result?.passed || results.score >= 70;
        
        // Add gamification data to results
        if (data.result?.xpAwarded) {
          results.xpAwarded = data.result.xpAwarded;
          results.leveledUp = data.result.leveledUp;
          results.newLevel = data.result.newLevel;
          results.rank = data.result.rank;
        }
      }
    } catch (error) {
      console.error('Failed to submit exam results:', error);
    }
    
    setExamResults(results);
    setCurrentPage("results");
  };

  const handleRetakeExam = () => {
    setExamResults(null);
    setCurrentPage("exam-generator");
  };

  const handleGenerateExamFromSkill = () => {
    setCurrentPage("exam-generator");
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-20 h-20 border-4 border-violet-100 rounded-full absolute"></div>
            {/* Spinning ring */}
            <div className="w-20 h-20 border-4 border-transparent border-t-violet-600 border-r-violet-600 rounded-full animate-spin"></div>
            {/* Inner logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Skillexa
          </h2>
          <p className="text-gray-500 text-sm mt-2">Loading your learning journey...</p>
          <div className="flex justify-center gap-1 mt-4">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Show Header when logged out */}
      {!isAuthenticated && (
        <Header
          goToLogin={goToLogin}
          goToRegister={goToRegister}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* Public Routes */}
      {currentPage === "landing" && !isAuthenticated && (
        <LandingPage goToLogin={goToLogin} goToRegister={goToRegister} />
      )}

      {currentPage === "login" && !isAuthenticated && (
        <Login
          goToRegister={goToRegister}
          goToLanding={goToLanding}
          onLogin={handleLogin}
        />
      )}

      {currentPage === "register" && !isAuthenticated && (
        <Register
          goToLogin={goToLogin}
          goToLanding={goToLanding}
          onRegister={handleRegister}
        />
      )}

      {/* Protected Routes */}
      {currentPage === "dashboard" && isAuthenticated && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === "profile" && isAuthenticated && (
        <UserProfile
          user={user}
          onUpdateUser={handleUpdateUser}
          onBack={goToDashboard}
        />
      )}

      {currentPage === "certificates" && isAuthenticated && (
        <CertificatesPage onBack={goToDashboard} />
      )}

      {currentPage === "exam-status" && isAuthenticated && (
        <ExamStatusPage onBack={goToDashboard} onStartExam={handleStartExam} />
      )}

      {currentPage === "admin" && isAuthenticated && (
        <AdminPanel onBack={goToDashboard} onHome={goToLanding} />
      )}

      {currentPage === "instructor" && isAuthenticated && (
        <InstructorPanel
          onBack={goToDashboard}
          onCreateExam={() => setCurrentPage("exam-generator")}
        />
      )}

      {currentPage === "skills" && isAuthenticated && (
        <SkillsPage
          onGenerateExam={handleGenerateExamFromSkill}
          onBack={goToDashboard}
        />
      )}

      {/* UPDATED: Added onBack prop to LeaderboardPage */}
      {currentPage === "leaderboard" && isAuthenticated && (
        <LeaderboardPage onBack={goToDashboard} />
      )}

      {/* UPDATED: Added onBack prop to AnalyticsPage */}
      {currentPage === "analytics" && isAuthenticated && (
        <AnalyticsPage onBack={goToDashboard} />
      )}

      {/* UPDATED: Added onBack prop to AchievementsPage */}
      {currentPage === "achievements" && isAuthenticated && (
        <AchievementsPage onBack={goToDashboard} />
      )}

      {/* Courses Page */}
      {currentPage === "courses" && isAuthenticated && (
        <CoursesPage onBack={goToDashboard} />
      )}

      {/* Challenges & Hackathons Page */}
      {currentPage === "challenges" && isAuthenticated && (
        <ChallengesPage onBack={goToDashboard} />
      )}

      {/* Career Roadmap Page */}
      {currentPage === "career-roadmap" && isAuthenticated && (
        <CareerRoadmapPage onBack={goToDashboard} />
      )}

      {/* Testimonials Page */}
      {currentPage === "testimonials" && isAuthenticated && (
        <TestimonialsPage onBack={goToDashboard} />
      )}

      {currentPage === "exam-generator" && isAuthenticated && (
        <ExamGenerator onBack={goToDashboard} onStartExam={handleStartExam} />
      )}

      {currentPage === "exam" && isAuthenticated && examData && (
        <ExamInterface
          examData={examData}
          onExamComplete={handleExamComplete}
          onBack={() => setCurrentPage("exam-generator")}
        />
      )}

      {currentPage === "results" && isAuthenticated && examResults && (
        <ExamResults
          results={examResults}
          onRetakeExam={handleRetakeExam}
          onBackToDashboard={goToDashboard}
          onViewCertificates={() => setCurrentPage("certificates")}
        />
      )}

      {/* Chatbot always visible */}
      <Chatbot />
    </div>
  );
}

// Wrap App with GamificationNotificationProvider
function AppWithProviders() {
  return (
    <RealTimeDataProvider>
      <ToastProvider>
        <GamificationNotificationProvider>
          <App />
        </GamificationNotificationProvider>
      </ToastProvider>
    </RealTimeDataProvider>
  );
}

export default AppWithProviders;