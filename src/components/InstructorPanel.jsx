import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Users, BarChart3, Plus, CreditCard as Edit3, Eye, Trash2, Search, Filter, Download, Upload, Clock, CheckCircle, AlertCircle, Target, Award, TrendingUp, Calendar, Star, RefreshCw, GraduationCap, FileText, Settings, Bell, ChevronRight, Sparkles, Zap, Activity, PieChart, ArrowUpRight, ArrowDownRight, MoreVertical, Mail, Phone } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InstructorPanel({ onBack, onCreateExam }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Real data states
  const [stats, setStats] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, badge: null },
    { id: 'exams', label: 'My Exams', icon: BookOpen, badge: null },
    { id: 'students', label: 'Students', icon: Users, badge: null },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, badge: 'Pro' },
    { id: 'content', label: 'Content', icon: Target, badge: 'New' }
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/instructor/stats`, getAuthHeaders());
      if (res.data.success) {
        const s = res.data.stats;
        setStats([
          { label: 'Total Exams', value: s.totalExams.toString(), change: s.newExamsThisWeek > 0 ? `+${s.newExamsThisWeek} this week` : '', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Total Students', value: s.activeStudents.toString(), change: s.newStudentsThisWeek > 0 ? `+${s.newStudentsThisWeek} this week` : '', icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Avg. Score', value: s.avgScore, change: '', icon: Target, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Certificates Issued', value: s.certificatesIssued.toString(), change: s.newCertsThisWeek > 0 ? `+${s.newCertsThisWeek} this week` : '', icon: Award, color: 'text-orange-600', bg: 'bg-orange-100' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch instructor exams
  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/instructor/exams`, {
        ...getAuthHeaders(),
        params: { search: searchQuery }
      });
      if (res.data.success) {
        setMyExams(res.data.exams);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/instructor/students`, getAuthHeaders());
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Fetch recent activity
  const fetchActivity = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/instructor/activity`, getAuthHeaders());
      if (res.data.success) {
        setRecentActivity(res.data.activities);
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/instructor/analytics`, getAuthHeaders());
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Delete exam
  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      const res = await axios.delete(`${API_BASE}/api/instructor/exams/${examId}`, getAuthHeaders());
      if (res.data.success) {
        fetchExams();
        fetchStats();
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      alert('Failed to delete exam');
    }
  };

  // Update exam status
  const handleUpdateExamStatus = async (examId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/api/instructor/exams/${examId}/status`, 
        { status: newStatus.toLowerCase() },
        getAuthHeaders()
      );
      fetchExams();
    } catch (err) {
      console.error('Error updating exam status:', err);
    }
  };

  // Export student data
  const handleExportData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/instructor/students/export`, getAuthHeaders());
      if (res.data.success) {
        const data = res.data.data;
        const csvContent = [
          ['Student Name', 'Email', 'Exam', 'Score', 'Passed', 'Completed At'].join(','),
          ...data.map(row => [
            row.studentName,
            row.studentEmail,
            row.examTitle,
            row.score,
            row.passed,
            row.completedAt
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchStats(),
          fetchExams(),
          fetchStudents(),
          fetchActivity()
        ]);
      } catch (err) {
        setError('Failed to load instructor data');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Fetch analytics when tab changes
  useEffect(() => {
    if (activeTab === 'analytics' && !analytics) {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Re-fetch exams when search changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchExams();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Novice': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      case 'Master': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'exam_completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'new_enrollment': return <Users className="w-4 h-4 text-blue-600" />;
      case 'new_registration': return <Star className="w-4 h-4 text-purple-600" />;
      case 'question_flagged': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'exam_completed':
        return `${activity.student} completed "${activity.exam}"`;
      case 'new_enrollment':
        return `${activity.student} enrolled in ${activity.exam}`;
      case 'new_registration':
        return `${activity.student} joined the platform`;
      case 'question_flagged':
        return `${activity.student} flagged a question in ${activity.exam}`;
      default:
        return `Activity by ${activity.student}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-pulse"></div>
            <RefreshCw className="w-10 h-10 animate-spin text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 mt-6 font-medium">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-1">Preparing instructor panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      Instructor Dashboard
                    </h1>
                    <p className="text-emerald-100 text-sm">Manage your exams, students & content</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  <Bell className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">3</span>
                </button>
              </div>
              <button 
                onClick={onCreateExam}
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create Exam</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-gray-200/50 overflow-hidden mb-8">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <nav className="flex overflow-x-auto px-2 py-2 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-5 py-3 font-medium transition-all duration-200 whitespace-nowrap rounded-xl ${
                      activeTab === tab.id
                        ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === tab.id 
                          ? 'bg-white/20 text-white' 
                          : tab.badge === 'Pro' 
                            ? 'bg-purple-100 text-purple-600' 
                            : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6 sm:p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Enhanced Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    const gradients = [
                      'from-blue-500 to-indigo-600',
                      'from-emerald-500 to-teal-600',
                      'from-purple-500 to-pink-600',
                      'from-orange-500 to-red-500'
                    ];
                    return (
                      <div 
                        key={index} 
                        className={`relative bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group ${
                          hoveredCard === index ? 'transform -translate-y-1' : ''
                        }`}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        {/* Gradient top bar */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[index]}`}></div>
                        
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${gradients[index]} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          {stat.change && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                              <ArrowUpRight className="w-3 h-3" />
                              {stat.change}
                            </span>
                          )}
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                        
                        {/* Hover effect decoration */}
                        <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${gradients[index]} rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      </div>
                    );
                  })}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity - Takes 2 columns */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        Recent Activity
                      </h3>
                      <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No recent activity</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentActivity.slice(0, 5).map((activity, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                              activity.type === 'exam_completed' ? 'bg-green-100' :
                              activity.type === 'new_enrollment' ? 'bg-blue-100' :
                              activity.type === 'new_registration' ? 'bg-purple-100' :
                              'bg-yellow-100'
                            }`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {getActivityMessage(activity)}
                              </div>
                              {activity.score !== undefined && activity.type === 'exam_completed' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-sm font-bold ${getScoreColor(activity.score)}`}>
                                    {activity.score}%
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${activity.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {activity.passed ? '✓ Passed' : '✗ Failed'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 font-medium">{activity.time}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions Sidebar */}
                  <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative">
                      <Zap className="w-5 h-5" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3 relative">
                      <button 
                        onClick={onCreateExam}
                        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl transition-all duration-200 flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Create New Exam</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('students')}
                        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl transition-all duration-200 flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                        <span className="font-medium">View Students</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('analytics')}
                        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl transition-all duration-200 flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PieChart className="w-5 h-5" />
                        </div>
                        <span className="font-medium">View Analytics</span>
                      </button>
                      <button 
                        onClick={handleExportData}
                        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl transition-all duration-200 flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Download className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Export Data</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Exams Tab */}
            {activeTab === 'exams' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search exams by title, category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={fetchExams}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                      <Filter className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={onCreateExam}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                    >
                      <Plus className="w-5 h-5" />
                      Create Exam
                    </button>
                  </div>
                </div>

                {myExams.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No exams created yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first exam to start assessing your students and tracking their progress</p>
                    <button 
                      onClick={onCreateExam}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/30"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Create Your First Exam
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myExams.map((exam) => (
                      <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                        {/* Colored top bar based on status */}
                        <div className={`h-2 ${
                          exam.status === 'Active' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                          exam.status === 'Draft' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                          'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}></div>
                        
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{exam.title}</h4>
                              <p className="text-sm text-gray-500">{exam.category}</p>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(exam.status)}`}>
                              {exam.status}
                            </span>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getDifficultyColor(exam.difficulty)}`}>
                              {exam.difficulty}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-xl font-bold text-gray-900">{exam.questions}</div>
                              <div className="text-xs text-gray-500">Questions</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-xl font-bold text-gray-900">{exam.timeLimit}m</div>
                              <div className="text-xs text-gray-500">Duration</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-xl font-bold text-gray-900">{exam.students}</div>
                              <div className="text-xs text-gray-500">Students</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className={`text-xl font-bold ${getScoreColor(exam.avgScore)}`}>{exam.avgScore}%</div>
                              <div className="text-xs text-gray-500">Avg Score</div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created: {exam.created}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleUpdateExamStatus(exam.id, exam.status === 'Active' ? 'draft' : 'active')}
                              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                exam.status === 'Active' 
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              }`}
                            >
                              <Eye className="w-4 h-4" />
                              {exam.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md">
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteExam(exam.id)}
                              className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Students Tab */}
            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-6 h-6 text-emerald-600" />
                      Student Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Track and manage your students' progress</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2 font-medium text-gray-700">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button 
                      onClick={handleExportData}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No students yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Students will appear here once they start taking your exams</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Exams</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Score</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Certificates</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Active</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {students.map((student, index) => (
                            <tr key={student.id} className="hover:bg-emerald-50/30 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                                    ['bg-gradient-to-br from-blue-400 to-blue-600',
                                     'bg-gradient-to-br from-emerald-400 to-emerald-600',
                                     'bg-gradient-to-br from-purple-400 to-purple-600',
                                     'bg-gradient-to-br from-orange-400 to-orange-600',
                                     'bg-gradient-to-br from-pink-400 to-pink-600'][index % 5]
                                  }`}>
                                    {student.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{student.name}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {student.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-900">{student.examsCompleted}</span>
                                  <span className="text-xs text-gray-400">completed</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {student.examsCompleted > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <div className={`text-lg font-bold ${getScoreColor(student.avgScore)}`}>
                                      {student.avgScore}%
                                    </div>
                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${
                                          student.avgScore >= 90 ? 'bg-emerald-500' :
                                          student.avgScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${student.avgScore}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <Award className={`w-5 h-5 ${student.certificatesEarned > 0 ? 'text-yellow-500' : 'text-gray-300'}`} />
                                  <span className={`font-bold ${student.certificatesEarned > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                    {student.certificatesEarned}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.joinedDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {student.lastActive}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="View Details">
                                    <Eye className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="View Analytics">
                                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                                  </button>
                                  <button className="p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors" title="Send Message">
                                    <Mail className="w-4 h-4 text-purple-600" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {!analytics ? (
                  <div className="text-center py-16">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-pulse"></div>
                      <RefreshCw className="w-10 h-10 animate-spin text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-gray-600 mt-6 font-medium">Loading analytics...</p>
                  </div>
                ) : (
                  <>
                    {/* Analytics Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <TrendingUp className="w-6 h-6 text-emerald-600" />
                          Performance Analytics
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Deep insights into your exams and students</p>
                      </div>
                      <button 
                        onClick={fetchAnalytics}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2 font-medium text-gray-700"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>

                    {/* Exam Performance */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Exam Performance
                      </h3>
                      {analytics.examPerformance.length === 0 ? (
                        <div className="text-center py-8">
                          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No exam data available yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {analytics.examPerformance.map((exam, index) => (
                            <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:border-emerald-200 transition-colors">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{exam.attempts} attempts</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                  <div className={`text-xl font-bold ${getScoreColor(exam.avgScore)}`}>{exam.avgScore}%</div>
                                  <div className="text-xs text-gray-500">Avg Score</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                  <div className={`text-xl font-bold ${getScoreColor(exam.passRate)}`}>{exam.passRate}%</div>
                                  <div className="text-xs text-gray-500">Pass Rate</div>
                                </div>
                              </div>
                              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${exam.passRate}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pass/Fail Summary */}
                    {analytics.passFailStats && (
                      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <PieChart className="w-5 h-5 text-purple-600" />
                          Overall Pass/Fail Stats
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <FileText className="w-8 h-8 text-gray-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{analytics.passFailStats.totalAttempts}</div>
                            <div className="text-sm text-gray-500 font-medium">Total Attempts</div>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div className="text-3xl font-bold text-emerald-600">{analytics.passFailStats.passed}</div>
                            <div className="text-sm text-gray-500 font-medium">Passed</div>
                          </div>
                          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="text-3xl font-bold text-red-600">{analytics.passFailStats.failed}</div>
                            <div className="text-sm text-gray-500 font-medium">Failed</div>
                          </div>
                        </div>
                        {analytics.passFailStats.totalAttempts > 0 && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-gray-700">Overall Pass Rate</span>
                              <span className="font-bold text-emerald-600">{Math.round((analytics.passFailStats.passed / analytics.passFailStats.totalAttempts) * 100)}%</span>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" 
                                style={{ width: `${(analytics.passFailStats.passed / analytics.passFailStats.totalAttempts) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Top Students */}
                    {analytics.topStudents && analytics.topStudents.length > 0 && (
                      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-500" />
                          Top Performing Students
                        </h3>
                        <div className="space-y-3">
                          {analytics.topStudents.map((student, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-yellow-200 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30' :
                                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{student.name}</div>
                                  <div className="text-xs text-gray-500">{student.totalExams} exams completed</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-2xl font-bold ${getScoreColor(student.avgScore)}`}>
                                  {student.avgScore}%
                                </span>
                                <div className="text-xs text-gray-500">avg score</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Daily Activity */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        Daily Activity (Last 7 Days)
                      </h3>
                      {analytics.dailyActivity.length === 0 ? (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No activity data available</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {analytics.dailyActivity.map((day, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                              <span className="font-medium text-gray-700">{day._id}</span>
                              <div className="flex gap-6">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-900">{day.attempts}</div>
                                  <div className="text-xs text-gray-500">attempts</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-emerald-600">{day.passCount || 0}</div>
                                  <div className="text-xs text-gray-500">passed</div>
                                </div>
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${getScoreColor(Math.round(day.avgScore))}`}>{Math.round(day.avgScore)}%</div>
                                  <div className="text-xs text-gray-500">avg</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Score Distribution */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-cyan-600" />
                        Score Distribution
                      </h3>
                      {analytics.scoreDistribution.length === 0 ? (
                        <div className="text-center py-8">
                          <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No score data available</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                          {analytics.scoreDistribution.map((bucket, index) => {
                            const colors = [
                              'from-red-400 to-red-500',
                              'from-orange-400 to-orange-500',
                              'from-yellow-400 to-yellow-500',
                              'from-lime-400 to-lime-500',
                              'from-emerald-400 to-emerald-500',
                              'from-teal-400 to-teal-500'
                            ];
                            return (
                              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-center border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[index] || colors[0]} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                                  <span className="text-white font-bold text-lg">{bucket.count}</span>
                                </div>
                                <div className="text-xs font-medium text-gray-600">
                                  {bucket._id === 0 && '0-49%'}
                                  {bucket._id === 50 && '50-59%'}
                                  {bucket._id === 60 && '60-69%'}
                                  {bucket._id === 70 && '70-79%'}
                                  {bucket._id === 80 && '80-89%'}
                                  {bucket._id === 90 && '90-100%'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Enhanced Content Tab */}
            {activeTab === 'content' && (
              <div className="text-center py-16">
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto">
                    <Target className="w-12 h-12 text-emerald-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Content Management
                </h3>
                <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                  Advanced content management features are coming soon. Stay tuned for powerful tools to manage your course materials, resources, and learning paths.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={onCreateExam}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Exam
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notify Me
                  </button>
                </div>
                
                {/* Coming Soon Features */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-left border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">Study Materials</h4>
                    <p className="text-sm text-gray-500">Upload PDFs, videos, and documents</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-left border border-purple-100">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">Learning Paths</h4>
                    <p className="text-sm text-gray-500">Create structured course paths</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 text-left border border-orange-100">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                      <Settings className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">Question Bank</h4>
                    <p className="text-sm text-gray-500">Manage reusable questions</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}