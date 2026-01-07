import { useState, useCallback } from 'react';
import {
  Home,
  Award,
  BookOpen,
  Compass,
  Zap,
  FileText,
  Clock,
  BarChart3,
  Trophy,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  CheckCircle2,
  Circle,
  ChevronRight,
  Plus
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function OnboardingTask({ task, completed, xp }) {
  return (
    <div className="flex items-start gap-4 p-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="mt-1">
        {completed ? (
          <CheckCircle2 size={20} className="text-green-500" />
        ) : (
          <Circle size={20} className="text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900">{task.title}</h4>
        <p className="text-sm text-gray-600 mt-0.5">{task.description}</p>
      </div>
      {xp && (
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-semibold text-violet-600">+{xp} XP</p>
        </div>
      )}
    </div>
  );
}

function Sidebar({ isMobileOpen, setMobileOpen, currentPage, onPageChange }) {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'career', label: 'Career Roadmap', icon: Compass },
    { id: 'challenges', label: 'Challenges', icon: Zap },
    { id: 'exams', label: 'Exams', icon: FileText },
    { id: 'history', label: 'Exam History', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 z-40 transition-transform md:static md:translate-x-0 overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/skillforge-logo.png"
                alt="SkillForge"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="font-semibold text-gray-900">SkillForge</h1>
                <p className="text-xs text-gray-600">Learning Platform</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-1 bg-white">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function GreetingSection({ userName = 'Payal' }) {
  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold text-gray-900">Good afternoon, {userName}!</h2>
      <p className="text-gray-600 flex items-center gap-2 mt-1">
        <span className="w-2 h-2 bg-green-500 rounded-full" />
        Ready to start your learning journey?
      </p>
    </div>
  );
}

function OnboardingChecklist() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Earn a certificate',
      description: 'Complete an exam with flying colors',
      completed: false,
      xp: 200
    },
    {
      id: 2,
      title: 'Set your career path',
      description: 'Choose a career roadmap to follow',
      completed: false,
      xp: 75
    },
    {
      id: 3,
      title: 'Join a challenge',
      description: 'Participate in a weekly challenge',
      completed: false,
      xp: 100
    },
    {
      id: 4,
      title: 'Start a learning streak',
      description: 'Learn for 3 consecutive days',
      completed: false,
      xp: 150
    }
  ]);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalXP = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.xp, 0);
  const totalAvailableXP = tasks.reduce((sum, t) => sum + t.xp, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
            <p className="text-sm text-gray-600 mt-1">Complete tasks to earn XP</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{completedCount} of {tasks.length} completed</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{Math.round((completedCount / tasks.length) * 100)}%</p>
          </div>
        </div>

        <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 transition-all duration-300"
            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
          />
        </div>
      </div>

      <div>
        {tasks.map(task => (
          <OnboardingTask
            key={task.id}
            task={task}
            completed={task.completed}
            xp={task.xp}
          />
        ))}
      </div>
    </div>
  );
}

function QuickStatsRow() {
  const stats = [
    { label: 'Learning Hours', value: '234h', change: '+12%' },
    { label: 'Courses Active', value: '8', change: '+2' },
    { label: 'Current Streak', value: '12d', change: 'Keep going!' },
    { label: 'Total XP', value: '4,280', change: '+350 this week' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-600 mt-2">{stat.change}</p>
        </div>
      ))}
    </div>
  );
}

function TopBar({ isMobileOpen, setMobileOpen }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-20 flex items-center justify-between">
      <button
        onClick={() => setMobileOpen(!isMobileOpen)}
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 flex items-center justify-center sm:justify-end gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600" />
      </div>
    </div>
  );
}

export default function MainDashboard() {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (currentPage !== 'dashboard') {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isMobileOpen={isMobileOpen}
          setMobileOpen={setMobileOpen}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <main className="flex-1 flex flex-col">
          <TopBar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />
          <div className="flex-1 overflow-auto p-6">
            <p className="text-gray-600">Navigate to: {currentPage}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <GreetingSection />

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600">Updated just now</p>
              </div>
              <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-2">
                <Plus size={16} />
                Generate Exam
              </button>
            </div>

            <OnboardingChecklist />

            <QuickStatsRow />

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                  <p className="text-sm text-gray-600">Your learning progress at a glance</p>
                </div>
                <button className="text-violet-600 text-sm font-medium hover:text-violet-700">
                  View Details →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Skills Progress</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'JavaScript', level: 85 },
                      { name: 'React', level: 78 },
                      { name: 'Python', level: 72 }
                    ].map((skill, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700">{skill.name}</span>
                          <span className="text-gray-600">{skill.level}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-600"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    {[
                      'Completed Advanced React course',
                      'Joined JavaScript Challenge',
                      'Earned 150 XP'
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-violet-600" />
                        <p className="text-gray-700">{activity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
