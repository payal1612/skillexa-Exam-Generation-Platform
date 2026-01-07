import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  Target, 
  ChevronRight, 
  Star,
  Zap,
  BookOpen,
  Code,
  Database,
  Cloud,
  Palette,
  Brain
} from 'lucide-react';

const SKILL_ICONS = {
  javascript: Code,
  python: Code,
  react: Code,
  nodejs: Code,
  database: Database,
  sql: Database,
  aws: Cloud,
  cloud: Cloud,
  design: Palette,
  uiux: Palette,
  ml: Brain,
  ai: Brain,
  default: BookOpen
};

const SKILL_COLORS = {
  javascript: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  python: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
  react: { bg: 'bg-cyan-100', text: 'text-cyan-700', bar: 'bg-cyan-500' },
  nodejs: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
  database: { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-500' },
  cloud: { bg: 'bg-indigo-100', text: 'text-indigo-700', bar: 'bg-indigo-500' },
  design: { bg: 'bg-pink-100', text: 'text-pink-700', bar: 'bg-pink-500' },
  ml: { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500' },
  default: { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-500' }
};

function AnimatedProgress({ value, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function SkillCard({ skill, index, onNavigate }) {
  const skillKey = skill.name?.toLowerCase().replace(/\s+/g, '') || 'default';
  const iconKey = Object.keys(SKILL_ICONS).find(key => skillKey.includes(key)) || 'default';
  const Icon = SKILL_ICONS[iconKey];
  const colors = SKILL_COLORS[iconKey] || SKILL_COLORS.default;
  
  const level = Math.floor(skill.progress / 20) + 1;
  const levelProgress = (skill.progress % 20) * 5;

  return (
    <div 
      className="group bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-violet-200 transition-all cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => onNavigate?.('skills')}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 ${colors.bg} rounded-xl group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-gray-900 truncate">{skill.name}</h4>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span>Lvl {level}</span>
            </div>
          </div>
          
          <AnimatedProgress value={skill.progress} color={colors.bar} delay={index * 100} />
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {skill.progress}% Complete
            </span>
            <span className="text-xs text-gray-400">
              {skill.examsCompleted || 0} exams
            </span>
          </div>
        </div>
      </div>
      
      {/* Level progress */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>To Level {level + 1}</span>
          <span>{levelProgress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-violet-400 rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SkillProgressTracker({ skills = [], onNavigate, loading = false }) {
  const [sortBy, setSortBy] = useState('progress'); // 'progress', 'recent', 'name'
  
  const sortedSkills = [...skills].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return b.progress - a.progress;
      case 'recent':
        return new Date(b.lastPracticed || 0) - new Date(a.lastPracticed || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const topSkills = sortedSkills.slice(0, 4);
  const averageProgress = skills.length > 0 
    ? Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / skills.length)
    : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Skill Progress</h3>
              <p className="text-sm text-gray-500">{skills.length} skills tracked</p>
            </div>
          </div>
          
          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm text-gray-600 bg-gray-50 border-0 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-violet-500"
          >
            <option value="progress">By Progress</option>
            <option value="recent">Recent</option>
            <option value="name">A-Z</option>
          </select>
        </div>

        {/* Overall stats */}
        <div className="mt-4 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Average Progress</p>
            <p className="text-2xl font-bold text-violet-600">{averageProgress}%</p>
          </div>
          <div className="w-20 h-20 relative">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#8B5CF6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${averageProgress * 2.01} 201`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Skills grid */}
      <div className="p-4">
        {topSkills.length > 0 ? (
          <div className="grid gap-3">
            {topSkills.map((skill, index) => (
              <SkillCard 
                key={skill._id || skill.name} 
                skill={skill} 
                index={index}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No skills tracked yet</p>
            <button
              onClick={() => onNavigate?.('exam-generator')}
              className="text-violet-600 hover:text-violet-700 text-sm font-medium"
            >
              Take an exam to start
            </button>
          </div>
        )}
      </div>

      {/* View all link */}
      {skills.length > 4 && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onNavigate?.('skills')}
            className="w-full py-2.5 text-center text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            View All {skills.length} Skills
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
