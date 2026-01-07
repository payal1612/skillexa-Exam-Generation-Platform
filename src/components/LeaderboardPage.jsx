import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Search,
  Star,
  Zap,
  Target,
  Award,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Loader2,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LeaderboardPage({ onBack }) {
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('overall');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [topAchievers, setTopAchievers] = useState([]);
  const [platformStats, setPlatformStats] = useState({ totalUsers: 0, totalExams: 0, totalCertificates: 0 });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const period = timeframe === 'all-time' ? 'all' : timeframe === 'this-month' ? 'month' : 'week';
      const res = await axios.get(`${API_BASE}/api/leaderboard?period=${period}`, getAuthHeaders());
      setLeaderboardData(res.data.leaderboard || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  // Fetch user rank
  const fetchUserRank = async () => {
    if (!currentUser?._id) return;
    try {
      const res = await axios.get(`${API_BASE}/api/leaderboard/rank/${currentUser._id}`, getAuthHeaders());
      setUserRank(res.data);
    } catch (err) {
      console.error('Failed to fetch user rank:', err);
    }
  };

  // Fetch top achievers
  const fetchTopAchievers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/leaderboard/top-achievers`, getAuthHeaders());
      setTopAchievers(res.data.achievers || []);
    } catch (err) {
      console.error('Failed to fetch top achievers:', err);
    }
  };

  // Fetch platform stats
  const fetchPlatformStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/leaderboard/stats`, getAuthHeaders());
      setPlatformStats(res.data.stats || { totalUsers: 0, totalExams: 0, totalCertificates: 0 });
    } catch (err) {
      console.error('Failed to fetch platform stats:', err);
    }
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLeaderboard(),
        fetchUserRank(),
        fetchTopAchievers(),
        fetchPlatformStats()
      ]);
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [timeframe]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(loadAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Process leaderboard data for display
  const processedData = leaderboardData.map((user, index) => ({
    rank: user.rank || index + 1,
    _id: user._id,
    name: user.name,
    username: `@${user.name?.toLowerCase().replace(/\s+/g, '_') || 'user'}`,
    avatar: user.avatar || null,
    points: user.stats?.points || user.stats?.totalExams * 10 || 0,
    examsCompleted: user.stats?.totalExams || 0,
    passedExams: user.stats?.passedExams || 0,
    avgScore: user.stats?.avgScore || 0,
    certificates: user.stats?.certificates || 0,
    streak: user.stats?.currentStreak || 0,
    badge: getBadgeForUser(user.stats),
    change: 0,
    isCurrentUser: user._id === currentUser?._id
  }));

  // Determine badge based on stats
  function getBadgeForUser(stats) {
    if (!stats) return 'Newcomer';
    const points = stats.points || 0;
    if (points >= 10000) return 'AI Master';
    if (points >= 7500) return 'Expert';
    if (points >= 5000) return 'Advanced';
    if (points >= 2500) return 'Intermediate';
    if (points >= 1000) return 'Beginner';
    return 'Newcomer';
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ChevronUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ChevronDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'AI Master': 'bg-purple-100 text-purple-800',
      'Expert': 'bg-blue-100 text-blue-800',
      'Advanced': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Beginner': 'bg-orange-100 text-orange-800',
      'Newcomer': 'bg-gray-100 text-gray-800'
    };
    return colors[badge] || 'bg-gray-100 text-gray-800';
  };

  const filteredData = processedData.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

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
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  Global Leaderboard
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-gray-600">Live rankings • Compete with learners worldwide</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadAllData}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh leaderboard"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              {userRank && (
                <div className="bg-gradient-to-r from-violet-100 to-purple-100 px-4 py-2 rounded-lg border border-violet-200">
                  <div className="text-sm text-violet-700 font-medium">Your Rank: #{userRank.rank || 'N/A'}</div>
                  <div className="text-xs text-violet-600">{(userRank.user?.stats?.points || 0).toLocaleString()} points</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                >
                  <option value="all-time">All Time</option>
                  <option value="this-month">This Month</option>
                  <option value="this-week">This Week</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {processedData.length >= 3 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <div className="md:order-1 bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                <div className="relative mb-4">
                  {processedData[1]?.avatar ? (
                    <img
                      src={processedData[1].avatar}
                      alt={processedData[1].name}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-gray-300"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto border-4 border-gray-300 bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-500">{processedData[1]?.name?.charAt(0) || '?'}</span>
                    </div>
                  )}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{processedData[1]?.name || 'Unknown'}</h3>
                <p className="text-sm text-gray-600 mb-2">{processedData[1]?.examsCompleted || 0} exams • {processedData[1]?.avgScore || 0}% avg</p>
                <div className="text-2xl font-bold text-gray-700 mb-2">{processedData[1]?.certificates || 0} 🏆</div>
                <div className="text-xs text-gray-500">Certificates</div>
              </div>

              {/* 1st Place */}
              <div className="md:order-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-300 p-6 text-center hover:shadow-lg transition-shadow transform md:-translate-y-4">
                <div className="relative mb-4">
                  {processedData[0]?.avatar ? (
                    <img
                      src={processedData[0].avatar}
                      alt={processedData[0].name}
                      className="w-24 h-24 rounded-full mx-auto border-4 border-yellow-400"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto border-4 border-yellow-400 bg-yellow-100 flex items-center justify-center">
                      <span className="text-3xl font-bold text-yellow-600">{processedData[0]?.name?.charAt(0) || '?'}</span>
                    </div>
                  )}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">{processedData[0]?.name || 'Unknown'}</h3>
                <p className="text-sm text-gray-600 mb-2">{processedData[0]?.examsCompleted || 0} exams • {processedData[0]?.avgScore || 0}% avg</p>
                <div className="text-3xl font-bold text-yellow-600 mb-2">{processedData[0]?.certificates || 0} 🏆</div>
                <div className="text-xs text-gray-500">Certificates</div>
              </div>

              {/* 3rd Place */}
              <div className="md:order-3 bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                <div className="relative mb-4">
                  {processedData[2]?.avatar ? (
                    <img
                      src={processedData[2].avatar}
                      alt={processedData[2].name}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-amber-600"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto border-4 border-amber-600 bg-amber-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-600">{processedData[2]?.name?.charAt(0) || '?'}</span>
                    </div>
                  )}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{processedData[2]?.name || 'Unknown'}</h3>
                <p className="text-sm text-gray-600 mb-2">{processedData[2]?.examsCompleted || 0} exams • {processedData[2]?.avgScore || 0}% avg</p>
                <div className="text-2xl font-bold text-amber-600 mb-2">{processedData[2]?.certificates || 0} 🏆</div>
                <div className="text-xs text-gray-500">Certificates</div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {processedData.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center mb-8">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
            <p className="text-gray-600">Be the first to take an exam and climb the leaderboard!</p>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Full Rankings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exams</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificates</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((user) => (
                  <tr 
                    key={user.rank} 
                    className={`hover:bg-gray-50 transition-colors ${
                      user.isCurrentUser ? 'bg-violet-50 border-l-4 border-violet-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankIcon(user.rank)}
                        {user.isCurrentUser && (
                          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.name?.split(' ').map(n => n[0]).join('') || '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-lg font-bold text-gray-900">{user.examsCompleted}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-900">{user.passedExams}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-900">{user.avgScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-900">{user.certificates}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.totalExams.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Exams Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{platformStats.totalCertificates.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Certificates Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}