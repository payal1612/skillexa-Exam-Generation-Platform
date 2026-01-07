import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutGrid,
  TrendingUp,
  Award,
  Target,
  Flame,
  Clock,
  BookOpen,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  MoreVertical,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function StatCard({ icon: Icon, label, value, change, color = 'violet' }) {
  const isPositive = change >= 0;
  const colorMap = {
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span>{Math.abs(change)}% from last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white/50">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function SkillRow({ skill, index }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-900">{skill.name}</p>
          <span className="text-xs text-gray-600">{skill.level}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500`}
            style={{
              width: `${skill.level}%`,
              backgroundColor: skill.color || '#8b5cf6'
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity, index }) {
  const icons = {
    course: <BookOpen size={16} className="text-blue-500" />,
    challenge: <Target size={16} className="text-orange-500" />,
    achievement: <Award size={16} className="text-yellow-500" />,
    streak: <Flame size={16} className="text-red-500" />,
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="p-2 rounded-lg bg-gray-100">
        {icons[activity.type] || icons.course}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
        <p className="text-xs text-gray-500">{activity.time}</p>
      </div>
    </div>
  );
}

function NavigationSidebar({ currentTab, onTabChange, isMobileOpen, setMobileOpen }) {
  const tabs = [
    { id: 'home', label: 'Overview', icon: LayoutGrid },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white z-40 transition-transform md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/skillforge-logo.png"
                alt="SkillForge"
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-bold">SkillForge</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition-colors">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition-colors">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState({
    totalHours: 234,
    coursesCompleted: 8,
    achievements: 23,
    currentStreak: 12
  });

  const [skills, setSkills] = useState([
    { name: 'JavaScript', level: 85, color: '#f59e0b' },
    { name: 'React', level: 78, color: '#3b82f6' },
    { name: 'Python', level: 72, color: '#10b981' },
    { name: 'Web Design', level: 65, color: '#8b5cf6' },
  ]);

  const [activity, setActivity] = useState([
    { type: 'course', title: 'Advanced React Patterns', time: '2 hours ago' },
    { type: 'challenge', title: 'JavaScript Algorithms Challenge', time: '5 hours ago' },
    { type: 'achievement', title: 'Unlocked: 100 Days Streak', time: '1 day ago' },
    { type: 'course', title: 'Python Fundamentals', time: '2 days ago' },
  ]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Learning Hours"
          value={stats.totalHours}
          change={12}
          color="blue"
        />
        <StatCard
          icon={BookOpen}
          label="Courses"
          value={stats.coursesCompleted}
          change={5}
          color="green"
        />
        <StatCard
          icon={Award}
          label="Achievements"
          value={stats.achievements}
          change={8}
          color="orange"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.currentStreak}d`}
          change={3}
          color="violet"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Section */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Skills</h2>
            <button className="text-violet-600 text-sm font-medium hover:text-violet-700">
              View All
            </button>
          </div>
          <div>
            {skills.map((skill, idx) => (
              <SkillRow key={idx} skill={skill} index={idx} />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Learning Time</p>
              <p className="text-2xl font-bold text-gray-900">18h 45m</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Topics Covered</p>
              <p className="text-2xl font-bold text-gray-900">7</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-green-600 font-medium">↑ 23% from last week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-gray-600 hover:text-gray-900">
            <MoreVertical size={18} />
          </button>
        </div>
        <div>
          {activity.map((item, idx) => (
            <ActivityItem key={idx} activity={item} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LearningTab() {
  const [courses, setCourses] = useState([
    { id: 1, title: 'Advanced React Patterns', progress: 85, instructor: 'John Doe', rating: 4.8 },
    { id: 2, title: 'Python for Data Science', progress: 60, instructor: 'Jane Smith', rating: 4.9 },
    { id: 3, title: 'Web Design Fundamentals', progress: 45, instructor: 'Mike Johnson', rating: 4.7 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
          Explore More
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-40 bg-gradient-to-br from-violet-400 to-purple-600" />
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{course.instructor}</p>
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-900 font-medium">{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
              <button className="w-full mt-3 px-3 py-2 text-center text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                Continue Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AchievementsTab() {
  const [achievements, setAchievements] = useState([
    { id: 1, title: 'First Steps', description: 'Complete your first course', icon: '🎯', unlocked: true },
    { id: 2, title: 'Century Club', description: 'Reach 100 learning hours', icon: '🏆', unlocked: true },
    { id: 3, title: 'Streak Master', description: '30 day learning streak', icon: '🔥', unlocked: false },
    { id: 4, title: 'Code Wizard', description: 'Master 5 programming languages', icon: '✨', unlocked: false },
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`rounded-lg border p-4 text-center transition-all ${
              achievement.unlocked
                ? 'bg-white border-gray-200'
                : 'bg-gray-50 border-gray-200 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2">{achievement.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
            <p className="text-sm text-gray-600">{achievement.description}</p>
            {!achievement.unlocked && (
              <p className="text-xs text-gray-500 mt-2">Locked</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressTab() {
  const [chartData, setChartData] = useState([
    { week: 'Week 1', hours: 12 },
    { week: 'Week 2', hours: 18 },
    { week: 'Week 3', hours: 15 },
    { week: 'Week 4', hours: 22 },
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Learning Time</h2>
        <div className="flex items-end justify-between gap-2 h-64">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex items-end justify-center h-full">
                <div
                  className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg"
                  style={{ height: `${(item.hours / 25) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">{item.week}</p>
              <p className="text-sm font-medium text-gray-900">{item.hours}h</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Programming', value: 45, color: 'bg-blue-500' },
              { label: 'Design', value: 30, color: 'bg-purple-500' },
              { label: 'Data Science', value: 20, color: 'bg-green-500' },
              { label: 'Other', value: 5, color: 'bg-gray-400' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Milestones</h3>
          <div className="space-y-3">
            {[
              { label: '100 Hours', completed: true },
              { label: '200 Hours', completed: true },
              { label: '500 Hours', completed: false },
              { label: '1000 Hours', completed: false },
            ].map((milestone, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    milestone.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {milestone.completed && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-gray-700">{milestone.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const [currentTab, setCurrentTab] = useState('home');
  const [isMobileOpen, setMobileOpen] = useState(false);

  const renderTab = () => {
    switch (currentTab) {
      case 'home':
        return <OverviewTab />;
      case 'learning':
        return <LearningTab />;
      case 'achievements':
        return <AchievementsTab />;
      case 'progress':
        return <ProgressTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <NavigationSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {renderTab()}
          </div>
        </div>
      </main>
    </div>
  );
}
