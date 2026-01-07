import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Home,
  BookOpen,
  Target,
  Trophy,
  Award,
  Medal,
  Brain,
  Flame,
  BarChart3,
  Map,
  Clock,
  MessageSquare,
  Menu,
  X,
  Bell,
  LogOut,
  Settings,
  Search,
  ChevronRight,
  TrendingUp,
  Zap,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Constants
const SIDEBAR_WIDTH = 288;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, unit, trend, index }) => {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-violet-300 hover:shadow-lg transition-all duration-300 group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-violet-600" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-gray-500 font-medium">{unit}</span>}
      </div>
    </div>
  );
};

// Skill Card Component
const SkillCard = ({ skill, index }) => {
  const progress = skill.progress || 45;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 group cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{skill.name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {skill.examsCompleted || 0} exams completed
          </p>
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button className="text-violet-600 text-sm font-medium hover:text-violet-700 flex items-center gap-1 group-hover:gap-2 transition-all">
        Continue Learning <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ activity, index }) => {
  const getActivityConfig = (type) => {
    const configs = {
      exam: { icon: BookOpen, bg: 'bg-blue-100', color: 'text-blue-600' },
      achievement: { icon: Award, bg: 'bg-yellow-100', color: 'text-yellow-600' },
      certificate: { icon: Medal, bg: 'bg-purple-100', color: 'text-purple-600' },
      challenge: { icon: Flame, bg: 'bg-orange-100', color: 'text-orange-600' },
      xp: { icon: Zap, bg: 'bg-green-100', color: 'text-green-600' },
    };
    return configs[type] || configs.achievement;
  };

  const config = getActivityConfig(activity.type);
  const Icon = config.icon;

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className={`p-2.5 rounded-lg ${config.bg} flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        {activity.value && (
          <p className="font-bold text-sm text-gray-900">{activity.value}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
      </div>
    </div>
  );
};

// Welcome Header Component
const WelcomeHeader = ({ user, stats }) => {
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
      {/* Gradient overlay effect */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-white to-transparent" />

      <div className="relative z-10">
        <p className="text-violet-100 text-sm font-medium mb-2">{getTimeGreeting()}</p>
        <h1 className="text-4xl font-bold mb-4">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>

        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
          <div>
            <p className="text-violet-100 text-xs uppercase font-semibold mb-2">Current Level</p>
            <p className="text-3xl font-bold">{stats?.level || 1}</p>
          </div>
          <div>
            <p className="text-violet-100 text-xs uppercase font-semibold mb-2">Total XP</p>
            <p className="text-3xl font-bold">{(stats?.xp || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-violet-100 text-xs uppercase font-semibold mb-2">Streak</p>
            <p className="text-3xl font-bold">{stats?.streak || 0} days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation Sidebar
const Sidebar = ({ isOpen, isCollapsed, onToggleOpen, onToggleCollapse, onNavigate, activeTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'challenges', label: 'Challenges', icon: Flame, badge: 'Hot' },
    { id: 'exams', label: 'Exams', icon: Brain },
    { id: 'career', label: 'Career Path', icon: Map },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'certificates', label: 'Certificates', icon: Medal },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onToggleOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex-shrink-0 p-5 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <img
                src="/skillforge-logo.png"
                alt="SkillForge"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h2 className="font-bold text-gray-900">SkillForge</h2>
                <p className="text-xs text-gray-500">Learning Hub</p>
              </div>
            </div>
          )}
          <button
            onClick={() => onToggleCollapse(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden lg:flex"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onToggleOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-violet-100 text-violet-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors group">
            <Settings className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors group">
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

// Main Dashboard Component
export default function Dashboard({ onNavigate = () => {} }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState({
    user: null,
    stats: {
      level: 5,
      xp: 12500,
      streak: 12,
      averageScore: 82,
      totalExams: 24,
      passRate: 88,
      certificates: 3,
    },
    skills: [
      { _id: '1', name: 'JavaScript', progress: 75, examsCompleted: 8 },
      { _id: '2', name: 'React', progress: 60, examsCompleted: 5 },
      { _id: '3', name: 'TypeScript', progress: 45, examsCompleted: 3 },
      { _id: '4', name: 'Node.js', progress: 70, examsCompleted: 7 },
      { _id: '5', name: 'MongoDB', progress: 55, examsCompleted: 4 },
      { _id: '6', name: 'CSS', progress: 85, examsCompleted: 10 },
    ],
    activities: [
      { type: 'exam', title: 'React Advanced Concepts', description: 'Exam completed with 92% score', value: '92%', time: '2 hours ago' },
      { type: 'achievement', title: 'Quick Learner Badge', description: 'Completed 5 exams in 24 hours', value: '+50 XP', time: '1 day ago' },
      { type: 'certificate', title: 'JavaScript Fundamentals', description: 'Certificate earned', value: '✓', time: '3 days ago' },
      { type: 'challenge', title: 'Weekly Challenge', description: 'Ranked in top 100', value: '#87', time: '4 days ago' },
      { type: 'xp', title: 'Streak Bonus', description: '12-day learning streak maintained', value: '+200 XP', time: '1 day ago' },
    ],
  });

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API call - replace with actual API
      // const response = await fetch(`${API_BASE}/api/dashboard`, {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // });
      // const data = await response.json();
      // setDashboardData(data);
      
      // Demo data
      setDashboardData(prev => ({ ...prev }));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleNavigate = (page) => {
    setActiveTab(page);
    onNavigate(page);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleOpen={setIsSidebarOpen}
        onToggleCollapse={setIsSidebarCollapsed}
        onNavigate={handleNavigate}
        activeTab={activeTab}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex-1 max-w-md ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, skills..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{dashboardData.user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">Learning</p>
                </div>
                <img
                  src={dashboardData.user?.avatar || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Welcome Section */}
              <WelcomeHeader user={dashboardData.user} stats={dashboardData.stats} />

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={Target}
                  label="Average Score"
                  value={dashboardData.stats.averageScore}
                  unit="%"
                  trend={5}
                  index={0}
                />
                <StatCard
                  icon={BookOpen}
                  label="Total Exams"
                  value={dashboardData.stats.totalExams}
                  trend={12}
                  index={1}
                />
                <StatCard
                  icon={CheckCircle}
                  label="Pass Rate"
                  value={dashboardData.stats.passRate}
                  unit="%"
                  trend={3}
                  index={2}
                />
                <StatCard
                  icon={Medal}
                  label="Certificates"
                  value={dashboardData.stats.certificates}
                  index={3}
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Skills Section */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Skills</h2>
                    <button className="text-violet-600 hover:text-violet-700 font-medium flex items-center gap-2">
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.skills.map((skill, idx) => (
                      <SkillCard key={skill._id} skill={skill} index={idx} />
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 px-5 py-4 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 group">
                      <Brain className="w-5 h-5" />
                      <span className="text-left flex-1">
                        <p className="font-semibold text-sm">Generate Exam</p>
                        <p className="text-xs text-violet-200">AI-powered</p>
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button className="w-full flex items-center gap-3 px-5 py-4 bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 group">
                      <Flame className="w-5 h-5" />
                      <span className="text-left flex-1">
                        <p className="font-semibold text-sm">Daily Challenge</p>
                        <p className="text-xs text-orange-100">Earn rewards</p>
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button className="w-full flex items-center gap-3 px-5 py-4 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 group">
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-left flex-1">
                        <p className="font-semibold text-sm">View Analytics</p>
                        <p className="text-xs text-blue-100">Detailed insights</p>
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button className="w-full flex items-center gap-3 px-5 py-4 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 group">
                      <Map className="w-5 h-5" />
                      <span className="text-left flex-1">
                        <p className="font-semibold text-sm">Career Path</p>
                        <p className="text-xs text-green-100">Roadmap</p>
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                  <button className="text-violet-600 hover:text-violet-700 font-medium flex items-center gap-2">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-200">
                  {dashboardData.activities.map((activity, idx) => (
                    <ActivityItem key={idx} activity={activity} index={idx} />
                  ))}
                </div>
              </div>

              {/* Footer Spacing */}
              <div className="h-12" />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
