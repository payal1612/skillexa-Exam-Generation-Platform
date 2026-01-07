import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  User, 
  BookOpen, 
  Award, 
  Target, 
  Trophy,
  Zap,
  ChevronRight,
  X,
  Sparkles,
  Gift
} from 'lucide-react';

const CHECKLIST_ITEMS = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your name, bio, and profile picture',
    icon: User,
    points: 50,
    action: 'profile',
    checkFn: (user) => user?.name && user?.bio
  },
  {
    id: 'first_exam',
    title: 'Take your first exam',
    description: 'Generate and complete an AI-powered exam',
    icon: BookOpen,
    points: 100,
    action: 'exam-generator',
    checkFn: (analytics) => analytics?.totalExams >= 1
  },
  {
    id: 'pass_exam',
    title: 'Pass an exam',
    description: 'Score 70% or higher on any exam',
    icon: CheckCircle,
    points: 150,
    action: 'exam-generator',
    checkFn: (analytics) => analytics?.passedExams >= 1
  },
  {
    id: 'earn_certificate',
    title: 'Earn a certificate',
    description: 'Complete an exam with flying colors',
    icon: Award,
    points: 200,
    action: 'certificates',
    checkFn: (analytics) => analytics?.certificates >= 1
  },
  {
    id: 'set_career',
    title: 'Set your career path',
    description: 'Choose a career roadmap to follow',
    icon: Target,
    points: 75,
    action: 'career-roadmap',
    checkFn: (user) => user?.careerPath
  },
  {
    id: 'join_challenge',
    title: 'Join a challenge',
    description: 'Participate in a weekly challenge',
    icon: Trophy,
    points: 100,
    action: 'challenges',
    checkFn: (stats) => stats?.challengesJoined >= 1
  },
  {
    id: 'daily_streak',
    title: 'Start a learning streak',
    description: 'Learn for 3 consecutive days',
    icon: Zap,
    points: 150,
    action: null,
    checkFn: (gamification) => gamification?.currentStreak >= 3
  }
];

export default function OnboardingChecklist({ 
  user, 
  analytics, 
  gamification, 
  onNavigate, 
  onDismiss,
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [completedItems, setCompletedItems] = useState([]);

  // Check completion status of each item
  useEffect(() => {
    const completed = CHECKLIST_ITEMS.filter(item => {
      switch (item.id) {
        case 'profile':
          return item.checkFn(user);
        case 'first_exam':
        case 'pass_exam':
        case 'earn_certificate':
          return item.checkFn(analytics);
        case 'daily_streak':
          return item.checkFn(gamification);
        default:
          return false;
      }
    }).map(item => item.id);
    
    setCompletedItems(completed);
  }, [user, analytics, gamification]);

  const completedCount = completedItems.length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const totalPoints = CHECKLIST_ITEMS.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = CHECKLIST_ITEMS
    .filter(item => completedItems.includes(item.id))
    .reduce((sum, item) => sum + item.points, 0);

  // Don't show if all completed
  if (completedCount === totalCount) {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-4 text-white text-left group hover:shadow-lg transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Getting Started</p>
              <p className="text-sm text-violet-200">{completedCount}/{totalCount} tasks completed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{progress}%</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Getting Started</h3>
              <p className="text-sm text-violet-200">Complete tasks to earn XP</p>
            </div>
          </div>
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{completedCount} of {totalCount} completed</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Gift className="w-4 h-4 text-yellow-300" />
              <span className="font-bold">{earnedPoints}</span>
            </div>
            <p className="text-xs text-violet-200">of {totalPoints} XP</p>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        {CHECKLIST_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isCompleted = completedItems.includes(item.id);
          
          return (
            <div
              key={item.id}
              onClick={() => !isCompleted && item.action && onNavigate?.(item.action)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                isCompleted 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-gray-50 hover:bg-violet-50 cursor-pointer border border-transparent hover:border-violet-100'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-2 rounded-lg ${
                isCompleted ? 'bg-green-100' : 'bg-white'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Icon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${isCompleted ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                  {item.title}
                </p>
                <p className="text-sm text-gray-500 truncate">{item.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                  isCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-violet-100 text-violet-700'
                }`}>
                  +{item.points} XP
                </span>
                {!isCompleted && item.action && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
