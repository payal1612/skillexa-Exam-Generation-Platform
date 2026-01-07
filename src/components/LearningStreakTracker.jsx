import { useState, useEffect } from 'react';
import { 
  Flame, 
  Calendar, 
  Trophy, 
  Zap, 
  Star,
  TrendingUp,
  Gift,
  Shield,
  Target
} from 'lucide-react';

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

function getStreakEmoji(streak) {
  if (streak >= 365) return '👑';
  if (streak >= 100) return '💎';
  if (streak >= 60) return '🔥';
  if (streak >= 30) return '⚡';
  if (streak >= 14) return '✨';
  if (streak >= 7) return '🌟';
  if (streak >= 3) return '💪';
  return '🔥';
}

function getNextMilestone(streak) {
  return STREAK_MILESTONES.find(m => m > streak) || streak + 10;
}

function WeeklyCalendar({ streakData }) {
  const today = new Date();
  const days = [];
  
  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const isActive = streakData?.activeDays?.includes(dateStr) || i === 0;
    days.push({
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      isActive,
      isToday: i === 0
    });
  }

  return (
    <div className="flex items-center justify-between gap-1">
      {days.map((day, index) => (
        <div 
          key={index}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${
            day.isToday 
              ? 'bg-violet-100 ring-2 ring-violet-500' 
              : day.isActive 
                ? 'bg-green-50' 
                : 'bg-gray-50'
          }`}
        >
          <span className="text-[10px] text-gray-500 font-medium">{day.dayName}</span>
          <span className={`text-sm font-bold mt-0.5 ${
            day.isToday ? 'text-violet-600' : day.isActive ? 'text-green-600' : 'text-gray-400'
          }`}>
            {day.dayNum}
          </span>
          {day.isActive && (
            <Flame className={`w-3.5 h-3.5 mt-0.5 ${
              day.isToday ? 'text-violet-500' : 'text-green-500'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function StreakBadge({ streak, size = 'md' }) {
  const sizes = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-28 h-28 text-4xl'
  };

  return (
    <div className={`relative ${sizes[size]} flex items-center justify-center`}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 animate-pulse" />
      
      {/* Inner circle */}
      <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Streak</span>
          <span className="font-bold text-gray-900">{streak}</span>
        </div>
      </div>
      
      {/* Flame icon */}
      <Flame className="absolute -top-2 -right-1 w-6 h-6 text-orange-500 fill-orange-500 animate-bounce" />
    </div>
  );
}

function MilestoneProgress({ current, next }) {
  const progress = Math.min(100, (current / next) * 100);
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600">Next milestone</span>
        <span className="font-semibold text-violet-600">{next} days</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse" />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
        <span>{current} days</span>
        <span>{next - current} to go</span>
      </div>
    </div>
  );
}

function StreakReward({ reward, unlocked }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${
      unlocked ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'
    }`}>
      <div className={`p-2 rounded-lg ${unlocked ? 'bg-green-100' : 'bg-gray-200'}`}>
        <Gift className={`w-4 h-4 ${unlocked ? 'text-green-600' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${unlocked ? 'text-green-700' : 'text-gray-500'}`}>
          {reward.title}
        </p>
        <p className="text-xs text-gray-500">{reward.description}</p>
      </div>
      {unlocked && (
        <div className="text-green-500">
          <Trophy className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

export default function LearningStreakTracker({ 
  streak = 0, 
  longestStreak = 0,
  streakData = {},
  onNavigate,
  loading = false 
}) {
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const nextMilestone = getNextMilestone(streak);
  const streakEmoji = getStreakEmoji(streak);

  // Animate streak number
  useEffect(() => {
    if (streak === 0) return;
    
    const duration = 1500;
    const steps = 30;
    const increment = streak / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= streak) {
        setAnimatedStreak(streak);
        clearInterval(timer);
      } else {
        setAnimatedStreak(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [streak]);

  const rewards = [
    { id: 1, title: '3-Day Warrior', description: '+50 XP bonus', days: 3 },
    { id: 2, title: '7-Day Champion', description: '+100 XP bonus', days: 7 },
    { id: 3, title: '30-Day Legend', description: 'Exclusive badge', days: 30 }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-6 h-6" />
              <h3 className="font-bold text-lg">Learning Streak</h3>
            </div>
            <p className="text-orange-100 text-sm">Keep the fire burning!</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              {streakEmoji} {animatedStreak}
            </div>
            <p className="text-orange-200 text-xs">days</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 bg-violet-50 rounded-xl">
            <TrendingUp className="w-5 h-5 text-violet-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-violet-600">{streak}</p>
            <p className="text-xs text-gray-500">Current</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-xl">
            <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-amber-600">{longestStreak}</p>
            <p className="text-xs text-gray-500">Longest</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <Target className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{nextMilestone}</p>
            <p className="text-xs text-gray-500">Next Goal</p>
          </div>
        </div>

        {/* Weekly calendar */}
        <div className="mb-5">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            This Week
          </h4>
          <WeeklyCalendar streakData={streakData} />
        </div>

        {/* Milestone progress */}
        <MilestoneProgress current={streak} next={nextMilestone} />

        {/* Streak rewards */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Streak Rewards
          </h4>
          <div className="space-y-2">
            {rewards.map(reward => (
              <StreakReward 
                key={reward.id}
                reward={reward}
                unlocked={streak >= reward.days}
              />
            ))}
          </div>
        </div>

        {/* Streak protection */}
        {streak > 0 && (
          <div className="mt-4 p-3 bg-violet-50 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Shield className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-violet-700">Streak Shield</p>
              <p className="text-xs text-gray-600">
                {streakData.freezesAvailable || 0} freeze{(streakData.freezesAvailable || 0) !== 1 ? 's' : ''} available
              </p>
            </div>
            <Zap className="w-4 h-4 text-violet-500" />
          </div>
        )}
      </div>
    </div>
  );
}
