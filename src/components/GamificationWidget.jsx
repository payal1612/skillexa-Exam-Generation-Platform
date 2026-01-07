import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  TrendingUp, 
  Gift, 
  ChevronRight,
  Crown,
  Target,
  Award,
  Sparkles,
  Calendar
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// XP Animation Component
const XpPopup = ({ xp, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        <span className="font-bold text-lg">+{xp} XP</span>
      </div>
    </div>
  );
};

// Level Badge Component
const LevelBadge = ({ level, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  const getBadgeColor = (lvl) => {
    if (lvl >= 18) return 'from-pink-500 to-purple-600';
    if (lvl >= 15) return 'from-red-500 to-orange-500';
    if (lvl >= 12) return 'from-yellow-400 to-amber-500';
    if (lvl >= 8) return 'from-purple-500 to-violet-600';
    if (lvl >= 5) return 'from-blue-500 to-cyan-500';
    if (lvl >= 3) return 'from-green-500 to-emerald-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getBadgeColor(level)} flex items-center justify-center text-white font-bold shadow-lg`}>
      {level}
    </div>
  );
};

// Streak Display Component
const StreakDisplay = ({ streak, longestStreak }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Flame className={`w-6 h-6 ${streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
        <div>
          <p className="text-2xl font-bold text-gray-900">{streak}</p>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>
      </div>
      <div className="h-10 w-px bg-gray-200" />
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">{longestStreak}</p>
        <p className="text-xs text-gray-500">Best Streak</p>
      </div>
    </div>
  );
};

// Progress Bar Component
const XpProgressBar = ({ progress, currentXp, nextLevelXp, level }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Level {level}</span>
        <span>Level {level + 1}</span>
      </div>
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow">
          {currentXp} / {nextLevelXp} XP
        </div>
      </div>
    </div>
  );
};

// Daily Reward Card
const DailyRewardCard = ({ day, xp, claimed, isToday, bonus }) => {
  return (
    <div className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
      claimed 
        ? 'bg-green-50 border-green-300' 
        : isToday 
          ? 'bg-violet-50 border-violet-400 shadow-lg scale-105' 
          : 'bg-gray-50 border-gray-200'
    }`}>
      {bonus && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
          {bonus}
        </span>
      )}
      <span className="text-xs text-gray-500 mb-1">Day {day}</span>
      <Gift className={`w-6 h-6 ${claimed ? 'text-green-500' : isToday ? 'text-violet-500' : 'text-gray-400'}`} />
      <span className={`text-sm font-bold mt-1 ${claimed ? 'text-green-600' : isToday ? 'text-violet-600' : 'text-gray-600'}`}>
        +{xp} XP
      </span>
      {claimed && (
        <span className="text-xs text-green-600 mt-1">✓</span>
      )}
    </div>
  );
};

// Main Gamification Widget
export default function GamificationWidget({ compact = false, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [dailyRewards, setDailyRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showXpPopup, setShowXpPopup] = useState(null);
  const [claiming, setClaiming] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gamification/stats`, getAuthHeaders());
      const data = await res.json();
      if (data.success) {
        setStats(data.gamification);
      }
    } catch (error) {
      console.error('Failed to fetch gamification stats:', error);
    }
  };

  const fetchDailyRewards = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gamification/daily-rewards`, getAuthHeaders());
      const data = await res.json();
      if (data.success) {
        setDailyRewards(data);
      }
    } catch (error) {
      console.error('Failed to fetch daily rewards:', error);
    }
  };

  const claimDailyReward = async () => {
    if (claiming || !dailyRewards?.canClaim) return;
    
    setClaiming(true);
    try {
      const res = await fetch(`${API_URL}/api/gamification/daily-rewards/claim`, {
        method: 'POST',
        ...getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setShowXpPopup(data.xpAwarded);
        fetchStats();
        fetchDailyRewards();
      }
    } catch (error) {
      console.error('Failed to claim daily reward:', error);
    } finally {
      setClaiming(false);
    }
  };

  const updateStreak = async () => {
    try {
      await fetch(`${API_URL}/api/gamification/streak`, {
        method: 'POST',
        ...getAuthHeaders()
      });
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchDailyRewards(), updateStreak()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (compact) {
    return (
      <>
        {showXpPopup && (
          <XpPopup xp={showXpPopup} onComplete={() => setShowXpPopup(null)} />
        )}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LevelBadge level={stats?.level || 1} size="md" />
              <div>
                <p className="font-bold">{stats?.rank || 'Beginner'}</p>
                <p className="text-violet-200 text-sm">{stats?.xp || 0} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="font-bold">{stats?.currentStreak || 0}</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${stats?.progress || 0}%` }}
              />
            </div>
            <p className="text-xs text-violet-200 mt-1 text-right">
              {stats?.xpToNextLevel || 0} XP to Level {(stats?.level || 1) + 1}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {showXpPopup && (
        <XpPopup xp={showXpPopup} onComplete={() => setShowXpPopup(null)} />
      )}
      
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Your Progress
            </h2>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {stats?.rank || 'Beginner'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <LevelBadge level={stats?.level || 1} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold">{stats?.xp?.toLocaleString() || 0} XP</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.progress || 0}%` }}
                />
              </div>
              <p className="text-sm text-violet-200 mt-1">
                {stats?.xpToNextLevel?.toLocaleString() || 0} XP to Level {(stats?.level || 1) + 1}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats?.currentStreak || 0}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats?.achievementsUnlocked || 0}</p>
              <p className="text-xs text-gray-500">Achievements</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats?.challengesCompleted || 0}</p>
              <p className="text-xs text-gray-500">Challenges</p>
            </div>
          </div>
        </div>

        {/* Daily Rewards */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-600" />
              Daily Rewards
            </h3>
            {dailyRewards?.canClaim && (
              <button
                onClick={claimDailyReward}
                disabled={claiming}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                {claiming ? 'Claiming...' : 'Claim Reward'}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {dailyRewards?.dailyRewards?.map((reward, index) => (
              <DailyRewardCard
                key={reward.day}
                day={reward.day}
                xp={reward.xp}
                claimed={reward.claimed}
                isToday={index === (dailyRewards.currentStreak % 7)}
                bonus={reward.bonus}
              />
            ))}
          </div>
          
          {!dailyRewards?.canClaim && (
            <p className="text-center text-sm text-gray-500 mt-4">
              ✓ Daily reward claimed! Come back tomorrow for more XP.
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate?.('achievements')}
              className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-yellow-500" />
                <span className="font-medium text-gray-900">Achievements</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
            <button
              onClick={() => onNavigate?.('leaderboard')}
              className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-purple-500" />
                <span className="font-medium text-gray-900">Leaderboard</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Export sub-components for use elsewhere
export { XpPopup, LevelBadge, StreakDisplay, XpProgressBar };
