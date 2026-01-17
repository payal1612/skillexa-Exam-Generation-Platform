import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Target,
  Clock,
  BookOpen,
  Award,
  Play,
  CheckCircle,
  Circle,
  ChevronRight,
  Zap,
  TrendingUp,
  Calendar,
  ExternalLink,
  Loader2,
  Map,
  GraduationCap,
  Code,
  Database,
  Cpu,
  Server,
  Brain,
  Settings,
  Star,
  Lock,
  Video,
  Users,
  Trophy,
  BarChart3,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const careerIcons = {
  'frontend-developer': Code,
  'data-analyst': BarChart3,
  'iot-engineer': Cpu,
  'backend-developer': Server,
  'machine-learning-engineer': Brain,
  'devops-engineer': Settings
};

const CareerRoadmapPage = ({ onBack, onStartExam }) => {
  const [careerPaths, setCareerPaths] = useState([]);
  const [userRoadmaps, setUserRoadmaps] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [joiningSession, setJoiningSession] = useState(null);
  const [customCareerGoal, setCustomCareerGoal] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [takingExam, setTakingExam] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pathsRes, roadmapsRes] = await Promise.all([
        axios.get(`${API_URL}/career/paths`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/career/my-roadmaps`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setCareerPaths(pathsRes.data.careerPaths || []);
      setUserRoadmaps(roadmapsRes.data.roadmaps || []);

      // If user has an active roadmap, show it
      const activeRoadmapData = roadmapsRes.data.roadmaps?.find(r => r.status === 'active');
      if (activeRoadmapData) {
        setActiveRoadmap(activeRoadmapData);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load career paths');
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    if (!selectedPath) return;

    try {
      setGenerating(true);
      setError('');

      const res = await axios.post(
        `${API_URL}/career/generate`,
        {
          careerGoal: selectedPath.id,
          currentLevel: selectedLevel
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setActiveRoadmap(res.data.roadmap);
        setUserRoadmaps([res.data.roadmap, ...userRoadmaps]);
        setSelectedPath(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const updateMilestoneStatus = async (milestoneId, status) => {
    try {
      const res = await axios.put(
        `${API_URL}/career/${activeRoadmap._id}/milestone`,
        { milestoneId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setActiveRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const updateCourseStatus = async (courseId, completed) => {
    try {
      const res = await axios.put(
        `${API_URL}/career/${activeRoadmap._id}/course`,
        { courseId, completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setActiveRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const updateExamStatus = async (examId, status, score) => {
    try {
      const res = await axios.put(
        `${API_URL}/career/${activeRoadmap._id}/exam`,
        { examId, status, score },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setActiveRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.error('Update exam error:', err);
    }
  };

  // Handle taking an exam
  const handleTakeExam = async (exam) => {
    if (!onStartExam) {
      setError('Exam feature not available. Please access from dashboard.');
      return;
    }

    try {
      setTakingExam(exam._id);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Map difficulty
      const difficultyMap = {
        'beginner': 'easy',
        'intermediate': 'medium',
        'advanced': 'hard'
      };
      
      const response = await axios.post(
        `${apiBase}/api/exam/generate`,
        {
          subject: exam.skill || exam.title,
          topics: [exam.skill || exam.title],
          difficulty: difficultyMap[exam.difficulty] || 'medium',
          totalQuestions: 10,
          mcqCount: 10,
          msqCount: 0,
          durationMinutes: 15,
          negativeMarking: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const generatedExam = response.data.exam;

      // Mark exam as started in roadmap
      await updateExamStatus(exam._id, 'in-progress');

      onStartExam({
        skill: generatedExam.examMeta?.subject || exam.skill,
        category: exam.title,
        difficulty: exam.difficulty,
        questions: generatedExam.questions,
        timeLimit: generatedExam.examMeta?.durationMinutes || 15,
        roadmapExamId: exam._id,
        roadmapId: activeRoadmap._id
      });
    } catch (err) {
      console.error('Failed to start exam:', err);
      setError(err.response?.data?.message || 'Failed to start exam. Please try again.');
    } finally {
      setTakingExam(null);
    }
  };

  // Generate custom roadmap
  const generateCustomRoadmap = async () => {
    if (!customCareerGoal.trim()) {
      setError('Please enter a career goal');
      return;
    }

    try {
      setGenerating(true);
      setError('');

      const res = await axios.post(
        `${API_URL}/career/generate`,
        {
          careerGoal: customCareerGoal.toLowerCase().replace(/\s+/g, '-'),
          customGoalName: customCareerGoal,
          currentLevel: selectedLevel
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setActiveRoadmap(res.data.roadmap);
        setUserRoadmaps([res.data.roadmap, ...userRoadmaps]);
        setCustomCareerGoal('');
        setShowCustomInput(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap. Try selecting from available paths.');
    } finally {
      setGenerating(false);
    }
  };

  // Join Zoom session
  const handleJoinSession = async (session) => {
    try {
      setJoiningSession(session._id);
      
      // Register for session if needed
      const res = await axios.post(
        `${API_URL}/career/${activeRoadmap._id}/session/register`,
        { sessionId: session._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && res.data.session?.zoomJoinUrl) {
        // Open Zoom meeting in new tab
        window.open(res.data.session.zoomJoinUrl, '_blank');
      } else if (session.zoomJoinUrl) {
        // Fallback to session's stored URL
        window.open(session.zoomJoinUrl, '_blank');
      } else {
        setError('Zoom meeting link not available');
      }
    } catch (err) {
      console.error('Join session error:', err);
      setError(err.response?.data?.message || 'Failed to join session');
    } finally {
      setJoiningSession(null);
    }
  };

  const getEstimatedTime = (path, level) => {
    const weeks = path.estimatedWeeks?.[level] || 20;
    if (weeks >= 52) return `${Math.round(weeks / 52)} year${weeks >= 104 ? 's' : ''}`;
    if (weeks >= 4) return `${Math.round(weeks / 4)} months`;
    return `${weeks} weeks`;
  };

  // Career Path Selection View
  const renderPathSelection = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 rounded-full mb-6 shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
          <span className="text-white font-semibold">AI Career Roadmap Generator</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Career Path
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select your dream career or enter a custom goal. We'll create a personalized learning roadmap with skills, exams, courses, and estimated time to job-readiness.
        </p>
      </div>

      {/* Custom Career Goal Input */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            Enter Your Dream Career
          </h3>
          <button
            onClick={() => {
              setShowCustomInput(!showCustomInput);
              setSelectedPath(null);
            }}
            className="text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors"
          >
            {showCustomInput ? 'Choose from list instead' : 'Enter custom career'}
          </button>
        </div>
        
        {showCustomInput && (
          <div className="space-y-4">
            <input
              type="text"
              value={customCareerGoal}
              onChange={(e) => setCustomCareerGoal(e.target.value)}
              placeholder="e.g., Full Stack Developer, Data Scientist, Cloud Architect, UX Designer..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all shadow-sm"
            />
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex gap-2">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                      selectedLevel === level
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              
              <button
                onClick={generateCustomRoadmap}
                disabled={!customCareerGoal.trim() || generating}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 shadow-md"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Map className="w-5 h-5" />
                    Generate Roadmap
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Career Paths Grid */}
      {!showCustomInput && (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {careerPaths.map((path) => {
          const IconComponent = careerIcons[path.id] || Target;
          const isSelected = selectedPath?.id === path.id;

          return (
            <div
              key={path.id}
              onClick={() => setSelectedPath(path)}
              className={`bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border ${
                isSelected
                  ? 'ring-2 ring-violet-500 border-violet-200 bg-violet-50'
                  : 'border-gray-100 hover:border-violet-200'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                isSelected ? 'bg-violet-600' : 'bg-violet-100'
              }`}>
                <IconComponent className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-violet-600'}`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{path.description}</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>{path.skillCount} Skills</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span>{path.milestoneCount} Milestones</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-4 h-4 text-green-500" />
                  <span>{path.examCount} Exams</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="w-4 h-4 text-violet-500" />
                  <span>{path.courseCount} Courses</span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-violet-200">
                  <div className="flex items-center gap-2 text-violet-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Selected</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Level Selection & Generate Button */}
      {selectedPath && !showCustomInput && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Selected: {selectedPath.title}
              </h3>
              <p className="text-gray-600">Choose your current experience level</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                      selectedLevel === level
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-violet-200">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-600" />
                <span className="text-gray-900 font-medium">
                  Estimated Time: {getEstimatedTime(selectedPath, selectedLevel)}
                </span>
              </div>
            </div>

            <button
              onClick={generateRoadmap}
              disabled={generating}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 shadow-md"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <Map className="w-5 h-5" />
                  Generate My Roadmap
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Existing Roadmaps */}
      {userRoadmaps.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Roadmaps</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {userRoadmaps.map((roadmap) => {
              const IconComponent = careerIcons[roadmap.careerGoal] || Target;
              return (
                <div
                  key={roadmap._id}
                  onClick={() => setActiveRoadmap(roadmap)}
                  className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-xl border border-gray-100 hover:border-violet-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{roadmap.targetRole}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="capitalize">{roadmap.currentLevel}</span>
                        <span>•</span>
                        <span>{roadmap.progress?.overall || 0}% Complete</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${roadmap.progress?.overall || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Active Roadmap View
  const renderRoadmapView = () => {
    if (!activeRoadmap) return null;

    const tabs = [
      { id: 'overview', label: 'Overview', icon: Map },
      { id: 'milestones', label: 'Milestones', icon: Target },
      { id: 'skills', label: 'Skills', icon: Zap },
      { id: 'exams', label: 'Exams', icon: Award },
      { id: 'courses', label: 'Courses', icon: BookOpen },
      { id: 'sessions', label: 'Live Sessions', icon: Video }
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveRoadmap(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Selection</span>
          </button>
        </div>

        {/* Roadmap Header */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{activeRoadmap.targetRole}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1 capitalize">
                  <GraduationCap className="w-4 h-4" />
                  {activeRoadmap.currentLevel}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {activeRoadmap.estimatedTimeDisplay}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Started {new Date(activeRoadmap.startedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-4xl font-bold text-violet-600 mb-1">
                {activeRoadmap.progress?.overall || 0}%
              </div>
              <div className="text-gray-500 text-sm">Overall Progress</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-3 rounded-full transition-all"
                style={{ width: `${activeRoadmap.progress?.overall || 0}%` }}
              />
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-violet-600">
                {activeRoadmap.progress?.milestonesCompleted || 0}/{activeRoadmap.milestones?.length || 0}
              </div>
              <div className="text-gray-500 text-sm">Milestones</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {activeRoadmap.progress?.examsCleared || 0}/{activeRoadmap.exams?.length || 0}
              </div>
              <div className="text-gray-500 text-sm">Exams Passed</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {activeRoadmap.progress?.coursesCompleted || 0}/{activeRoadmap.courses?.length || 0}
              </div>
              <div className="text-gray-500 text-sm">Courses Done</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">
                {activeRoadmap.requiredSkills?.length || 0}
              </div>
              <div className="text-gray-500 text-sm">Skills to Master</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-xl">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'milestones' && renderMilestones()}
          {activeTab === 'skills' && renderSkills()}
          {activeTab === 'exams' && renderExams()}
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'sessions' && renderSessions()}
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Next Steps */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          Next Steps
        </h3>
        <div className="space-y-3">
          {activeRoadmap.milestones?.filter(m => m.status !== 'completed').slice(0, 3).map((milestone, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                milestone.status === 'in-progress' ? 'bg-yellow-100' : 'bg-gray-200'
              }`}>
                {milestone.status === 'in-progress' ? (
                  <Play className="w-4 h-4 text-yellow-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div>
                <div className="text-gray-900 font-medium">{milestone.title}</div>
                <div className="text-gray-500 text-sm">{milestone.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          Upcoming Live Sessions
        </h3>
        <div className="space-y-3">
          {activeRoadmap.liveSessions?.slice(0, 3).map((session, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-xl">
              <div className="text-gray-900 font-medium">{session.title}</div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(session.scheduledDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {session.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Essential Courses */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm md:col-span-2">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-600" />
          Essential Courses to Start
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {activeRoadmap.courses?.filter(c => c.priority === 'essential' && !c.completed).slice(0, 3).map((course, idx) => (
            <a
              key={idx}
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 p-4 rounded-xl hover:bg-violet-50 hover:border-violet-200 border border-transparent transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="text-gray-900 font-medium group-hover:text-violet-600 transition-colors">
                  {course.title}
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-violet-600" />
              </div>
              <div className="text-gray-500 text-sm mt-1">{course.provider}</div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <Clock className="w-3 h-3" />
                {course.duration}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMilestones = () => (
    <div className="space-y-4">
      {activeRoadmap.milestones?.map((milestone, idx) => (
        <div
          key={milestone._id || idx}
          className={`bg-white rounded-2xl p-6 border-l-4 shadow-sm ${
            milestone.status === 'completed'
              ? 'border-green-500'
              : milestone.status === 'in-progress'
              ? 'border-yellow-500'
              : 'border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                milestone.status === 'completed'
                  ? 'bg-green-100'
                  : milestone.status === 'in-progress'
                  ? 'bg-yellow-100'
                  : 'bg-gray-100'
              }`}>
                {milestone.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : milestone.status === 'in-progress' ? (
                  <Play className="w-5 h-5 text-yellow-600" />
                ) : (
                  <span className="text-gray-500 font-bold">{milestone.order}</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{milestone.title}</h3>
                <p className="text-gray-500 mt-1">{milestone.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {milestone.skills?.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-1 bg-violet-100 text-violet-600 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">{milestone.duration}</span>
              {milestone.status !== 'completed' && (
                <select
                  value={milestone.status}
                  onChange={(e) => updateMilestoneStatus(milestone._id, e.target.value)}
                  className="bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="grid md:grid-cols-2 gap-4">
      {activeRoadmap.requiredSkills?.map((skill, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold">{skill.name}</h3>
                <span className="text-gray-400 text-sm">{skill.category}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              skill.proficiencyLevel === 'expert'
                ? 'bg-yellow-100 text-yellow-700'
                : skill.proficiencyLevel === 'advanced'
                ? 'bg-violet-100 text-violet-700'
                : skill.proficiencyLevel === 'intermediate'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {skill.proficiencyLevel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${skill.currentLevel}%` }}
              />
            </div>
            <span className="text-gray-500 text-sm">{skill.currentLevel}%</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderExams = () => (
    <div className="space-y-4">
      {activeRoadmap.exams?.map((exam, idx) => (
        <div
          key={exam._id || idx}
          className={`bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm ${
            exam.status === 'passed' ? 'border border-green-200' : 'border border-gray-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              exam.status === 'passed'
                ? 'bg-green-100'
                : exam.status === 'failed'
                ? 'bg-red-100'
                : 'bg-gray-100'
            }`}>
              {exam.status === 'passed' ? (
                <Trophy className="w-6 h-6 text-green-600" />
              ) : exam.status === 'failed' ? (
                <Lock className="w-6 h-6 text-red-500" />
              ) : (
                <Award className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold">{exam.title}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span>{exam.skill}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  exam.difficulty === 'advanced'
                    ? 'bg-red-100 text-red-600'
                    : exam.difficulty === 'intermediate'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {exam.difficulty}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {exam.status === 'passed' && (
              <span className="text-green-600 font-medium">
                {exam.estimatedScore || 85}%
              </span>
            )}
            {exam.status !== 'passed' && (
              <button
                onClick={() => handleTakeExam(exam)}
                disabled={takingExam === exam._id}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {takingExam === exam._id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Take Exam
                  </>
                )}
              </button>
            )}
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
              exam.status === 'passed'
                ? 'bg-green-100 text-green-600'
                : exam.status === 'failed'
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {exam.status === 'passed' ? 'Passed' : exam.status === 'failed' ? 'Failed' : 'Pending'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-4">
      {['essential', 'recommended', 'optional'].map((priority) => {
        const courses = activeRoadmap.courses?.filter(c => c.priority === priority) || [];
        if (courses.length === 0) return null;

        return (
          <div key={priority}>
            <h3 className={`text-lg font-bold mb-3 capitalize flex items-center gap-2 ${
              priority === 'essential'
                ? 'text-red-600'
                : priority === 'recommended'
                ? 'text-yellow-600'
                : 'text-gray-500'
            }`}>
              <Star className="w-5 h-5" />
              {priority} Courses
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {courses.map((course, idx) => (
                <div
                  key={course._id || idx}
                  className={`bg-white rounded-2xl p-5 shadow-sm ${
                    course.completed ? 'border border-green-200' : 'border border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-semibold">{course.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">{course.provider}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <Play className="w-3 h-3" />
                          {course.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCourseStatus(course._id, !course.completed)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          course.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600 hover:bg-violet-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-4">
      {activeRoadmap.liveSessions?.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No live sessions scheduled yet.</p>
        </div>
      )}
      {activeRoadmap.liveSessions?.map((session, idx) => {
        const sessionDate = new Date(session.scheduledDate);
        const isUpcoming = sessionDate > new Date();
        const isLive = Math.abs(sessionDate - new Date()) < 30 * 60 * 1000; // Within 30 mins

        return (
          <div key={session._id || idx} className={`bg-white rounded-2xl p-5 shadow-sm border ${
            isLive ? 'border-green-300' : 'border-gray-100'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isLive ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <Video className={`w-6 h-6 ${isLive ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-gray-900 font-semibold">{session.title}</h3>
                    {isLive && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full animate-pulse">
                        ● LIVE NOW
                      </span>
                    )}
                    {session.isMockMeeting && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {session.description || `Learn ${session.topic} from ${session.instructor}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {session.instructor}
                    </span>
                  </div>
                  
                  {/* Zoom Meeting Details */}
                  {session.zoomMeetingId && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 text-sm">
                        <img 
                          src="https://cdn-icons-png.flaticon.com/512/4401/4401470.png" 
                          alt="Zoom" 
                          className="w-4 h-4"
                        />
                        <span className="text-gray-500">Zoom Meeting</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Meeting ID:</span>
                          <span className="ml-2 text-gray-600 font-mono">{session.zoomMeetingId}</span>
                        </div>
                        {session.zoomPassword && (
                          <div>
                            <span className="text-gray-400">Password:</span>
                            <span className="ml-2 text-gray-600 font-mono">{session.zoomPassword}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleJoinSession(session)}
                  disabled={joiningSession === session._id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isLive
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-50`}
                >
                  {joiningSession === session._id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      {isLive ? 'Join Now' : 'Join Session'}
                    </>
                  )}
                </button>
                
                {session.zoomJoinUrl && (
                  <a
                    href={session.zoomJoinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in Zoom
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading career paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        {!activeRoadmap && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {activeRoadmap ? renderRoadmapView() : renderPathSelection()}
      </div>
    </div>
  );
};

export default CareerRoadmapPage;
