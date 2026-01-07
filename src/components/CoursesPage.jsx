import { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star, 
  ExternalLink, 
  Search, 
  Filter,
  ArrowLeft,
  TrendingUp,
  Award,
  Code,
  Database,
  Brain,
  Globe,
  Shield,
  Smartphone,
  Palette,
  BarChart3,
  Cpu
} from 'lucide-react';

export default function CoursesPage({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'programming', name: 'Programming', icon: Code },
    { id: 'web-dev', name: 'Web Development', icon: Globe },
    { id: 'data-science', name: 'Data Science', icon: Database },
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: Brain },
    { id: 'mobile', name: 'Mobile Development', icon: Smartphone },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: Shield },
    { id: 'design', name: 'UI/UX Design', icon: Palette },
    { id: 'cloud', name: 'Cloud Computing', icon: Cpu }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const courses = [
    {
      id: 1,
      title: 'Python for Beginners - Full Course',
      instructor: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
      duration: '4h 26m',
      students: '12M+',
      rating: 4.9,
      level: 'beginner',
      category: 'programming',
      description: 'Learn Python programming from scratch. Perfect for absolute beginners.',
      tags: ['Python', 'Programming', 'Basics']
    },
    {
      id: 2,
      title: 'JavaScript Full Course for Beginners',
      instructor: 'Bro Code',
      thumbnail: 'https://img.youtube.com/vi/lfmg-EJ8gm4/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=lfmg-EJ8gm4',
      duration: '8h 0m',
      students: '5M+',
      rating: 4.8,
      level: 'beginner',
      category: 'programming',
      description: 'Complete JavaScript tutorial covering all fundamental concepts.',
      tags: ['JavaScript', 'Web', 'Frontend']
    },
    {
      id: 3,
      title: 'React JS Full Course 2024',
      instructor: 'Traversy Media',
      thumbnail: 'https://img.youtube.com/vi/LDB4uaJ87e0/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=LDB4uaJ87e0',
      duration: '3h 0m',
      students: '2M+',
      rating: 4.9,
      level: 'intermediate',
      category: 'web-dev',
      description: 'Learn React from the ground up with projects and best practices.',
      tags: ['React', 'JavaScript', 'Frontend']
    },
    {
      id: 4,
      title: 'Node.js Full Course for Beginners',
      instructor: 'Dave Gray',
      thumbnail: 'https://img.youtube.com/vi/f2EqECiTBL8/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=f2EqECiTBL8',
      duration: '7h 0m',
      students: '1.5M+',
      rating: 4.8,
      level: 'intermediate',
      category: 'web-dev',
      description: 'Complete Node.js tutorial with Express, MongoDB, and REST APIs.',
      tags: ['Node.js', 'Backend', 'JavaScript']
    },
    {
      id: 5,
      title: 'Machine Learning Full Course',
      instructor: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/NWONeJKn6kc/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
      duration: '9h 52m',
      students: '3M+',
      rating: 4.9,
      level: 'intermediate',
      category: 'ai-ml',
      description: 'Learn machine learning fundamentals with Python, TensorFlow & scikit-learn.',
      tags: ['Machine Learning', 'Python', 'AI']
    },
    {
      id: 6,
      title: 'Deep Learning Specialization',
      instructor: 'Andrew Ng',
      thumbnail: 'https://img.youtube.com/vi/CS4cs9xVecg/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=CS4cs9xVecg',
      duration: '5h 30m',
      students: '4M+',
      rating: 4.9,
      level: 'advanced',
      category: 'ai-ml',
      description: 'Deep learning specialization covering neural networks, CNN, RNN, and more.',
      tags: ['Deep Learning', 'Neural Networks', 'AI']
    },
    {
      id: 7,
      title: 'Data Science Full Course',
      instructor: 'Simplilearn',
      thumbnail: 'https://img.youtube.com/vi/ua-CiDNNj30/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
      duration: '12h 0m',
      students: '2.5M+',
      rating: 4.7,
      level: 'beginner',
      category: 'data-science',
      description: 'Complete data science course covering Python, statistics, and visualization.',
      tags: ['Data Science', 'Python', 'Analytics']
    },
    {
      id: 8,
      title: 'SQL Full Course',
      instructor: 'Programming with Mosh',
      thumbnail: 'https://img.youtube.com/vi/7S_tz1z_5bA/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
      duration: '3h 10m',
      students: '8M+',
      rating: 4.9,
      level: 'beginner',
      category: 'data-science',
      description: 'Learn SQL from scratch. Master database queries and management.',
      tags: ['SQL', 'Database', 'Backend']
    },
    {
      id: 9,
      title: 'Flutter Mobile Development Course',
      instructor: 'Academind',
      thumbnail: 'https://img.youtube.com/vi/VPvVD8t02U8/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=VPvVD8t02U8',
      duration: '42h 0m',
      students: '1M+',
      rating: 4.8,
      level: 'intermediate',
      category: 'mobile',
      description: 'Build iOS and Android apps with Flutter and Dart.',
      tags: ['Flutter', 'Dart', 'Mobile']
    },
    {
      id: 10,
      title: 'React Native Full Course',
      instructor: 'JavaScript Mastery',
      thumbnail: 'https://img.youtube.com/vi/mJ3bGvy0WAY/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=mJ3bGvy0WAY',
      duration: '5h 0m',
      students: '800K+',
      rating: 4.8,
      level: 'intermediate',
      category: 'mobile',
      description: 'Build mobile apps with React Native and JavaScript.',
      tags: ['React Native', 'JavaScript', 'Mobile']
    },
    {
      id: 11,
      title: 'Ethical Hacking Full Course',
      instructor: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/3Kq1MIfTWCE/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE',
      duration: '15h 30m',
      students: '6M+',
      rating: 4.9,
      level: 'intermediate',
      category: 'cybersecurity',
      description: 'Learn penetration testing and ethical hacking from scratch.',
      tags: ['Cybersecurity', 'Hacking', 'Security']
    },
    {
      id: 12,
      title: 'AWS Cloud Practitioner Full Course',
      instructor: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/SOTamWNgDKc/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=SOTamWNgDKc',
      duration: '13h 0m',
      students: '3M+',
      rating: 4.8,
      level: 'beginner',
      category: 'cloud',
      description: 'Prepare for AWS Cloud Practitioner certification.',
      tags: ['AWS', 'Cloud', 'DevOps']
    },
    {
      id: 13,
      title: 'UI/UX Design Full Course',
      instructor: 'DesignCourse',
      thumbnail: 'https://img.youtube.com/vi/c9Wg6Cb_YlU/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
      duration: '2h 30m',
      students: '1.2M+',
      rating: 4.7,
      level: 'beginner',
      category: 'design',
      description: 'Learn UI/UX design principles and Figma from scratch.',
      tags: ['UI/UX', 'Design', 'Figma']
    },
    {
      id: 14,
      title: 'Docker Full Course',
      instructor: 'TechWorld with Nana',
      thumbnail: 'https://img.youtube.com/vi/3c-iBn73dDE/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
      duration: '3h 20m',
      students: '2M+',
      rating: 4.9,
      level: 'intermediate',
      category: 'cloud',
      description: 'Learn Docker containers, images, and Docker Compose.',
      tags: ['Docker', 'DevOps', 'Containers']
    },
    {
      id: 15,
      title: 'Git and GitHub Crash Course',
      instructor: 'Traversy Media',
      thumbnail: 'https://img.youtube.com/vi/RGOj5yH7evk/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
      duration: '1h 10m',
      students: '4M+',
      rating: 4.9,
      level: 'beginner',
      category: 'programming',
      description: 'Learn Git version control and GitHub collaboration.',
      tags: ['Git', 'GitHub', 'Version Control']
    },
    {
      id: 16,
      title: 'TypeScript Full Course',
      instructor: 'Net Ninja',
      thumbnail: 'https://img.youtube.com/vi/2pZmKW9-I_k/maxresdefault.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=2pZmKW9-I_k',
      duration: '3h 45m',
      students: '1.5M+',
      rating: 4.8,
      level: 'intermediate',
      category: 'programming',
      description: 'Master TypeScript for scalable JavaScript applications.',
      tags: ['TypeScript', 'JavaScript', 'Web']
    }
  ];

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCourseClick = (youtubeUrl) => {
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  Learning Courses
                </h1>
                <p className="text-gray-600 mt-1">Free high-quality video courses from YouTube</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>{courses.length} Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>Top Rated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
            >
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredCourses.length}</span> courses
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Sorted by popularity</span>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.youtubeUrl)}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/480x270/3b82f6/ffffff?text=${encodeURIComponent(course.title.substring(0, 20))}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
                    {course.duration}
                  </div>
                  
                  {/* Level Badge */}
                  <div className={`absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full ${getLevelColor(course.level)}`}>
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{course.instructor}</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4" fill="currentColor" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-500">
                      <ExternalLink className="w-4 h-4" />
                      <span>YouTube</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Channels Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured YouTube Channels</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'freeCodeCamp', url: 'https://www.youtube.com/@freecodecamp', color: 'from-green-500 to-green-600' },
              { name: 'Traversy Media', url: 'https://www.youtube.com/@TraversyMedia', color: 'from-blue-500 to-blue-600' },
              { name: 'The Net Ninja', url: 'https://www.youtube.com/@NetNinja', color: 'from-purple-500 to-purple-600' },
              { name: 'Fireship', url: 'https://www.youtube.com/@Fireship', color: 'from-orange-500 to-orange-600' },
              { name: 'Web Dev Simplified', url: 'https://www.youtube.com/@WebDevSimplified', color: 'from-red-500 to-red-600' },
              { name: 'Academind', url: 'https://www.youtube.com/@academind', color: 'from-indigo-500 to-indigo-600' }
            ].map((channel, idx) => (
              <a
                key={idx}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gradient-to-r ${channel.color} text-white p-4 rounded-xl text-center font-medium hover:shadow-lg transition-all hover:scale-105`}
              >
                {channel.name}
              </a>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">📚 Learning Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-semibold mb-2">📝 Take Notes</h3>
              <p className="text-sm text-white/80">Write down key concepts while watching. Active learning improves retention.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-semibold mb-2">💻 Code Along</h3>
              <p className="text-sm text-white/80">Practice coding alongside the instructor. Hands-on experience is essential.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-semibold mb-2">🎯 Test Yourself</h3>
              <p className="text-sm text-white/80">After each course, take an exam on SkillExa to test your knowledge!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
