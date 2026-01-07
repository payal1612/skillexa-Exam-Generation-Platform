import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target, 
  Award,
  Zap,
  BookOpen,
  Star,
  Users,
  Download,
  Filter,
  ChevronDown,
  Activity,
  PieChart,
  LineChart,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AnalyticsPage({ onBack }) {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real-time data states
  const [analytics, setAnalytics] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [userStats, setUserStats] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch user analytics
  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/analytics/user`, getAuthHeaders());
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  // Fetch progress chart data
  const fetchProgressData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/analytics/progress`, getAuthHeaders());
      setProgressData(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch progress data:', err);
    }
  };

  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/users/stats`, getAuthHeaders());
      setUserStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchAnalytics(),
        fetchProgressData(),
        fetchUserStats()
      ]);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  // Process performance data from progress chart
  const getPerformanceData = () => {
    if (!progressData || progressData.length === 0) {
      return [];
    }
    
    // Group by month and calculate averages
    const monthlyData = {};
    progressData.forEach(item => {
      const date = new Date(item.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { scores: [], count: 0 };
      }
      monthlyData[monthKey].scores.push(item.score);
      monthlyData[monthKey].count++;
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      exams: data.count
    })).slice(-6);
  };

  // Process skill breakdown from category stats
  const getSkillBreakdown = () => {
    if (!analytics?.categoryStats) return [];
    
    return Object.entries(analytics.categoryStats).map(([skill, data]) => ({
      skill: skill.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      mastery: data.avgScore || 0,
      exams: data.attempts || 0,
      passed: data.passed || 0
    })).sort((a, b) => b.exams - a.exams).slice(0, 5);
  };

  // Process recent activity from recent results
  const getRecentActivity = () => {
    if (!analytics?.recentResults) return [];
    
    return analytics.recentResults.map(result => ({
      date: new Date(result.date).toLocaleDateString(),
      activity: `Completed ${result.exam}`,
      score: result.score,
      difficulty: result.score >= 80 ? 'Expert' : result.score >= 60 ? 'Intermediate' : 'Novice'
    }));
  };

  // Calculate stats from real data
  const getStats = () => {
    return [
      {
        title: 'Average Score',
        value: analytics?.averageScore ? `${analytics.averageScore}%` : '0%',
        change: analytics?.passRate > 70 ? '+' + (analytics.passRate - 70) + '%' : '',
        trend: analytics?.passRate > 50 ? 'up' : 'down',
        icon: Target,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        title: 'Pass Rate',
        value: analytics?.passRate ? `${analytics.passRate}%` : '0%',
        change: '',
        trend: analytics?.passRate > 50 ? 'up' : 'down',
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'Exams Completed',
        value: analytics?.totalExams?.toString() || '0',
        change: analytics?.passedExams ? `${analytics.passedExams} passed` : '',
        trend: 'up',
        icon: BookOpen,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        title: 'Certificates',
        value: analytics?.certificates?.toString() || '0',
        change: analytics?.certificates > 0 ? 'Earned' : '',
        trend: 'up',
        icon: Zap,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      }
    ];
  };

  const performanceData = getPerformanceData();
  const skillBreakdown = getSkillBreakdown();
  const recentActivity = getRecentActivity();
  const stats = getStats();

  const getMasteryColor = (mastery) => {
    if (mastery >= 80) return 'bg-green-500';
    if (mastery >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Novice': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = () => {
    // Export analytics data as JSON
    const exportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      stats: analytics,
      performance: performanceData,
      skills: skillBreakdown,
      recentActivity
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Failed to load analytics</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAllData}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Generate dynamic insights based on real data
  const getInsights = () => {
    const insights = [];
    
    if (analytics?.averageScore >= 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Performance!',
        message: `Your average score of ${analytics.averageScore}% shows strong mastery of the material.`,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        titleColor: 'text-green-800',
        messageColor: 'text-green-700'
      });
    } else if (analytics?.averageScore >= 60) {
      insights.push({
        type: 'info',
        title: 'Good Progress',
        message: `Your average score of ${analytics.averageScore}% shows solid understanding. Keep practicing!`,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        titleColor: 'text-blue-800',
        messageColor: 'text-blue-700'
      });
    } else if (analytics?.totalExams > 0) {
      insights.push({
        type: 'warning',
        title: 'Room for Improvement',
        message: `Your average score of ${analytics.averageScore}% suggests more practice is needed. Review the material and try again.`,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        titleColor: 'text-yellow-800',
        messageColor: 'text-yellow-700'
      });
    }
    
    if (analytics?.passRate >= 70) {
      insights.push({
        type: 'success',
        title: 'High Pass Rate',
        message: `You've passed ${analytics.passRate}% of your exams. Outstanding consistency!`,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        titleColor: 'text-green-800',
        messageColor: 'text-green-700'
      });
    }
    
    if (analytics?.certificates > 0) {
      insights.push({
        type: 'success',
        title: 'Certified Professional',
        message: `You've earned ${analytics.certificates} certificate${analytics.certificates > 1 ? 's' : ''}. Great achievement!`,
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        titleColor: 'text-purple-800',
        messageColor: 'text-purple-700'
      });
    }
    
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Get Started',
        message: 'Take your first exam to start tracking your progress and unlock achievements!',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        titleColor: 'text-blue-800',
        messageColor: 'text-blue-700'
      });
    }
    
    return insights;
  };

  const insights = getInsights();

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              
              {/* Back Button */}
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 transition-colors text-2xl"
              >
                ←
              </button>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-violet-600" />
                  Learning Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                  Track your progress and identify areas for improvement
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadAllData}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="1y">Last year</option>
              </select>

              <button 
                onClick={handleExport}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Real-time indicator */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live data • Auto-refreshes every 30 seconds</span>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            );
          })}
        </div>

        {/* Performance Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              Performance Trend
            </h2>
            <span className="text-sm text-gray-500">Based on exam scores</span>
          </div>
          
          {performanceData.length > 0 ? (
            <div className="h-64 flex items-end justify-between gap-4">
              {performanceData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-lg overflow-hidden h-48 flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg transition-all duration-300 hover:from-violet-700 hover:to-violet-500"
                      style={{ height: `${data.score}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{data.score}%</div>
                    <div className="text-xs text-gray-500">{data.month}</div>
                    <div className="text-xs text-gray-400">{data.exams} exam{data.exams !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No exam data yet. Take your first exam to see your performance trend!</p>
              </div>
            </div>
          )}
        </div>

        {/* Skill Breakdown and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Skill Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-600" />
              Skill Mastery by Category
            </h2>
            
            {skillBreakdown.length > 0 ? (
              <div className="space-y-6">
                {skillBreakdown.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                      <span className="text-sm font-bold text-gray-900">{skill.mastery}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${getMasteryColor(skill.mastery)} transition-all duration-300`}
                        style={{ width: `${skill.mastery}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{skill.exams} exam{skill.exams !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{skill.passed} passed</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No skill data yet. Complete exams to track your mastery!</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-600" />
              Recent Activity
            </h2>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <div key={index} className="border-l-4 border-violet-600 pl-4 py-2 hover:bg-gray-50 transition-colors rounded-r">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.activity}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                      </div>
                      {item.score && (
                        <span className={`text-lg font-bold ${item.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.score}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity. Start learning to see your progress!</p>
              </div>
            )}
          </div>

        </div>

        {/* Insights Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Key Insights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 ${insight.bgColor} border ${insight.borderColor} rounded-lg`}>
                <div className={`font-medium ${insight.titleColor} mb-1`}>{insight.title}</div>
                <div className={`text-sm ${insight.messageColor}`}>{insight.message}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        {analytics && (
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 mt-8 text-white">
            <h2 className="text-xl font-bold mb-4">Your Learning Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{analytics.totalExams}</div>
                <div className="text-violet-200">Total Exams</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{analytics.passedExams}</div>
                <div className="text-violet-200">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{analytics.averageScore}%</div>
                <div className="text-violet-200">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{analytics.certificates}</div>
                <div className="text-violet-200">Certificates</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}