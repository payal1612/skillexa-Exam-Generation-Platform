import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  Trophy,
  Clock,
  Users,
  Target,
  Zap,
  CheckCircle,
  Circle,
  Play,
  Pause,
  Send,
  AlertCircle,
  Star,
  Award,
  Code,
  FileText,
  Lightbulb,
  ChevronRight,
  Timer,
  Flag,
  Medal,
  Crown,
  Loader2,
  BookOpen,
  ListChecks,
  Gift,
  Sparkles
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChallengeInterface({ challenge, onBack, onComplete }) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskProgress, setTaskProgress] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [answers, setAnswers] = useState({});
  const [codeAnswers, setCodeAnswers] = useState({});

  // Initialize time remaining based on challenge duration
  useEffect(() => {
    if (challenge) {
      const durationMinutes = challenge.durationMinutes || 120;
      setTimeRemaining(durationMinutes * 60);
      
      // Initialize task progress
      const progress = {};
      challenge.tasks?.forEach((task, index) => {
        progress[index] = { completed: false, score: 0 };
      });
      setTaskProgress(progress);
    }
  }, [challenge]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (isStarted && !isPaused && !isCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitChallenge();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isPaused, isCompleted, timeRemaining]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const totalTime = (challenge?.durationMinutes || 120) * 60;
    const percentage = (timeRemaining / totalTime) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStartChallenge = () => {
    setIsStarted(true);
  };

  const handleTaskComplete = (taskIndex, score = 100) => {
    setTaskProgress(prev => ({
      ...prev,
      [taskIndex]: { completed: true, score }
    }));
    
    // Move to next task if available
    if (taskIndex < (challenge?.tasks?.length || 0) - 1) {
      setCurrentTaskIndex(taskIndex + 1);
    }
  };

  const handleAnswerChange = (taskIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [taskIndex]: answer
    }));
  };

  const handleCodeChange = (taskIndex, code) => {
    setCodeAnswers(prev => ({
      ...prev,
      [taskIndex]: code
    }));
  };

  const calculateTotalScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    
    challenge?.tasks?.forEach((task, index) => {
      maxScore += task.points || 10;
      if (taskProgress[index]?.completed) {
        totalScore += taskProgress[index].score || task.points || 10;
      }
    });
    
    return { totalScore, maxScore, percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0 };
  };

  const handleSubmitChallenge = async () => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const { totalScore, maxScore, percentage } = calculateTotalScore();
      
      const response = await axios.post(
        `${API_BASE}/api/challenges/${challenge._id}/submit`,
        {
          answers,
          codeAnswers,
          taskProgress,
          totalScore,
          timeSpent: (challenge.durationMinutes * 60) - timeRemaining
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setResults({
          ...response.data.result,
          totalScore,
          maxScore,
          percentage,
          xpEarned: response.data.xpEarned || totalScore,
          rank: response.data.rank
        });
      } else {
        // Fallback results
        setResults({
          totalScore,
          maxScore,
          percentage,
          xpEarned: totalScore,
          passed: percentage >= 60
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      // Show results anyway
      const { totalScore, maxScore, percentage } = calculateTotalScore();
      setResults({
        totalScore,
        maxScore,
        percentage,
        xpEarned: totalScore,
        passed: percentage >= 60
      });
    } finally {
      setIsSubmitting(false);
      setIsCompleted(true);
      setShowResults(true);
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'coding': return Code;
      case 'quiz': return ListChecks;
      case 'project': return FileText;
      case 'design': return Lightbulb;
      case 'analysis': return Target;
      default: return CheckCircle;
    }
  };

  const completedTasks = Object.values(taskProgress).filter(t => t.completed).length;
  const totalTasks = challenge?.tasks?.length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Results Screen
  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 animate-bounce">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Challenge Complete!</h1>
            <p className="text-xl text-gray-600">{challenge?.title}</p>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className={`p-8 text-white text-center ${
              results.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
              results.percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-pink-500'
            }`}>
              <div className="text-7xl font-bold mb-2">{results.percentage}%</div>
              <div className="text-xl opacity-90">
                {results.totalScore} / {results.maxScore} points
              </div>
            </div>

            <div className="p-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">+{results.xpEarned}</div>
                  <div className="text-sm text-gray-600">XP Earned</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{completedTasks}/{totalTasks}</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime((challenge?.durationMinutes * 60) - timeRemaining)}
                  </div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>
              </div>

              {/* Task Breakdown */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Task Breakdown</h3>
                <div className="space-y-3">
                  {challenge?.tasks?.map((task, index) => {
                    const progress = taskProgress[index];
                    const TaskIcon = getTaskIcon(task.type);
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          progress?.completed ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          <TaskIcon className={`w-5 h-5 ${
                            progress?.completed ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.type}</div>
                        </div>
                        <div className={`font-bold ${
                          progress?.completed ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {progress?.completed ? `+${progress.score || task.points}` : '0'} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={onBack}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Back to Challenges
                </button>
                <button
                  onClick={() => onComplete?.(results)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-start Screen
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{challenge?.title}</h1>
              <p className="text-gray-600">{challenge?.skill} • {challenge?.difficulty}</p>
            </div>
          </div>

          {/* Challenge Overview Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{challenge?.title}</h2>
                  <p className="text-violet-200">{challenge?.eventType?.replace('-', ' ')}</p>
                </div>
              </div>
              <p className="text-violet-100">{challenge?.description}</p>
            </div>

            <div className="p-8">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="font-bold text-gray-900">{challenge?.duration}</div>
                  <div className="text-sm text-gray-500">Duration</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <ListChecks className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="font-bold text-gray-900">{challenge?.tasks?.length || 0}</div>
                  <div className="text-sm text-gray-500">Tasks</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="font-bold text-gray-900">{challenge?.participants?.length || 0}</div>
                  <div className="text-sm text-gray-500">Participants</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <div className="font-bold text-gray-900">
                    {challenge?.tasks?.reduce((sum, t) => sum + (t.points || 10), 0) || 0}
                  </div>
                  <div className="text-sm text-gray-500">Max Points</div>
                </div>
              </div>

              {/* Tasks Preview */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-violet-600" />
                  Challenge Tasks
                </h3>
                <div className="space-y-3">
                  {challenge?.tasks?.map((task, index) => {
                    const TaskIcon = getTaskIcon(task.type);
                    return (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                          <TaskIcon className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-violet-600">{task.points || 10} pts</div>
                          <div className="text-xs text-gray-500 capitalize">{task.type}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rules */}
              {challenge?.rules?.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-600" />
                    Rules & Guidelines
                  </h3>
                  <ul className="space-y-2">
                    {challenge.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <ChevronRight className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prizes */}
              {challenge?.prizes?.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-violet-600" />
                    Prizes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {challenge.prizes.slice(0, 3).map((prize, index) => (
                      <div key={index} className={`p-4 rounded-xl border-2 ${
                        index === 0 ? 'border-yellow-400 bg-yellow-50' :
                        index === 1 ? 'border-gray-300 bg-gray-50' :
                        'border-orange-300 bg-orange-50'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          {index === 0 ? <Crown className="w-6 h-6 text-yellow-500" /> :
                           index === 1 ? <Medal className="w-6 h-6 text-gray-400" /> :
                           <Medal className="w-6 h-6 text-orange-500" />}
                          <span className="font-bold text-gray-900">#{prize.rank}</span>
                        </div>
                        <div className="font-medium text-gray-900">{prize.prize}</div>
                        {prize.description && (
                          <div className="text-sm text-gray-500">{prize.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Button */}
              <button
                onClick={handleStartChallenge}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                Start Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Challenge Interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to leave? Your progress will be saved.')) {
                    onBack();
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="font-bold text-gray-900">{challenge?.title}</h1>
                <div className="text-sm text-gray-500">
                  Task {currentTaskIndex + 1} of {totalTasks}
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold ${getTimeColor()} bg-gray-100`}>
              <Timer className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="font-bold text-gray-900">{progressPercentage}%</div>
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Task Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Tasks</h3>
                <div className="space-y-2">
                  {challenge?.tasks?.map((task, index) => {
                    const TaskIcon = getTaskIcon(task.type);
                    const isCompleted = taskProgress[index]?.completed;
                    const isCurrent = index === currentTaskIndex;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentTaskIndex(index)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isCurrent ? 'bg-violet-100 text-violet-700' :
                          isCompleted ? 'bg-green-50 text-green-700' :
                          'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-violet-600 text-white' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium truncate">{task.title}</div>
                          <div className="text-xs opacity-75">{task.points || 10} pts</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current Task */}
            <div className="lg:col-span-3">
              {challenge?.tasks?.[currentTaskIndex] && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Task Header */}
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          {(() => {
                            const TaskIcon = getTaskIcon(challenge.tasks[currentTaskIndex].type);
                            return <TaskIcon className="w-6 h-6" />;
                          })()}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{challenge.tasks[currentTaskIndex].title}</h2>
                          <p className="text-violet-200 capitalize">{challenge.tasks[currentTaskIndex].type} Task</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{challenge.tasks[currentTaskIndex].points || 10}</div>
                        <div className="text-violet-200 text-sm">points</div>
                      </div>
                    </div>
                  </div>

                  {/* Task Content */}
                  <div className="p-6">
                    <p className="text-gray-700 mb-6 text-lg">
                      {challenge.tasks[currentTaskIndex].description}
                    </p>

                    {/* Task Type Specific UI */}
                    {challenge.tasks[currentTaskIndex].type === 'coding' && (
                      <div className="mb-6">
                        <label className="block font-medium text-gray-700 mb-2">
                          Your Code Solution
                        </label>
                        <textarea
                          value={codeAnswers[currentTaskIndex] || ''}
                          onChange={(e) => handleCodeChange(currentTaskIndex, e.target.value)}
                          placeholder="// Write your code here..."
                          className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-xl border-0 focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    )}

                    {challenge.tasks[currentTaskIndex].type === 'quiz' && (
                      <div className="mb-6">
                        <label className="block font-medium text-gray-700 mb-2">
                          Your Answer
                        </label>
                        <textarea
                          value={answers[currentTaskIndex] || ''}
                          onChange={(e) => handleAnswerChange(currentTaskIndex, e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {(challenge.tasks[currentTaskIndex].type === 'project' || 
                      challenge.tasks[currentTaskIndex].type === 'design' ||
                      challenge.tasks[currentTaskIndex].type === 'analysis') && (
                      <div className="mb-6">
                        <label className="block font-medium text-gray-700 mb-2">
                          Your Solution
                        </label>
                        <textarea
                          value={answers[currentTaskIndex] || ''}
                          onChange={(e) => handleAnswerChange(currentTaskIndex, e.target.value)}
                          placeholder="Describe your approach and solution..."
                          className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Task Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <button
                        onClick={() => setCurrentTaskIndex(Math.max(0, currentTaskIndex - 1))}
                        disabled={currentTaskIndex === 0}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous Task
                      </button>

                      <div className="flex items-center gap-3">
                        {!taskProgress[currentTaskIndex]?.completed && (
                          <button
                            onClick={() => handleTaskComplete(currentTaskIndex, challenge.tasks[currentTaskIndex].points || 10)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Complete
                          </button>
                        )}

                        {currentTaskIndex < totalTasks - 1 ? (
                          <button
                            onClick={() => setCurrentTaskIndex(currentTaskIndex + 1)}
                            className="px-6 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors flex items-center gap-2"
                          >
                            Next Task
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmitChallenge}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Flag className="w-4 h-4" />
                            )}
                            Submit Challenge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{completedTasks} of {totalTasks} completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700">{calculateTotalScore().totalScore} points earned</span>
              </div>
            </div>
            
            <button
              onClick={handleSubmitChallenge}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Challenge
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
