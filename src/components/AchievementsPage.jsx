import { useState, useEffect } from 'react';
import { Award, Trophy, Star, Crown, Target, Zap, BookOpen, Users, Calendar, Lock, CheckCircle, Search, Loader2, Diamond, Medal, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Icon mapping for achievements
const iconMap = {
  BookOpen,
  Zap,
  Target,
  Award,
  Star,
  Calendar,
  Crown,
  Users,
  Trophy,
  Diamond,
  Medal,
  Shield
};

// Badge definitions based on exam count
const BADGES = [
  { id: 'bronze', name: 'Bronze', icon: Medal, color: 'text-amber-600', bg: 'bg-amber-100', requiredExams: 1, description: 'Complete 1 exam' },
  { id: 'silver', name: 'Silver', icon: Medal, color: 'text-gray-400', bg: 'bg-gray-100', requiredExams: 3, description: 'Complete 3 exams' },
  { id: 'gold', name: 'Gold', icon: Medal, color: 'text-yellow-500', bg: 'bg-yellow-100', requiredExams: 5, description: 'Complete 5 exams' },
  { id: 'platinum', name: 'Platinum', icon: Shield, color: 'text-cyan-500', bg: 'bg-cyan-100', requiredExams: 7, description: 'Complete 7 exams' },
  { id: 'diamond', name: 'Diamond', icon: Diamond, color: 'text-violet-600', bg: 'bg-violet-100', requiredExams: 10, description: 'Complete 10 exams' },
  { id: 'master', name: 'Master', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100', requiredExams: 15, description: 'Complete 15 exams' },
  { id: 'legend', name: 'Legend', icon: Trophy, color: 'text-red-500', bg: 'bg-red-100', requiredExams: 25, description: 'Complete 25 exams' },
];

export default function AchievementsPage({ onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [userStats, setUserStats] = useState({ examsCompleted: 0, examsPassed: 0, certificates: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all achievements, user's achievements, and user stats in parallel
      const [allAchievementsRes, userAchievementsRes, userStatsRes] = await Promise.all([
        fetch(`${API_URL}/api/achievements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/achievements/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/analytics/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!allAchievementsRes.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const allAchievementsData = await allAchievementsRes.json();
      const userAchievementsData = userAchievementsRes.ok ? await userAchievementsRes.json() : { achievements: [] };
      const userStatsData = userStatsRes.ok ? await userStatsRes.json() : { analytics: {} };
      
      // Extract stats from analytics response
      const analytics = userStatsData.analytics || {};
      setUserStats({
        examsCompleted: analytics.totalExams || 0,
        examsPassed: analytics.passedExams || 0,
        certificates: analytics.certificates || 0
      });

      setAchievements(allAchievementsData.achievements || []);
      setUserAchievements(userAchievementsData.achievements || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Merge achievements with user progress
  const mergedAchievements = achievements.map(achievement => {
    const userProgress = userAchievements.find(
      ua => ua.achievement?._id === achievement._id || ua.achievement === achievement._id
    );
    
    return {
      ...achievement,
      unlocked: userProgress?.status === 'unlocked' || userProgress?.unlocked || false,
      unlockedDate: userProgress?.unlockedAt || userProgress?.unlockedDate,
      progress: userProgress?.progress || 0,
      icon: iconMap[achievement.icon] || Award
    };
  });

  // Get unique categories from achievements
  const uniqueCategories = [...new Set(achievements.map(a => a.category))];
  const categories = [
    { id: 'all', name: 'All Achievements', count: mergedAchievements.length },
    ...uniqueCategories.map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: mergedAchievements.filter(a => a.category === cat).length
    }))
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'uncommon': return 'border-green-300 bg-green-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-700';
      case 'uncommon': return 'text-green-700';
      case 'rare': return 'text-blue-700';
      case 'epic': return 'text-purple-700';
      case 'legendary': return 'text-yellow-700';
      default: return 'text-gray-700';
    }
  };

  const filteredAchievements = mergedAchievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesSearch = achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const unlockedCount = mergedAchievements.filter(a => a.unlocked).length;
  // Points = exams completed (1 point per exam)
  const totalPoints = userStats.examsCompleted;
  
  // Get current badge based on exams completed
  const getCurrentBadge = () => {
    let currentBadge = null;
    for (let i = BADGES.length - 1; i >= 0; i--) {
      if (userStats.examsCompleted >= BADGES[i].requiredExams) {
        currentBadge = BADGES[i];
        break;
      }
    }
    return currentBadge;
  };
  
  // Get next badge to unlock
  const getNextBadge = () => {
    for (const badge of BADGES) {
      if (userStats.examsCompleted < badge.requiredExams) {
        return badge;
      }
    }
    return null; // All badges unlocked
  };
  
  const currentBadge = getCurrentBadge();
  const nextBadge = getNextBadge();
  const progressToNextBadge = nextBadge 
    ? Math.round((userStats.examsCompleted / nextBadge.requiredExams) * 100)
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading achievements...</p>
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
                  Achievements
                </h1>
                <p className="text-gray-600 mt-1">Track your learning milestones on Skillexa</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userStats.examsCompleted}</div>
                <div className="text-sm text-gray-600">Exams Taken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.examsPassed}</div>
                <div className="text-sm text-gray-600">Exams Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-600">{totalPoints}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              {currentBadge && (
                <div className={`text-center px-4 py-2 rounded-lg ${currentBadge.bg}`}>
                  <currentBadge.icon className={`w-6 h-6 mx-auto ${currentBadge.color}`} />
                  <div className={`text-sm font-bold ${currentBadge.color}`}>{currentBadge.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Badge Progress Section */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h3 className="text-lg font-semibold mb-4">Badge Progress</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = userStats.examsCompleted >= badge.requiredExams;
              const BadgeIcon = badge.icon;
              return (
                <div 
                  key={badge.id}
                  className={`text-center p-3 rounded-lg transition-all ${
                    isUnlocked 
                      ? 'bg-white/20 backdrop-blur' 
                      : 'bg-white/5 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    isUnlocked ? 'bg-white' : 'bg-white/20'
                  }`}>
                    {isUnlocked ? (
                      <BadgeIcon className={`w-6 h-6 ${badge.color}`} />
                    ) : (
                      <Lock className="w-5 h-5 text-white/50" />
                    )}
                  </div>
                  <div className="text-sm font-medium">{badge.name}</div>
                  <div className="text-xs opacity-75">{badge.requiredExams} exams</div>
                  {isUnlocked && (
                    <CheckCircle className="w-4 h-4 mx-auto mt-1 text-green-300" />
                  )}
                </div>
              );
            })}
          </div>
          
          {nextBadge && (
            <div className="mt-4 bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Next: <strong>{nextBadge.name}</strong> Badge</span>
                <span className="text-sm">{userStats.examsCompleted}/{nextBadge.requiredExams} exams</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNextBadge}%` }}
                ></div>
              </div>
              <p className="text-xs mt-2 opacity-75">
                Complete {nextBadge.requiredExams - userStats.examsCompleted} more exam(s) to unlock!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading achievements</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchAchievements}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Try Again
            </button>
          </div>
        ) : mergedAchievements.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements available</h3>
            <p className="text-gray-600">Start taking exams to unlock achievements!</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 space-y-6">
              {/* Search */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Search Achievements</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search achievements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-violet-50 text-violet-700 border border-violet-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-gray-500">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Progress Overview</h3>
                <div className="space-y-4">
                  {/* Badge Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Badge Progress</span>
                      <span className="text-sm text-gray-600">
                        {BADGES.filter(b => userStats.examsCompleted >= b.requiredExams).length}/{BADGES.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(BADGES.filter(b => userStats.examsCompleted >= b.requiredExams).length / BADGES.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pass Rate Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Pass Rate</span>
                      <span className="text-sm text-gray-600">
                        {userStats.examsCompleted > 0 ? Math.round((userStats.examsPassed / userStats.examsCompleted) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${userStats.examsCompleted > 0 ? (userStats.examsPassed / userStats.examsCompleted) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-violet-50 rounded-lg">
                      <div className="text-lg font-bold text-violet-600">{userStats.examsCompleted}</div>
                      <div className="text-xs text-violet-700">Exams Taken</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{userStats.examsPassed}</div>
                      <div className="text-xs text-green-700">Exams Passed</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">{userStats.certificates}</div>
                      <div className="text-xs text-yellow-700">Certificates</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <div className="text-lg font-bold text-indigo-600">
                        {BADGES.filter(b => userStats.examsCompleted >= b.requiredExams).length}
                      </div>
                      <div className="text-xs text-indigo-700">Badges Earned</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Achievements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => {
                  const Icon = achievement.icon || Award;
                  return (
                    <div 
                      key={achievement._id} 
                      className={`relative rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
                        achievement.unlocked 
                          ? `${getRarityColor(achievement.rarity)} hover:-translate-y-1` 
                          : 'border-gray-200 bg-gray-50 opacity-75'
                      }`}
                    >
                      {/* Rarity Badge */}
                      <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        achievement.unlocked 
                          ? `${getRarityTextColor(achievement.rarity)} bg-white bg-opacity-80`
                          : 'text-gray-500 bg-gray-200'
                      }`}>
                        {achievement.rarity || 'common'}
                      </div>

                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
                        achievement.unlocked 
                          ? 'bg-white shadow-md' 
                          : 'bg-gray-200'
                      }`}>
                        {achievement.unlocked ? (
                          <Icon className={`w-8 h-8 ${getRarityTextColor(achievement.rarity)}`} />
                        ) : (
                          <Lock className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <h3 className={`text-lg font-bold mb-2 ${
                          achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm leading-relaxed ${
                          achievement.unlocked ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>

                      {/* Progress or Unlock Date */}
                      {achievement.unlocked ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">Unlocked</span>
                          </div>
                          {achievement.unlockedDate && (
                            <div className="text-sm text-gray-600">
                              {new Date(achievement.unlockedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">{achievement.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                          {achievement.requirement && (
                            <div className="text-xs text-gray-500">{achievement.requirement}</div>
                          )}
                        </div>
                      )}

                      {/* Points */}
                      <div className={`absolute bottom-4 right-4 flex items-center gap-1 text-sm font-medium ${
                        achievement.unlocked ? getRarityTextColor(achievement.rarity) : 'text-gray-500'
                      }`}>
                        <Star className="w-4 h-4" />
                        <span>{achievement.points || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}