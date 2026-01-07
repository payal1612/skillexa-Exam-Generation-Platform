import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  Clock,
  ChevronRight
} from 'lucide-react';

// Mini sparkline chart
const SparklineChart = ({ data, color = 'violet', height = 40 }) => {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-end justify-between gap-0.5" 
        style={{ height: `${height}px` }}
      >
        {[...Array(7)].map((_, i) => (
          <div 
            key={i} 
            className="flex-1 bg-gray-200 rounded-t animate-pulse"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    );
  }

  const max = Math.max(...data, 1);
  
  return (
    <div 
      className="flex items-end justify-between gap-0.5" 
      style={{ height: `${height}px` }}
    >
      {data.map((value, i) => (
        <div 
          key={i} 
          className={`flex-1 bg-${color}-400 rounded-t transition-all duration-300 hover:bg-${color}-500`}
          style={{ 
            height: `${Math.max((value / max) * 100, 5)}%`,
            opacity: 0.5 + (i / data.length) * 0.5
          }}
        />
      ))}
    </div>
  );
};

// Circular progress indicator
const CircularProgress = ({ value, size = 60, strokeWidth = 6, color = 'violet' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`text-${color}-500 transition-all duration-500`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-900">{value}%</span>
      </div>
    </div>
  );
};

// Stats comparison badge
const ComparisonBadge = ({ current, previous }) => {
  if (!previous || previous === 0) return null;
  
  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;
  const Icon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  
  return (
    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
      isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      <Icon className="w-3 h-3" />
      <span>{Math.abs(change).toFixed(1)}%</span>
    </div>
  );
};

// Weekly Activity Heatmap
const WeeklyHeatmap = ({ data }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxValue = Math.max(...(data || [0]), 1);
  
  return (
    <div className="flex gap-1">
      {days.map((day, i) => {
        const value = data?.[i] || 0;
        const intensity = value / maxValue;
        
        return (
          <div key={day} className="flex flex-col items-center gap-1">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all hover:scale-110"
              style={{
                backgroundColor: intensity > 0 
                  ? `rgba(139, 92, 246, ${0.2 + intensity * 0.8})` 
                  : '#f3f4f6',
                color: intensity > 0.5 ? 'white' : '#6b7280'
              }}
            >
              {value}
            </div>
            <span className="text-xs text-gray-400">{day.slice(0, 1)}</span>
          </div>
        );
      })}
    </div>
  );
};

// Quick Stats Card
export const QuickStatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'violet',
  sparklineData,
  change,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-${color}-100 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        {change && <ComparisonBadge current={value} previous={change} />}
      </div>
      
      <div className="mb-3">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      
      {sparklineData && (
        <div className="mb-3">
          <SparklineChart data={sparklineData} color={color} />
        </div>
      )}
      
      {subtitle && (
        <p className="text-xs text-gray-400">{subtitle}</p>
      )}
    </div>
  );
};

// Progress Stats Card
export const ProgressStatsCard = ({ 
  title, 
  current, 
  total, 
  icon: Icon, 
  color = 'violet',
  onClick 
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg bg-${color}-100`}>
              <Icon className={`w-4 h-4 text-${color}-600`} />
            </div>
            <span className="text-sm font-medium text-gray-600">{title}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{current} / {total}</p>
        </div>
        <CircularProgress value={percentage} color={color} />
      </div>
    </div>
  );
};

// Activity Overview Card
export const ActivityOverviewCard = ({ weeklyData, totalActivities, streak }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Weekly Activity</h3>
        <div className="flex items-center gap-2 text-orange-500">
          <Activity className="w-4 h-4" />
          <span className="text-sm font-medium">{streak} day streak</span>
        </div>
      </div>
      
      <WeeklyHeatmap data={weeklyData} />
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Total this week</span>
          <span className="font-bold text-gray-900">{totalActivities} activities</span>
        </div>
      </div>
    </div>
  );
};

// Stats Overview Section
export default function StatsOverview({ analytics, onNavigate }) {
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
  
  useEffect(() => {
    // Generate mock weekly data from analytics
    if (analytics?.recentResults) {
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return analytics.recentResults.filter(r => {
          const resultDate = new Date(r.date);
          return resultDate.toDateString() === date.toDateString();
        }).length;
      });
      setWeeklyData(last7Days);
    }
  }, [analytics]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <QuickStatsCard
        title="Average Score"
        value={`${analytics?.averageScore || 0}%`}
        icon={Target}
        color="green"
        sparklineData={analytics?.recentResults?.slice(-7).map(r => r.score)}
        subtitle="Last 7 exams"
        onClick={() => onNavigate?.('analytics')}
      />
      
      <QuickStatsCard
        title="Total Exams"
        value={analytics?.totalExams || 0}
        icon={BarChart3}
        color="blue"
        change={analytics?.totalExams > 0 ? analytics.totalExams - 1 : 0}
        subtitle="All time"
        onClick={() => onNavigate?.('exam-status')}
      />
      
      <ProgressStatsCard
        title="Pass Rate"
        current={analytics?.passedExams || 0}
        total={analytics?.totalExams || 0}
        icon={TrendingUp}
        color="emerald"
        onClick={() => onNavigate?.('analytics')}
      />
      
      <QuickStatsCard
        title="Certificates"
        value={analytics?.certificates || 0}
        icon={Calendar}
        color="purple"
        subtitle="Earned"
        onClick={() => onNavigate?.('certificates')}
      />
    </div>
  );
}

export { SparklineChart, CircularProgress, WeeklyHeatmap, ComparisonBadge };
