import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  Settings, 
  LogOut, 
  User, 
  BarChart3, 
  Zap,
  Clock,
  Star,
  ChevronRight,
  Play,
  Menu,
  X,
  Bell,
  Search,
  Filter,
  Download,
  Share2,
  Plus,
  Brain,
  Users,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Loader2,
  GraduationCap,
  Flame,
  Sparkles,
  Medal,
  Crown,
  Gift,
  Map,
  Shield,
  Activity,
  Eye,
  ExternalLink,
  MoreHorizontal,
  Home,
  Compass,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Lightbulb,
  Rocket,
  AlertCircle,
  WifiOff
} from 'lucide-react';
import GamificationWidget from './GamificationWidget';
import WelcomeTour from './WelcomeTour';
import OnboardingChecklist from './OnboardingChecklist';
import SkillProgressTracker from './SkillProgressTracker';
import UpcomingEvents from './UpcomingEvents';
import LearningStreakTracker from './LearningStreakTracker';
import GoalsMilestones from './GoalsMilestones';
import RecentActivityFeed from './RecentActivityFeed';
import { CardSkeleton, StatCardSkeleton, ErrorDisplay, LoadingWrapper, RefreshIndicator } from './LoadingErrorStates';
import { useRealTimeData, useCountAnimation, useProgressAnimation, formatRelativeTime, formatNumber } from '../hooks/useRealTimeData.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '', prefix = '' }) => {
  const animatedValue = useCountAnimation(value, 800);
  return <span>{prefix}{animatedValue.toLocaleString()}{suffix}</span>;
};

// Animated Progress Bar
const AnimatedProgressBar = ({ progress, color = 'violet' }) => {
  const animatedProgress = useProgressAnimation(progress, 600);
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full bg-${color}-600 rounded-full transition-all duration-300`}
        style={{ width: `${animatedProgress}%` }}
      />
    </div>
  );
};

// Quick Stat Card with animations
const QuickStatCard = ({ stat, index, onClick }) => {
  const Icon = stat.icon;
  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-xl hover:border-violet-200 transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in-up`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background decoration */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          {stat.change && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              stat.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </span>
          )}
        </div>
        
        <div className="text-2xl font-bold text-gray-900 mb-1">
          <AnimatedCounter value={parseInt(stat.value) || 0} suffix={stat.unit} />
        </div>
        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
      </div>
    </div>
  );
};

// Activity Feed Item
const ActivityItem = ({ activity, index }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'exam': return BookOpen;
      case 'achievement': return Award;
      case 'certificate': return Medal;
      case 'challenge': return Trophy;
      case 'xp': return Zap;
      default: return Activity;
    }
  };
  
  const getActivityColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-blue-100 text-blue-600';
      case 'achievement': return 'bg-yellow-100 text-yellow-600';
      case 'certificate': return 'bg-purple-100 text-purple-600';
      case 'challenge': return 'bg-orange-100 text-orange-600';
      case 'xp': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const Icon = getActivityIcon(activity.type);
  
  return (
    <div 
      className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`p-2.5 rounded-xl ${getActivityColor(activity.type)} flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{activity.title}</p>
        <p className="text-sm text-gray-500">{activity.description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        {activity.score && (
          <p className={`font-bold ${activity.score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
            {activity.score}%
          </p>
        )}
        <p className="text-xs text-gray-400">{formatRelativeTime(activity.date)}</p>
      </div>
    </div>
  );
};

// Quick Action Button
const QuickActionButton = ({ action, index }) => {
  const Icon = action.icon;
  return (
    <button
      onClick={action.action}
      className={`group relative ${action.color} text-white p-5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden animate-fade-in-up`}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-semibold">{action.title}</span>
        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
};

// Skill Card Component
const SkillCard = ({ skill, index, onGenerateExam }) => {
  return (
    <div 
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-500 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={skill.image} 
          alt={skill.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            skill.difficulty === 'Easy' ? 'bg-green-500/90 text-white' :
            skill.difficulty === 'Medium' ? 'bg-yellow-500/90 text-white' :
            'bg-red-500/90 text-white'
          }`}>
            {skill.difficulty}
          </span>
        </div>
        
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white mb-1 truncate">{skill.title}</h3>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Clock className="w-4 h-4" />
            <span>{skill.estimatedTime}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{skill.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {skill.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>

        <button 
          onClick={() => onGenerateExam(skill)}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <Zap className="w-4 h-4 group-hover/btn:animate-pulse" />
          Generate Exam
        </button>
      </div>
    </div>
  );
};

// Sidebar Navigation Item
const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
        isActive
          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
      <span className="font-medium">{item.label}</span>
      {item.badge && (
        <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
          isActive ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-600'
        }`}>
          {item.badge}
        </span>
      )}
    </button>
  );
};

// Main Dashboard Component
export default function Dashboard({ user, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Real-time data states
  const [analytics, setAnalytics] = useState(null);
  const [skills, setSkills] = useState([]);
  const [gamificationStats, setGamificationStats] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userGoals, setUserGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [analyticsRes, skillsRes, gamificationRes, challengesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/analytics/user`, getAuthHeaders()).catch(() => ({ data: { analytics: null } })),
        axios.get(`${API_BASE}/api/skills`, getAuthHeaders()).catch(() => ({ data: { skills: [] } })),
        axios.get(`${API_BASE}/api/gamification/stats`, getAuthHeaders()).catch(() => ({ data: { gamification: null } })),
        axios.get(`${API_BASE}/api/challenges`, getAuthHeaders()).catch(() => ({ data: { challenges: [] } }))
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setSkills(skillsRes.data.skills || []);
      setGamificationStats(gamificationRes.data.gamification || gamificationRes.data);
      setChallenges(challengesRes.data.challenges || challengesRes.data || []);
      setLastUpdated(new Date());
      
      // Process recent activity from analytics
      const activities = processRecentActivity(analyticsRes.data.analytics);
      setRecentActivity(activities);
      
      // Load goals from localStorage
      const savedGoals = localStorage.getItem('skillexa_goals');
      if (savedGoals) {
        setUserGoals(JSON.parse(savedGoals));
      }
      
      generateNotifications(analyticsRes.data.analytics);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Process recent activity from analytics
  const processRecentActivity = (analyticsData) => {
    const activities = [];
    
    if (analyticsData?.recentResults) {
      analyticsData.recentResults.forEach((result, index) => {
        activities.push({
          id: `exam-${index}`,
          type: result.passed ? 'exam_passed' : 'exam_completed',
          title: result.exam || 'Exam Completed',
          details: `Scored ${result.score}%`,
          xp: result.passed ? 100 : 50,
          timestamp: result.date
        });
      });
    }
    
    return activities.slice(0, 10);
  };

  // Save goals to localStorage
  const handleUpdateGoals = (newGoals) => {
    setUserGoals(newGoals);
    localStorage.setItem('skillexa_goals', JSON.stringify(newGoals));
  };

  // Generate notifications from data
  const generateNotifications = (analyticsData) => {
    const notifs = [];
    const now = new Date();
    
    notifs.push({
      id: 1,
      type: 'welcome',
      title: 'Welcome back!',
      message: 'Ready to continue your learning journey?',
      time: 'Just now',
      read: false,
      icon: '👋'
    });

    if (analyticsData?.recentResults?.length > 0) {
      analyticsData.recentResults.slice(0, 3).forEach((result, index) => {
        const examDate = new Date(result.date);
        const timeDiff = Math.floor((now - examDate) / (1000 * 60 * 60 * 24));
        const timeStr = timeDiff === 0 ? 'Today' : timeDiff === 1 ? 'Yesterday' : `${timeDiff} days ago`;
        
        notifs.push({
          id: 10 + index,
          type: result.passed ? 'success' : 'info',
          title: result.passed ? 'Exam Passed! 🎉' : 'Exam Completed',
          message: `You scored ${result.score}% on ${result.exam}`,
          time: timeStr,
          read: timeDiff > 0,
          icon: result.passed ? '✅' : '📝'
        });
      });
    }

    setNotifications(notifs);
  };

  // Check if user is new and should see tour
  useEffect(() => {
    const tourCompleted = localStorage.getItem('skillexa_tour_completed');
    if (!tourCompleted && user) {
      setShowTour(true);
    }
  }, [user]);

  // Initial load and auto-refresh
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'skills', label: 'Skills', icon: Target, action: () => onNavigate('skills') },
    { id: 'courses', label: 'Courses', icon: GraduationCap, action: () => onNavigate('courses') },
    { id: 'career-roadmap', label: 'Career Roadmap', icon: Map, action: () => onNavigate('career-roadmap') },
    { id: 'challenges', label: 'Challenges', icon: Flame, action: () => onNavigate('challenges'), badge: 'New' },
    { id: 'exams', label: 'Exams', icon: Brain, action: () => onNavigate('exam-generator') },
    { id: 'exam-status', label: 'Exam History', icon: Clock, action: () => onNavigate('exam-status') },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, action: () => onNavigate('analytics') },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, action: () => onNavigate('leaderboard') },
    { id: 'achievements', label: 'Achievements', icon: Award, action: () => onNavigate('achievements') },
    { id: 'certificates', label: 'Certificates', icon: Medal, action: () => onNavigate('certificates') },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare, action: () => onNavigate('testimonials') },
  ];

  // Stats data
  const stats = [
    { 
      label: 'Average Score', 
      value: analytics?.averageScore?.toString() || '0', 
      unit: '%', 
      icon: Target, 
      color: 'text-green-600', 
      bg: 'bg-green-100',
      change: 5
    },
    { 
      label: 'Total Exams', 
      value: analytics?.totalExams?.toString() || '0', 
      unit: '', 
      icon: BookOpen, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      change: 12
    },
    { 
      label: 'Pass Rate', 
      value: analytics?.passRate?.toString() || '0', 
      unit: '%', 
      icon: CheckCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100',
      change: 3
    },
    { 
      label: 'Certificates', 
      value: analytics?.certificates?.toString() || '0', 
      unit: '', 
      icon: Medal, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100'
    },
  ];

  // Quick actions
  const quickActions = [
    { title: 'Generate AI Exam', icon: Brain, color: 'bg-gradient-to-r from-violet-600 to-purple-600', action: () => onNavigate('exam-generator') },
    { title: 'Career Roadmap', icon: Map, color: 'bg-gradient-to-r from-pink-500 to-rose-500', action: () => onNavigate('career-roadmap') },
    { title: 'Daily Challenge', icon: Flame, color: 'bg-gradient-to-r from-orange-500 to-amber-500', action: () => onNavigate('challenges') },
    { title: 'View Analytics', icon: BarChart3, color: 'bg-gradient-to-r from-blue-500 to-cyan-500', action: () => onNavigate('analytics') },
  ];

  // Process recent activity
  const recentActivityData = analytics?.recentResults?.slice(0, 5).map(result => ({
    type: 'exam',
    title: result.exam || 'Exam Completed',
    description: result.passed ? 'Passed successfully!' : 'Keep practicing!',
    score: result.score,
    date: result.date
  })) || [];

  // Process skills for display
  const skillsWithProgress = skills.slice(0, 6).map(skill => ({
    _id: skill._id,
    name: skill.title || skill.name,
    progress: skill.progress || Math.floor(Math.random() * 80) + 20,
    examsCompleted: skill.examsCompleted || Math.floor(Math.random() * 5),
    lastPracticed: skill.lastPracticed || new Date()
  }));

  // Process challenges for upcoming events
  const upcomingChallenges = challenges.slice(0, 5).map(challenge => ({
    ...challenge,
    type: 'challenge',
    canJoin: true,
    endDate: challenge.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }));

  // Process recommended skills for display
  const recommendedSkills = skills.map(skill => ({
    title: skill.title,
    difficulty: skill.difficulty || 'Medium',
    description: skill.description || 'Master this skill with AI-powered assessments.',
    tags: [skill.category || 'General'],
    image: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400`,
    estimatedTime: '30 min'
  }));

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Welcome Tour */}
      {showTour && (
        <WelcomeTour 
          userName={user?.name?.split(' ')[0]} 
          onComplete={() => setShowTour(false)} 
        />
      )}

      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 ${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-200 flex flex-col transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Logo */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/skillforge-logo.png"
                  alt="SkillForge"
                  className="w-10 h-10 object-contain"
                />
                {!isSidebarCollapsed && (
                  <div>
                    <h1 className="font-bold text-gray-900 text-lg">SkillForge</h1>
                    <p className="text-xs text-gray-500">Learning Platform</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Level Display */}
          {gamificationStats && !isSidebarCollapsed && (
            <div className="p-4 mx-4 mt-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">
                  {gamificationStats.level || 1}
                </div>
                <div>
                  <p className="font-semibold">{gamificationStats.rank || 'Beginner'}</p>
                  <p className="text-sm text-violet-200">{formatNumber(gamificationStats.xp || 0)} XP</p>
                </div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${gamificationStats.progress || 0}%` }}
                />
              </div>
              <p className="text-xs text-violet-200 mt-2 text-right">
                {formatNumber(gamificationStats.xpToNextLevel || 0)} XP to next level
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeTab === item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveTab(item.id);
                    }
                    setIsSidebarOpen(false);
                  }}
                />
              ))}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => onNavigate('profile')}>
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && <span className="font-medium">Log Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Menu className="w-6 h-6 text-gray-600" />
                </button>
                
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {getGreeting()}, <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Learner'}</span>!
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-gray-500 text-sm">
                      {analytics?.totalExams > 0 
                        ? `${analytics.totalExams} exams completed • ${analytics.passRate || 0}% pass rate` 
                        : 'Ready to start your learning journey?'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Last updated indicator */}
                {lastUpdated && (
                  <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
                    <Activity className="w-3 h-3" />
                    Updated {formatRelativeTime(lastUpdated)}
                  </div>
                )}

                {/* Refresh Button */}
                <button
                  onClick={() => fetchDashboardData(true)}
                  disabled={isRefreshing}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>

                {/* Search */}
                <div className="hidden md:block relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all outline-none w-48 lg:w-64"
                  />
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                        <div className="p-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">Notifications</h3>
                            <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium">
                              {unreadNotifications} new
                            </span>
                          </div>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                              <p className="text-gray-500">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div 
                                key={notification.id}
                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                                  !notification.read ? 'bg-violet-50/50' : ''
                                }`}
                                onClick={() => {
                                  setNotifications(prev => 
                                    prev.map(n => n.id === notification.id ? {...n, read: true} : n)
                                  );
                                }}
                              >
                                <div className="flex gap-3">
                                  <span className="text-2xl">{notification.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                                        {notification.title}
                                      </h4>
                                      {!notification.read && (
                                        <span className="w-2 h-2 bg-violet-600 rounded-full flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                                    <span className="text-xs text-gray-400">{notification.time}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        <div className="p-3 bg-gray-50 border-t border-gray-100">
                          <button 
                            onClick={() => {
                              setNotifications(prev => prev.map(n => ({...n, read: true})));
                              setShowNotifications(false);
                            }}
                            className="w-full text-center text-sm text-violet-600 hover:text-violet-700 font-semibold py-2 hover:bg-violet-50 rounded-lg transition-colors"
                          >
                            Mark all as read
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Help Tour */}
                <button
                  onClick={() => setShowTour(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>

                {/* CTA Button */}
                <button 
                  onClick={() => onNavigate('exam-generator')}
                  className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 hover:scale-105"
                >
                  <Brain className="w-5 h-5" />
                  <span className="hidden lg:inline">Generate Exam</span>
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {loading ? (
              /* Loading State */
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Stats Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <StatCardSkeleton key={i} />
                  ))}
                </div>
                
                {/* Cards Skeleton */}
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <CardSkeleton />
                  </div>
                  <CardSkeleton />
                </div>
                
                <div className="grid lg:grid-cols-3 gap-8">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="max-w-7xl mx-auto">
                <ErrorDisplay 
                  error={error} 
                  type="network" 
                  onRetry={() => fetchDashboardData()} 
                />
              </div>
            ) : (
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Onboarding Checklist - Show for new users */}
                {showOnboarding && (
                  <OnboardingChecklist
                    user={user}
                    analytics={analytics}
                    gamification={gamificationStats}
                    onNavigate={onNavigate}
                    onDismiss={() => setShowOnboarding(false)}
                  />
                )}

                {/* Stats Grid */}
                <section className="dashboard-stats">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Overview</h2>
                      <p className="text-gray-500 text-sm">Your learning progress at a glance</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <RefreshIndicator 
                        lastUpdated={lastUpdated} 
                        onRefresh={() => fetchDashboardData(true)} 
                        loading={isRefreshing} 
                      />
                      <button 
                        onClick={() => onNavigate('analytics')}
                        className="text-violet-600 hover:text-violet-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        View Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat, index) => (
                      <QuickStatCard key={index} stat={stat} index={index} onClick={() => onNavigate('analytics')} />
                    ))}
                  </div>
                </section>

                {/* Quick Actions */}
                <section className="quick-actions">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <QuickActionButton key={index} action={action} index={index} />
                    ))}
                  </div>
                </section>

                {/* Main Dashboard Grid - 3 Column Layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left Column - Gamification & Activity */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Gamification Widget */}
                    <div className="gamification-widget">
                      <GamificationWidget onNavigate={onNavigate} />
                    </div>

                    {/* Recent Activity Feed */}
                    <RecentActivityFeed 
                      activities={recentActivity}
                      onNavigate={onNavigate}
                      loading={false}
                    />

                    {/* Skill Progress Tracker */}
                    <SkillProgressTracker
                      skills={skillsWithProgress}
                      onNavigate={onNavigate}
                      loading={false}
                    />
                  </div>

                  {/* Right Column - Sidebar Widgets */}
                  <div className="space-y-6">
                    {/* Learning Streak Tracker */}
                    <LearningStreakTracker
                      streak={gamificationStats?.currentStreak || 0}
                      longestStreak={gamificationStats?.longestStreak || 0}
                      streakData={{
                        activeDays: [],
                        freezesAvailable: 2
                      }}
                      onNavigate={onNavigate}
                      loading={false}
                    />

                    {/* Upcoming Events */}
                    <UpcomingEvents
                      events={[]}
                      challenges={upcomingChallenges}
                      onNavigate={onNavigate}
                      onJoin={(event) => onNavigate('challenges')}
                      loading={false}
                    />

                    {/* Goals & Milestones */}
                    <GoalsMilestones
                      goals={userGoals}
                      onUpdateGoals={handleUpdateGoals}
                      loading={false}
                    />
                  </div>
                </div>

                {/* Recommended Skills */}
                {recommendedSkills.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Recommended Skills</h2>
                        <p className="text-gray-500 text-sm">Based on your learning history</p>
                      </div>
                      <button 
                        onClick={() => onNavigate('skills')}
                        className="text-violet-600 hover:text-violet-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendedSkills.slice(0, 3).map((skill, index) => (
                        <SkillCard 
                          key={index} 
                          skill={skill} 
                          index={index} 
                          onGenerateExam={() => onNavigate('exam-generator')} 
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Call to Action */}
                <section className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 sm:p-10 text-white">
                  {/* Background decorations */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
                  
                  <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                        Ready to Level Up Your Skills?
                      </h2>
                      <p className="text-violet-100 max-w-lg">
                        Generate AI-powered exams on any topic, earn XP, unlock achievements, and get certified!
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => onNavigate('exam-generator')}
                        className="flex items-center justify-center gap-2 bg-white text-violet-600 hover:bg-violet-50 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-xl"
                      >
                        <Rocket className="w-5 h-5" />
                        Start Now
                      </button>
                      <button 
                        onClick={() => onNavigate('career-roadmap')}
                        className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all"
                      >
                        <Map className="w-5 h-5" />
                        View Roadmap
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
