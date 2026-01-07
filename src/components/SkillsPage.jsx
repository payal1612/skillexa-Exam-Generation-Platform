import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  TrendingUp,
  Play,
  Target,
  Award,
  ChevronRight,
  Zap,
  Brain,
  Eye,
  Download,
  Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SkillsPage({ onGenerateExam, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch skills from API
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/skills`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }

        const data = await response.json();
        
        // Handle both array and object response formats
        const skillsArray = Array.isArray(data) ? data : (data.skills || []);
        
        // Transform API data to match component expectations
        const transformedSkills = skillsArray.map(skill => ({
          id: skill._id,
          title: skill.name || skill.title,
          category: skill.category?.toLowerCase().replace(/\s+/g, '-') || 'machine-learning',
          difficulty: skill.difficulty || 'Intermediate',
          rating: skill.rating || 4.5,
          enrolled: skill.enrolledCount || skill.enrolled || 0,
          duration: skill.duration || '2-3 hours',
          description: skill.description || 'Master this skill through comprehensive learning.',
          topics: skill.topics || skill.subskills || ['Core Concepts', 'Practical Applications'],
          image: skill.image || getDefaultImage(skill.category),
          isEnrolled: skill.isEnrolled || false,
          progress: skill.progress || 0,
          popularity: skill.popularity || Math.floor(Math.random() * 30) + 70
        }));

        setSkills(transformedSkills);
        setError(null);
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError('Failed to load skills. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Default images based on category
  const getDefaultImage = (category) => {
    const images = {
      'machine-learning': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
      'ml': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
      'deep-learning': 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=400',
      'dl': 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=400',
      'nlp': 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=400',
      'natural-language-processing': 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=400',
      'computer-vision': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
      'cv': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
      'data-science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      'ai-ethics': 'https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=400'
    };
    return images[category?.toLowerCase().replace(/\s+/g, '-')] || 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  // Dynamic categories based on fetched skills
  const categories = useMemo(() => {
    const categoryMap = new Map();
    categoryMap.set('all', { id: 'all', name: 'All Categories', count: skills.length });
    
    const categoryNames = {
      'machine-learning': 'Machine Learning',
      'ml': 'Machine Learning',
      'deep-learning': 'Deep Learning',
      'dl': 'Deep Learning',
      'nlp': 'Natural Language Processing',
      'natural-language-processing': 'Natural Language Processing',
      'computer-vision': 'Computer Vision',
      'cv': 'Computer Vision',
      'data-science': 'Data Science',
      'ai-ethics': 'AI Ethics'
    };

    skills.forEach(skill => {
      const cat = skill.category?.toLowerCase().replace(/\s+/g, '-') || 'other';
      if (categoryMap.has(cat)) {
        categoryMap.get(cat).count++;
      } else {
        categoryMap.set(cat, {
          id: cat,
          name: categoryNames[cat] || cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          count: 1
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [skills]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Novice': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      case 'Master': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Search, filter, sorting
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || skill.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.popularity - a.popularity;
      case 'rating': return b.rating - a.rating;
      case 'enrolled': return b.enrolled - a.enrolled;
      case 'alphabetical': return a.title.localeCompare(b.title);
      default: return 0;
    }
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ========= HEADER WITH BACK BUTTON ========= */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors text-2xl"
            >
              ←
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Skills Library
            </h1>
          </div>

          <p className="text-gray-600 mt-1">
            Explore and master AI skills with personalized learning paths
          </p>

        </div>
      </div>

      {/* ========= MAIN PAGE CONTENT ========= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ---- Sidebar ---- */}
          <div className="lg:w-80 space-y-6">

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Search Skills</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-violet-50 text-violet-700 border border-violet-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-gray-500">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Difficulty Level</h3>
              <div className="space-y-2">
                {['all', 'Novice', 'Intermediate', 'Expert', 'Master'].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                      selectedDifficulty === difficulty
                        ? 'bg-violet-50 text-violet-700 border border-violet-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">
                      {difficulty === 'all' ? 'All Levels' : difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ---- Main Content ---- */}
          <div className="flex-1">

            {/* Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {sortedSkills.length} skill{sortedSkills.length !== 1 ? "s" : ""} found
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="enrolled">Most Enrolled</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedSkills.map((skill) => (
                <div key={skill.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">

                  {/* Image Section */}
                  <div className="h-48 relative">
                    <img 
                      src={skill.image} 
                      alt={skill.title}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(skill.difficulty)}`}>
                        {skill.difficulty}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{skill.duration}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">

                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{skill.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{skill.rating}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                      {skill.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {skill.topics.slice(0, 3).map((topic, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {topic}
                        </span>
                      ))}
                      {skill.topics.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{skill.topics.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{skill.enrolled.toLocaleString()} enrolled</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{skill.popularity}% popularity</span>
                      </div>
                    </div>

                    {skill.isEnrolled && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900 font-medium">{skill.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-violet-600 rounded-full"
                            style={{ width: `${skill.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button 
                        onClick={() => onGenerateExam(skill)}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Generate Exam
                      </button>

                      <button className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {sortedSkills.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No skills found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
