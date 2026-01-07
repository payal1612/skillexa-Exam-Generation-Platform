import { useState, useEffect } from 'react';
import { 
  Activity, 
  BookOpen, 
  Award, 
  Trophy, 
  Zap, 
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  MessageSquare,
  Target,
  Users,
  ChevronRight,
  Filter
} from 'lucide-react';

const ACTIVITY_TYPES = {
  exam_completed: {
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
    label: 'Exam Completed'
  },
  exam_passed: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-600',
    label: 'Exam Passed'
  },
  certificate_earned: {
    icon: Award,
    color: 'bg-amber-100 text-amber-600',
    label: 'Certificate Earned'
  },
  achievement_unlocked: {
    icon: Trophy,
    color: 'bg-purple-100 text-purple-600',
    label: 'Achievement Unlocked'
  },
  xp_earned: {
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600',
    label: 'XP Earned'
  },
  level_up: {
    icon: Star,
    color: 'bg-pink-100 text-pink-600',
    label: 'Level Up'
  },
  challenge_joined: {
    icon: Target,
    color: 'bg-orange-100 text-orange-600',
    label: 'Challenge Joined'
  },
  challenge_completed: {
    icon: Trophy,
    color: 'bg-green-100 text-green-600',
    label: 'Challenge Completed'
  },
  skill_improved: {
    icon: TrendingUp,
    color: 'bg-violet-100 text-violet-600',
    label: 'Skill Improved'
  },
  streak_milestone: {
    icon: Zap,
    color: 'bg-red-100 text-red-600',
    label: 'Streak Milestone'
  },
  comment: {
    icon: MessageSquare,
    color: 'bg-gray-100 text-gray-600',
    label: 'Comment'
  },
  follow: {
    icon: Users,
    color: 'bg-indigo-100 text-indigo-600',
    label: 'New Follower'
  }
};

function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ActivityItem({ activity, index }) {
  const type = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.xp_earned;
  const Icon = type.icon;

  return (
    <div 
      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`p-2 rounded-xl ${type.color} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{activity.title}</span>
          {activity.details && (
            <span className="text-gray-500"> • {activity.details}</span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">
            {formatRelativeTime(activity.timestamp || activity.createdAt)}
          </span>
          {activity.xp && (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-0.5">
              <Zap className="w-3 h-3" />
              +{activity.xp} XP
            </span>
          )}
        </div>
      </div>

      {activity.image && (
        <img 
          src={activity.image} 
          alt=""
          className="w-10 h-10 rounded-lg object-cover"
        />
      )}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-1/4 mt-2 animate-pulse" />
      </div>
    </div>
  );
}

function EmptyState({ filter, onReset }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Activity className="w-8 h-8 text-gray-400" />
      </div>
      <h4 className="font-medium text-gray-900 mb-1">No activity yet</h4>
      <p className="text-sm text-gray-500 mb-4">
        {filter !== 'all' 
          ? 'No activities match this filter' 
          : 'Start learning to see your activity here'
        }
      </p>
      {filter !== 'all' && (
        <button
          onClick={onReset}
          className="text-violet-600 hover:text-violet-700 text-sm font-medium"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}

export default function RecentActivityFeed({ 
  activities = [], 
  onLoadMore,
  onNavigate,
  loading = false,
  hasMore = false
}) {
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { id: 'all', label: 'All Activity' },
    { id: 'exams', label: 'Exams', types: ['exam_completed', 'exam_passed'] },
    { id: 'achievements', label: 'Achievements', types: ['achievement_unlocked', 'certificate_earned'] },
    { id: 'progress', label: 'Progress', types: ['xp_earned', 'level_up', 'skill_improved'] },
    { id: 'challenges', label: 'Challenges', types: ['challenge_joined', 'challenge_completed'] }
  ];

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    const filterOption = filterOptions.find(f => f.id === filter);
    return filterOption?.types?.includes(activity.type);
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp || activity.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
    
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(activity);
    return groups;
  }, {});

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">{activities.length} activities</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl transition-colors ${
              showFilters ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filter tabs */}
        {showFilters && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {filterOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === option.id
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activity list */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-2">
            {[1, 2, 3, 4, 5].map(i => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="p-2">
            {Object.entries(groupedActivities).map(([date, items]) => (
              <div key={date} className="mb-4">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {date}
                </p>
                {items.map((activity, index) => (
                  <ActivityItem 
                    key={activity._id || activity.id || index} 
                    activity={activity}
                    index={index}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState filter={filter} onReset={() => setFilter('all')} />
        )}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLoadMore}
            className="w-full py-2.5 text-center text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            Load More
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View all link */}
      {activities.length > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onNavigate?.('analytics')}
            className="w-full py-2.5 text-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            View Full History
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
