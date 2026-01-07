import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  Trophy,
  Clock,
  Users,
  Target,
  Zap,
  Calendar,
  Filter,
  Search,
  ChevronRight,
  Star,
  Award,
  Play,
  Timer,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Code,
  Brain,
  Rocket,
  Flag,
  Medal,
  BookOpen,
  TrendingUp,
  Eye,
  UserPlus,
  X,
  ListChecks,
  Lightbulb,
  Gift
} from 'lucide-react';
import ChallengeInterface from './ChallengeInterface';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChallengesPage({ onBack }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null); // For challenge interface
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    eventType: 'all',
    difficulty: 'all',
    status: 'all',
    participantLevel: 'all',
    search: ''
  });

  // Create challenge form
  const [createForm, setCreateForm] = useState({
    eventType: 'weekly-challenge',
    skill: 'JavaScript',
    difficulty: 'intermediate',
    duration: '2 hours',
    participantLevel: 'all'
  });
  const [generatedChallenge, setGeneratedChallenge] = useState(null);
  const [generating, setGenerating] = useState(false);

  const eventTypes = [
    { id: 'all', label: 'All Events', icon: Trophy, color: 'bg-gray-500' },
    { id: 'weekly-challenge', label: 'Weekly Challenge', icon: Calendar, color: 'bg-blue-500' },
    { id: 'live-quiz', label: 'Live Quiz', icon: Zap, color: 'bg-yellow-500' },
    { id: 'skill-sprint', label: 'Skill Sprint', icon: Rocket, color: 'bg-purple-500' },
    { id: 'hackathon', label: 'Hackathon', icon: Code, color: 'bg-red-500' }
  ];

  const difficulties = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-700' },
    { id: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-700' }
  ];

  const skills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java',
    'Data Science', 'Machine Learning', 'SQL', 'AWS', 'Docker', 'Go'
  ];

  const durations = [
    '30 minutes', '1 hour', '2 hours', '3 hours', '4 hours', '24 hours', '48 hours', '7 days'
  ];

  useEffect(() => {
    seedAndFetchChallenges();
    fetchStats();
  }, []);

  useEffect(() => {
    if (challenges.length > 0) {
      // Re-fetch when filters change (but not on initial load)
      fetchChallenges();
    }
  }, [filters]);

  const seedAndFetchChallenges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // First, try to seed challenges if none exist
      try {
        await axios.post(`${API_BASE}/api/challenges/seed`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (seedError) {
        // Ignore seed errors - challenges may already exist
        console.log('Seed skipped or already done');
      }

      // Then fetch challenges
      await fetchChallenges();
    } catch (error) {
      console.error('Failed to initialize challenges:', error);
      setChallenges(getSampleChallenges());
    } finally {
      setLoading(false);
    }
  };

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.eventType !== 'all') params.append('eventType', filters.eventType);
      if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.participantLevel !== 'all') params.append('participantLevel', filters.participantLevel);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_BASE}/api/challenges?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setChallenges(response.data.challenges);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      // Only use sample data if fetch fails
      if (challenges.length === 0) {
        setChallenges(getSampleChallenges());
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/challenges/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        totalChallenges: 12,
        activeChallenges: 4,
        upcomingChallenges: 5,
        completedChallenges: 3,
        userParticipated: 2,
        userCompleted: 1
      });
    }
  };

  const handleRegister = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/api/challenges/${challengeId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchChallenges();
        // Find the challenge and open the interface
        const challenge = challenges.find(c => c._id === challengeId);
        if (challenge) {
          setSelectedChallenge(null);
          setActiveChallenge(challenge);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to register');
    }
  };

  // Handle starting a challenge user is already registered for
  const handleStartChallenge = (challenge) => {
    setSelectedChallenge(null);
    setActiveChallenge(challenge);
  };

  // Handle challenge completion
  const handleChallengeComplete = (results) => {
    setActiveChallenge(null);
    fetchChallenges();
    fetchStats();
  };

  const generateChallenge = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/api/challenges/generate`,
        createForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setGeneratedChallenge(response.data.challenge);
      }
    } catch (error) {
      console.error('Failed to generate:', error);
      // Generate locally for demo
      setGeneratedChallenge(generateLocalChallenge(createForm));
    } finally {
      setGenerating(false);
    }
  };

  const saveChallenge = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/api/challenges`,
        generatedChallenge,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowCreateModal(false);
        setGeneratedChallenge(null);
        fetchChallenges();
        alert('Challenge created successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create challenge');
    }
  };

  const getEventTypeConfig = (type) => {
    return eventTypes.find(e => e.id === type) || eventTypes[0];
  };

  const getDifficultyConfig = (diff) => {
    return difficulties.find(d => d.id === diff) || difficulties[0];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Live Now', color: 'bg-green-500 text-white', icon: Play };
      case 'upcoming':
        return { label: 'Upcoming', color: 'bg-blue-500 text-white', icon: Clock };
      case 'completed':
        return { label: 'Completed', color: 'bg-gray-500 text-white', icon: CheckCircle };
      default:
        return { label: status, color: 'bg-gray-200 text-gray-700', icon: AlertCircle };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  // Generate local challenge for demo
  const generateLocalChallenge = (form) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    
    const endDate = new Date(startDate);
    if (form.eventType === 'hackathon') {
      endDate.setDate(endDate.getDate() + 2);
    } else if (form.eventType === 'weekly-challenge') {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      endDate.setHours(endDate.getHours() + 2);
    }

    return {
      title: `${form.skill} ${form.eventType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
      description: `Test your ${form.skill} skills in this exciting ${form.eventType.replace('-', ' ')}!`,
      eventType: form.eventType,
      skill: form.skill,
      difficulty: form.difficulty,
      duration: form.duration,
      participantLevel: form.participantLevel,
      startDate,
      endDate,
      status: 'upcoming',
      tasks: [
        { title: 'Task 1', description: 'Complete the first challenge', points: 25, type: 'coding' },
        { title: 'Task 2', description: 'Implement the solution', points: 35, type: 'coding' },
        { title: 'Task 3', description: 'Optimize your code', points: 25, type: 'coding' },
        { title: 'Task 4', description: 'Document your approach', points: 15, type: 'project' }
      ],
      rules: [
        'Complete within the time limit',
        'Original work only',
        'Follow coding standards',
        'Submit before deadline'
      ],
      scoringCriteria: [
        { criterion: 'Correctness', weight: 40, description: 'Solution works correctly' },
        { criterion: 'Quality', weight: 30, description: 'Code quality' },
        { criterion: 'Efficiency', weight: 20, description: 'Performance' },
        { criterion: 'Documentation', weight: 10, description: 'Clear docs' }
      ],
      learningOutcomes: [
        `Master ${form.skill} concepts`,
        'Improve problem-solving skills',
        'Build portfolio projects',
        'Earn badges and XP'
      ],
      prizes: [
        { rank: 1, prize: '🥇 Gold Badge + 500 XP', description: 'Top performer' },
        { rank: 2, prize: '🥈 Silver Badge + 300 XP', description: 'Runner up' },
        { rank: 3, prize: '🥉 Bronze Badge + 200 XP', description: 'Third place' }
      ],
      tags: [form.skill, form.eventType, form.difficulty],
      maxParticipants: 100,
      participants: []
    };
  };

  // Sample challenges for demo
  const getSampleChallenges = () => [
    {
      _id: '1',
      title: 'JavaScript Weekly Challenge - Array Mastery',
      description: 'Master JavaScript arrays with practical coding challenges. Implement custom array methods and solve complex problems.',
      eventType: 'weekly-challenge',
      skill: 'JavaScript',
      difficulty: 'intermediate',
      duration: '7 days',
      participantLevel: 'all',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'active',
      participants: Array(45).fill({}),
      maxParticipants: 100,
      tags: ['JavaScript', 'Arrays', 'Coding'],
      prizes: [
        { rank: 1, prize: '🥇 500 XP + Gold Badge' },
        { rank: 2, prize: '🥈 300 XP + Silver Badge' },
        { rank: 3, prize: '🥉 200 XP + Bronze Badge' }
      ]
    },
    {
      _id: '2',
      title: 'Live Python Quiz - Data Structures',
      description: 'Test your Python data structures knowledge in this fast-paced live quiz. 30 questions in 30 minutes!',
      eventType: 'live-quiz',
      skill: 'Python',
      difficulty: 'beginner',
      duration: '30 minutes',
      participantLevel: 'students',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      status: 'upcoming',
      participants: Array(28).fill({}),
      maxParticipants: 200,
      tags: ['Python', 'Quiz', 'Data Structures'],
      prizes: [
        { rank: 1, prize: '🏆 Quiz Champion + 300 XP' },
        { rank: 2, prize: '⚡ Speed Demon + 200 XP' }
      ]
    },
    {
      _id: '3',
      title: 'React Skill Sprint - Build a Todo App',
      description: 'A 2-hour sprint to build a fully functional Todo app with React. Perfect for practicing rapid development!',
      eventType: 'skill-sprint',
      skill: 'React',
      difficulty: 'intermediate',
      duration: '2 hours',
      participantLevel: 'all',
      startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: 'upcoming',
      participants: Array(32).fill({}),
      maxParticipants: 50,
      tags: ['React', 'Sprint', 'Frontend'],
      prizes: [
        { rank: 1, prize: '🚀 Sprint Master + 400 XP' },
        { rank: 2, prize: '💡 Innovation Award + 250 XP' }
      ]
    },
    {
      _id: '4',
      title: 'Full Stack Hackathon 2024',
      description: 'Build an innovative full-stack application in 48 hours. Teams of up to 4 members. Amazing prizes await!',
      eventType: 'hackathon',
      skill: 'Full Stack',
      difficulty: 'advanced',
      duration: '48 hours',
      participantLevel: 'professionals',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      participants: Array(67).fill({}),
      maxParticipants: 200,
      tags: ['Hackathon', 'Full Stack', 'Team'],
      prizes: [
        { rank: 1, prize: '🏆 $500 + Grand Winner Badge' },
        { rank: 2, prize: '🥈 $300 + Runner-up Badge' },
        { rank: 3, prize: '🥉 $200 + Third Place Badge' }
      ]
    },
    {
      _id: '5',
      title: 'Node.js Weekly Challenge - API Design',
      description: 'Design and build RESTful APIs with Node.js and Express. Focus on best practices and scalability.',
      eventType: 'weekly-challenge',
      skill: 'Node.js',
      difficulty: 'intermediate',
      duration: '7 days',
      participantLevel: 'all',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'completed',
      participants: Array(89).fill({}),
      maxParticipants: 100,
      tags: ['Node.js', 'API', 'Backend'],
      prizes: [
        { rank: 1, prize: '🥇 500 XP + Gold Badge' }
      ]
    },
    {
      _id: '6',
      title: 'SQL Live Quiz - Query Mastery',
      description: 'Prove your SQL skills in this live quiz covering JOINs, subqueries, and optimization.',
      eventType: 'live-quiz',
      skill: 'SQL',
      difficulty: 'intermediate',
      duration: '45 minutes',
      participantLevel: 'all',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      status: 'upcoming',
      participants: Array(15).fill({}),
      maxParticipants: 150,
      tags: ['SQL', 'Database', 'Quiz'],
      prizes: [
        { rank: 1, prize: '🏆 SQL Master + 350 XP' }
      ]
    }
  ];

  // Filter challenges by tab
  const filteredChallenges = challenges.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return c.status === 'active';
    if (activeTab === 'upcoming') return c.status === 'upcoming';
    if (activeTab === 'completed') return c.status === 'completed';
    if (activeTab === 'my') return c.participants?.some(p => p.userId === 'current-user');
    return true;
  });

  // If there's an active challenge, show the challenge interface
  if (activeChallenge) {
    return (
      <ChallengeInterface
        challenge={activeChallenge}
        onBack={() => setActiveChallenge(null)}
        onComplete={handleChallengeComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  Challenges & Hackathons
                </h1>
                <p className="text-gray-600 mt-1">Compete, learn, and win amazing prizes</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create Challenge</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalChallenges}</p>
                  <p className="text-xs text-gray-500">Total Challenges</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.activeChallenges}</p>
                  <p className="text-xs text-gray-500">Active Now</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.upcomingChallenges}</p>
                  <p className="text-xs text-gray-500">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{stats.completedChallenges}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Flag className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.userParticipated}</p>
                  <p className="text-xs text-gray-500">Participated</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Medal className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{stats.userCompleted}</p>
                  <p className="text-xs text-gray-500">Finished</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {eventTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setFilters(f => ({ ...f, eventType: type.id }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  filters.eventType === type.id
                    ? `${type.color} text-white shadow-md`
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters Row */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(f => ({ ...f, difficulty: e.target.value }))}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {difficulties.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filters.participantLevel}
              onChange={(e) => setFilters(f => ({ ...f, participantLevel: e.target.value }))}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Levels</option>
              <option value="students">Students</option>
              <option value="professionals">Professionals</option>
            </select>
          </div>
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or create a new challenge</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Create Challenge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map(challenge => {
              const eventConfig = getEventTypeConfig(challenge.eventType);
              const diffConfig = getDifficultyConfig(challenge.difficulty);
              const statusBadge = getStatusBadge(challenge.status);
              const StatusIcon = statusBadge.icon;
              const EventIcon = eventConfig.icon;

              return (
                <div
                  key={challenge._id}
                  onClick={() => setSelectedChallenge(challenge)}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                >
                  {/* Header Banner */}
                  <div className={`${eventConfig.color} p-4 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <EventIcon className="w-5 h-5 text-white" />
                          <span className="text-white/90 text-sm font-medium">
                            {eventConfig.label}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                      <h3 className="text-white font-bold text-lg line-clamp-2">
                        {challenge.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {challenge.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${diffConfig.color || 'bg-gray-100 text-gray-600'}`}>
                        {challenge.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {challenge.skill}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {challenge.duration}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants?.length || 0}/{challenge.maxParticipants}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        <span>
                          {challenge.status === 'active'
                            ? getTimeRemaining(challenge.endDate)
                            : challenge.status === 'upcoming'
                            ? `Starts ${formatDate(challenge.startDate)}`
                            : 'Ended'}
                        </span>
                      </div>
                    </div>

                    {/* Prizes Preview */}
                    {challenge.prizes && challenge.prizes.length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                        <Gift className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs text-yellow-700 font-medium">
                          {challenge.prizes[0].prize}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 pb-4">
                    <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`${getEventTypeConfig(selectedChallenge.eventType).color} p-6 relative`}>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const Icon = getEventTypeConfig(selectedChallenge.eventType).icon;
                  return <Icon className="w-6 h-6 text-white" />;
                })()}
                <span className="text-white/90 font-medium">
                  {getEventTypeConfig(selectedChallenge.eventType).label}
                </span>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedChallenge.status).color}`}>
                  {getStatusBadge(selectedChallenge.status).label}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{selectedChallenge.title}</h2>
              <p className="text-white/80 mt-2">{selectedChallenge.description}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Target className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-sm font-medium text-gray-900">{selectedChallenge.skill}</p>
                  <p className="text-xs text-gray-500">Skill</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 mx-auto text-green-600 mb-1" />
                  <p className="text-sm font-medium text-gray-900 capitalize">{selectedChallenge.difficulty}</p>
                  <p className="text-xs text-gray-500">Difficulty</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                  <p className="text-sm font-medium text-gray-900">{selectedChallenge.duration}</p>
                  <p className="text-xs text-gray-500">Duration</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                  <p className="text-sm font-medium text-gray-900">
                    {selectedChallenge.participants?.length || 0}/{selectedChallenge.maxParticipants}
                  </p>
                  <p className="text-xs text-gray-500">Participants</p>
                </div>
              </div>

              {/* Tasks */}
              {selectedChallenge.tasks && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-purple-600" />
                    Tasks / Questions
                  </h3>
                  <div className="space-y-2">
                    {(selectedChallenge.tasks || generateLocalChallenge(createForm).tasks).map((task, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        <span className="text-sm font-medium text-purple-600">{task.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules & Scoring */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Rules
                  </h3>
                  <ul className="space-y-2">
                    {(selectedChallenge.rules || generateLocalChallenge(createForm).rules).map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Scoring Criteria
                  </h3>
                  <div className="space-y-2">
                    {(selectedChallenge.scoringCriteria || generateLocalChallenge(createForm).scoringCriteria).map((sc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{sc.criterion}</span>
                        <span className="text-sm font-semibold text-purple-600">{sc.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Learning Outcomes
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(selectedChallenge.learningOutcomes || generateLocalChallenge(createForm).learningOutcomes).map((outcome, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prizes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-red-500" />
                  Prizes
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(selectedChallenge.prizes || generateLocalChallenge(createForm).prizes).map((prize, idx) => (
                    <div key={idx} className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <p className="text-2xl mb-1">
                        {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : '🥉'}
                      </p>
                      <p className="text-sm font-medium text-gray-900">{prize.prize}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedChallenge.status !== 'completed' && (
                  <>
                    {/* Check if user is already registered */}
                    {selectedChallenge.isRegistered || selectedChallenge.participants?.some(p => {
                      const currentUser = JSON.parse(localStorage.getItem('skillforge_user') || '{}');
                      return p.userId === currentUser?._id;
                    }) ? (
                      <button
                        onClick={() => handleStartChallenge(selectedChallenge)}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Start Challenge
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(selectedChallenge._id)}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-5 h-5" />
                        Register Now
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-purple-600" />
                  Create New Challenge
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setGeneratedChallenge(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {!generatedChallenge ? (
                <>
                  {/* Event Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {eventTypes.filter(t => t.id !== 'all').map(type => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setCreateForm(f => ({ ...f, eventType: type.id }))}
                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                              createForm.eventType === type.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${type.color}`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium text-gray-900">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skill */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill / Topic
                    </label>
                    <select
                      value={createForm.skill}
                      onChange={(e) => setCreateForm(f => ({ ...f, skill: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    >
                      {skills.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={createForm.difficulty}
                        onChange={(e) => setCreateForm(f => ({ ...f, difficulty: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <select
                        value={createForm.duration}
                        onChange={(e) => setCreateForm(f => ({ ...f, duration: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      >
                        {durations.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Participant Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participants Level
                    </label>
                    <div className="flex gap-3">
                      {['students', 'professionals', 'all'].map(level => (
                        <button
                          key={level}
                          onClick={() => setCreateForm(f => ({ ...f, participantLevel: level }))}
                          className={`flex-1 p-3 rounded-xl border-2 font-medium capitalize transition-all ${
                            createForm.participantLevel === level
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {level === 'all' ? 'All Levels' : level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateChallenge}
                    disabled={generating}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Generate Challenge
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Preview Generated Challenge */}
                  <div className="space-y-4">
                    <div className={`${getEventTypeConfig(generatedChallenge.eventType).color} p-4 rounded-xl text-white`}>
                      <h3 className="font-bold text-lg">{generatedChallenge.title}</h3>
                      <p className="text-white/80 mt-1">{generatedChallenge.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tasks</h4>
                      <div className="space-y-2">
                        {generatedChallenge.tasks?.map((task, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg flex justify-between">
                            <span className="text-sm text-gray-700">{task.title}: {task.description}</span>
                            <span className="text-sm font-medium text-purple-600">{task.points} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Learning Outcomes</h4>
                      <ul className="space-y-1">
                        {generatedChallenge.learningOutcomes?.map((outcome, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setGeneratedChallenge(null)}
                      className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={saveChallenge}
                      className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Create Challenge
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
