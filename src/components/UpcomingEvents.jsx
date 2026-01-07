import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  ChevronRight,
  Flame,
  Zap,
  Star,
  Timer,
  AlertCircle,
  Bell
} from 'lucide-react';

function getTimeUntilEnd(endDate) {
  const now = new Date();
  const deadline = new Date(endDate);
  const delta = deadline - now;
  
  if (delta <= 0) return 'Ended';
  
  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const EVENT_TYPES = {
  challenge: { 
    icon: Trophy, 
    color: 'bg-orange-100 text-orange-600', 
    border: 'border-orange-200',
    label: 'Challenge'
  },
  exam: { 
    icon: Clock, 
    color: 'bg-blue-100 text-blue-600', 
    border: 'border-blue-200',
    label: 'Exam'
  },
  workshop: { 
    icon: Users, 
    color: 'bg-purple-100 text-purple-600', 
    border: 'border-purple-200',
    label: 'Workshop'
  },
  deadline: { 
    icon: AlertCircle, 
    color: 'bg-red-100 text-red-600', 
    border: 'border-red-200',
    label: 'Deadline'
  },
  streak: { 
    icon: Flame, 
    color: 'bg-yellow-100 text-yellow-600', 
    border: 'border-yellow-200',
    label: 'Streak Goal'
  }
};

function EventCard({ event, onJoin, index }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilEnd(event.endDate));
  const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.challenge;
  const Icon = eventType.icon;
  
  const isUrgent = useMemo(() => {
    return new Date(event.endDate) - new Date() < 24 * 60 * 60 * 1000;
  }, [event.endDate]);

  const handleJoin = useCallback(() => {
    onJoin?.(event);
  }, [event, onJoin]);
  
  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft(getTimeUntilEnd(event.endDate));
    }, 60000);
    
    return () => clearInterval(tick);
  }, [event.endDate]);

  return (
    <div 
      className={`group bg-white border rounded-xl p-4 hover:shadow-md transition-all ${isUrgent ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}
      style={{ animation: `fadeIn 0.4s ease-out ${index * 50}ms both` }}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 ${eventType.color} rounded-xl flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${eventType.color} mb-1`}>
                {eventType.label}
              </span>
              <h4 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h4>
            </div>
            {isUrgent && (
              <span className="flex-shrink-0 animate-pulse">
                <Bell className="w-4 h-4 text-red-500" />
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{event.description}</p>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Timer className="w-3.5 h-3.5" />
              <span className={isUrgent ? 'text-red-600 font-medium' : ''}>{timeLeft}</span>
            </div>
            
            {event.participants && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Users className="w-3.5 h-3.5" />
                <span>{Array.isArray(event.participants) ? event.participants.length : event.participants} joined</span>
              </div>
            )}
            
            {event.reward && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <Zap className="w-3.5 h-3.5" />
                <span>+{event.reward} XP</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {event.canJoin && (
        <button
          onClick={handleJoin}
          className="w-full mt-3 py-2 px-4 bg-violet-50 hover:bg-violet-100 active:bg-violet-200 text-violet-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1"
          aria-label={`${event.isJoined ? 'Continue' : 'Join'} ${event.title}`}
        >
          {event.isJoined ? 'Continue' : 'Join Now'}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function CountdownDisplay({ endDate }) {
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const deadline = new Date(endDate);
      const remaining = Math.max(0, deadline - now);
      
      setElapsed({
        days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
        hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((remaining % (1000 * 60)) / 1000)
      });
    };
    
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const units = ['days', 'hours', 'minutes', 'seconds'];

  return (
    <div className="flex items-center gap-2">
      {units.map((unit) => (
        <div key={unit} className="text-center">
          <div className="bg-gray-900 text-white px-2 py-1 rounded-lg min-w-[36px] text-sm">
            <span className="font-mono font-bold">{String(elapsed[unit]).padStart(2, '0')}</span>
          </div>
          <span className="text-[10px] text-gray-500 uppercase mt-0.5">{unit[0]}</span>
        </div>
      ))}
    </div>
  );
}

export default function UpcomingEvents({ 
  events = [], 
  challenges = [],
  onNavigate, 
  onJoin,
  loading = false 
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const allItems = useMemo(() => {
    const combined = [
      ...events,
      ...challenges.map(c => ({
        ...c,
        type: 'challenge',
        canJoin: true,
        reward: c.xpReward
      }))
    ];
    return combined.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  }, [events, challenges]);

  const visible = useMemo(() => {
    return activeFilter === 'all' 
      ? allItems 
      : allItems.filter(e => e.type === activeFilter);
  }, [activeFilter, allItems]);

  const featured = useMemo(() => allItems[0] || null, [allItems]);
  
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);
  
  const goTo = useCallback((path) => {
    onNavigate?.(path);
  }, [onNavigate]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
              <p className="text-sm text-gray-500">{allItems.length} active</p>
            </div>
          </div>
          
          <button
            onClick={() => goTo('challenges')}
            className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 rounded px-2"
          >
            View All
          </button>
        </div>
      </div>

      {featured && (
        <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
              🔥 Featured
            </span>
            <Star className="w-4 h-4 text-yellow-300" />
          </div>
          <h4 className="font-bold text-lg mb-1">{featured.title}</h4>
          <p className="text-sm text-violet-100 mb-3">{featured.description}</p>
          
          <div className="flex items-center justify-between">
            <CountdownDisplay endDate={featured.endDate} />
            <button
              onClick={() => onJoin?.(featured)}
              className="px-4 py-2 bg-white text-violet-600 rounded-lg text-sm font-semibold hover:bg-violet-50 active:bg-violet-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
            >
              Join Now
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pt-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {['all', 'challenge', 'exam', 'workshop'].map(type => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 ${
              activeFilter === type
                ? 'bg-violet-100 text-violet-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            aria-pressed={activeFilter === type}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {visible.length > 0 ? (
          visible.slice(0, 5).map((event, idx) => (
            <EventCard 
              key={event._id || event.id || idx} 
              event={event} 
              onJoin={onJoin}
              index={idx}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No upcoming events</p>
            <button
              onClick={() => goTo('challenges')}
              className="text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 rounded px-2"
            >
              Browse challenges
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
