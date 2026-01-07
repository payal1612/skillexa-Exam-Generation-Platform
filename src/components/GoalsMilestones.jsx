import { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  CheckCircle, 
  Circle, 
  Trophy,
  Calendar,
  TrendingUp,
  ChevronRight,
  Edit3,
  X,
  Sparkles,
  Star,
  Flag,
  Clock,
  Trash2
} from 'lucide-react';

const GOAL_CATEGORIES = [
  { id: 'skill', label: 'Learn Skill', icon: '📚', color: 'violet' },
  { id: 'exam', label: 'Pass Exams', icon: '📝', color: 'blue' },
  { id: 'streak', label: 'Streak Goal', icon: '🔥', color: 'orange' },
  { id: 'certificate', label: 'Earn Certificate', icon: '🏆', color: 'amber' },
  { id: 'career', label: 'Career Milestone', icon: '🚀', color: 'green' },
  { id: 'custom', label: 'Custom Goal', icon: '⭐', color: 'pink' }
];

const MILESTONES = [
  { id: 1, title: 'First Steps', description: 'Complete first exam', icon: '🎯', xp: 100, completed: true },
  { id: 2, title: 'Rising Star', description: 'Reach Level 5', icon: '⭐', xp: 500, completed: true },
  { id: 3, title: 'Skill Master', description: 'Master 3 skills', icon: '💪', xp: 1000, completed: false },
  { id: 4, title: 'Certificate Pro', description: 'Earn 5 certificates', icon: '🏅', xp: 2000, completed: false },
  { id: 5, title: 'Legend', description: 'Reach Level 20', icon: '👑', xp: 5000, completed: false }
];

function GoalCard({ goal, onToggle, onDelete, index }) {
  const category = GOAL_CATEGORIES.find(c => c.id === goal.category) || GOAL_CATEGORIES[5];
  const progress = goal.progress || 0;
  const isOverdue = goal.dueDate && new Date(goal.dueDate) < new Date() && !goal.completed;

  const colorClasses = {
    violet: { bg: 'bg-violet-100', text: 'text-violet-600', bar: 'bg-violet-500' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-500' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', bar: 'bg-amber-500' },
    green: { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-500' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600', bar: 'bg-pink-500' }
  };

  const colors = colorClasses[category.color] || colorClasses.violet;

  return (
    <div 
      className={`group bg-white border rounded-xl p-4 transition-all hover:shadow-md animate-fade-in ${
        goal.completed ? 'border-green-200 bg-green-50/30' : isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle?.(goal)}
          className={`mt-0.5 p-1 rounded-full transition-colors ${
            goal.completed ? 'text-green-500' : 'text-gray-300 hover:text-violet-500'
          }`}
        >
          {goal.completed ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span>{category.icon}</span>
            <h4 className={`font-semibold ${goal.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
              {goal.title}
            </h4>
          </div>
          
          {goal.description && (
            <p className="text-sm text-gray-500 line-clamp-1 mb-2">{goal.description}</p>
          )}

          {/* Progress bar */}
          {!goal.completed && goal.target && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{goal.current || 0} / {goal.target}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {goal.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(goal.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {goal.xpReward && (
              <div className="flex items-center gap-1 text-amber-600">
                <Star className="w-3.5 h-3.5" />
                <span>+{goal.xpReward} XP</span>
              </div>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete?.(goal)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MilestoneCard({ milestone, index }) {
  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        milestone.completed ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`text-2xl ${milestone.completed ? '' : 'grayscale opacity-50'}`}>
        {milestone.icon}
      </div>
      <div className="flex-1">
        <h4 className={`font-medium ${milestone.completed ? 'text-green-700' : 'text-gray-500'}`}>
          {milestone.title}
        </h4>
        <p className="text-xs text-gray-500">{milestone.description}</p>
      </div>
      <div className={`text-sm font-semibold ${milestone.completed ? 'text-green-600' : 'text-gray-400'}`}>
        +{milestone.xp} XP
      </div>
      {milestone.completed && (
        <CheckCircle className="w-5 h-5 text-green-500" />
      )}
    </div>
  );
}

function AddGoalModal({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('skill');
  const [target, setTarget] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd?.({
      id: Date.now(),
      title: title.trim(),
      category,
      target: target ? parseInt(target) : null,
      current: 0,
      progress: 0,
      dueDate: dueDate || null,
      completed: false,
      xpReward: 50
    });
    
    // Reset form
    setTitle('');
    setCategory('skill');
    setTarget('');
    setDueDate('');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md animate-scale-in">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Add New Goal</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Learn React basics"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    category === cat.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-violet-200'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <p className="text-xs text-gray-600 mt-1">{cat.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Target (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target (optional)</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 5 exams"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Due date (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </button>
        </form>
      </div>
    </div>
  );
}

export default function GoalsMilestones({ 
  goals: initialGoals = [], 
  milestones = MILESTONES,
  onUpdateGoals,
  loading = false 
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('goals'); // 'goals' or 'milestones'
  const [filter, setFilter] = useState('active'); // 'active', 'completed', 'all'

  useEffect(() => {
    setGoals(initialGoals);
  }, [initialGoals]);

  const handleAddGoal = (newGoal) => {
    const updated = [...goals, newGoal];
    setGoals(updated);
    onUpdateGoals?.(updated);
  };

  const handleToggleGoal = (goal) => {
    const updated = goals.map(g => 
      g.id === goal.id ? { ...g, completed: !g.completed } : g
    );
    setGoals(updated);
    onUpdateGoals?.(updated);
  };

  const handleDeleteGoal = (goal) => {
    const updated = goals.filter(g => g.id !== goal.id);
    setGoals(updated);
    onUpdateGoals?.(updated);
  };

  const filteredGoals = goals.filter(g => {
    if (filter === 'active') return !g.completed;
    if (filter === 'completed') return g.completed;
    return true;
  });

  const completedGoals = goals.filter(g => g.completed).length;
  const completedMilestones = milestones.filter(m => m.completed).length;

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
            <div className="p-2 bg-purple-100 rounded-xl">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Goals & Milestones</h3>
              <p className="text-sm text-gray-500">
                {completedGoals} goals • {completedMilestones} milestones achieved
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-violet-100 text-violet-600 rounded-xl hover:bg-violet-200 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'goals'
              ? 'text-violet-600 border-b-2 border-violet-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Flag className="w-4 h-4 inline-block mr-1.5" />
          Goals ({goals.length})
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'milestones'
              ? 'text-violet-600 border-b-2 border-violet-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Trophy className="w-4 h-4 inline-block mr-1.5" />
          Milestones ({milestones.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'goals' && (
          <>
            {/* Filter */}
            <div className="flex gap-2 mb-4">
              {['active', 'completed', 'all'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Goals list */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredGoals.length > 0 ? (
                filteredGoals.map((goal, index) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onToggle={handleToggleGoal}
                    onDelete={handleDeleteGoal}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-3">No {filter} goals</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-violet-600 hover:text-violet-700 text-sm font-medium flex items-center gap-1 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add a goal
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {milestones.map((milestone, index) => (
              <MilestoneCard key={milestone.id} milestone={milestone} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddGoal}
      />
    </div>
  );
}
