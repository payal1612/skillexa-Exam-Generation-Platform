import { useState } from 'react';
import { BookOpen, Plus, X, ChevronRight, Sparkles, Target, GraduationCap, CheckCircle, Search } from 'lucide-react';
import axios from 'axios';

// Popular skills suggestions
const SKILL_SUGGESTIONS = [
  // Programming Languages
  'JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  // Web Development
  'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap',
  // Data Science & AI
  'Machine Learning', 'Deep Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
  'Data Analysis', 'Pandas', 'NumPy', 'Scikit-learn', 'AI', 'Neural Networks',
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps', 'Linux', 'Git',
  // Database
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'SQL', 'NoSQL',
  // Mobile
  'React Native', 'Flutter', 'iOS Development', 'Android Development',
  // Others
  'GraphQL', 'REST API', 'Microservices', 'System Design', 'Data Structures', 'Algorithms',
  'Cybersecurity', 'Blockchain', 'Web3', 'UI/UX Design', 'Figma', 'Agile', 'Scrum'
];

export default function SkillsOnboarding({ user, onComplete, onSkip }) {
  const [step, setStep] = useState(1); // 1 = known skills, 2 = skills to learn
  const [knownSkills, setKnownSkills] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Get filtered suggestions based on current input
  const getFilteredSuggestions = () => {
    const currentList = step === 1 ? knownSkills : skillsToLearn;
    const otherList = step === 1 ? skillsToLearn : knownSkills;
    
    return SKILL_SUGGESTIONS.filter(skill => 
      skill.toLowerCase().includes(currentInput.toLowerCase()) &&
      !currentList.includes(skill) &&
      !otherList.includes(skill)
    ).slice(0, 8);
  };

  // Add a skill
  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (!trimmedSkill) return;
    
    if (step === 1) {
      if (!knownSkills.includes(trimmedSkill)) {
        setKnownSkills([...knownSkills, trimmedSkill]);
      }
    } else {
      if (!skillsToLearn.includes(trimmedSkill)) {
        setSkillsToLearn([...skillsToLearn, trimmedSkill]);
      }
    }
    setCurrentInput('');
  };

  // Remove a skill
  const removeSkill = (skill) => {
    if (step === 1) {
      setKnownSkills(knownSkills.filter(s => s !== skill));
    } else {
      setSkillsToLearn(skillsToLearn.filter(s => s !== skill));
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      e.preventDefault();
      addSkill(currentInput);
    }
  };

  // Go to next step
  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      setCurrentInput('');
    } else {
      handleSubmit();
    }
  };

  // Submit skill preferences
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${apiUrl}/api/auth/skill-preferences`,
        {
          knownSkills,
          skillsToLearn
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Update local storage with new user data
        const updatedUser = { ...user, knownSkills, skillsToLearn, hasCompletedOnboarding: true };
        localStorage.setItem('skillforge_user', JSON.stringify(updatedUser));
        onComplete(updatedUser);
      }
    } catch (error) {
      console.error('Failed to save skill preferences:', error);
      // Still complete onboarding even if save fails
      onComplete({ ...user, knownSkills, skillsToLearn, hasCompletedOnboarding: true });
    }
    setIsLoading(false);
  };

  const currentSkills = step === 1 ? knownSkills : skillsToLearn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-violet-600" />
            <span className="text-lg font-bold">Skillexa</span>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Skip for now
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 mb-2">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-violet-600' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-violet-600' : 'bg-gray-200'}`}></div>
        </div>
        <p className="text-sm text-gray-500 text-center">Step {step} of 2</p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Welcome Message - Only on step 1 */}
        {step === 1 && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Skillexa, {user?.name?.split(' ')[0]}! 🎉
            </h1>
            <p className="text-gray-600">
              Let's personalize your learning experience by understanding your skills
            </p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200">
          {/* Step Header */}
          <div className="flex items-center gap-3 mb-6">
            {step === 1 ? (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">What skills do you already know?</h2>
                  <p className="text-gray-500 text-sm">Add skills you're proficient in</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">What do you want to learn?</h2>
                  <p className="text-gray-500 text-sm">Add skills you'd like to master</p>
                </div>
              </>
            )}
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder={step === 1 ? "Type a skill you know..." : "Type a skill you want to learn..."}
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-lg"
              />
              {currentInput && (
                <button
                  onClick={() => addSkill(currentInput)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {searchFocused && (currentInput || getFilteredSuggestions().length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                {getFilteredSuggestions().map((skill, index) => (
                  <button
                    key={index}
                    onClick={() => addSkill(skill)}
                    className="w-full px-4 py-3 text-left hover:bg-violet-50 flex items-center justify-between group transition-colors"
                  >
                    <span className="text-gray-700">{skill}</span>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-violet-600" />
                  </button>
                ))}
                {currentInput && !SKILL_SUGGESTIONS.some(s => s.toLowerCase() === currentInput.toLowerCase()) && (
                  <button
                    onClick={() => addSkill(currentInput)}
                    className="w-full px-4 py-3 text-left hover:bg-violet-50 flex items-center justify-between border-t border-gray-100"
                  >
                    <span className="text-violet-600">Add "{currentInput}"</span>
                    <Plus className="w-4 h-4 text-violet-600" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Selected Skills */}
          {currentSkills.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">
                {step === 1 ? 'Your skills:' : 'Skills to learn:'} ({currentSkills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {currentSkills.map((skill, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      step === 1 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Popular Suggestions */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-3">Popular skills:</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.filter(skill => 
                !knownSkills.includes(skill) && !skillsToLearn.includes(skill)
              ).slice(0, 12).map((skill, index) => (
                <button
                  key={index}
                  onClick={() => addSkill(skill)}
                  className="px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Summary for step 2 */}
          {step === 2 && knownSkills.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">Skills you already know:</p>
              <div className="flex flex-wrap gap-2">
                {knownSkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isLoading}
              className={`flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : step === 1 ? (
                <>
                  Next: Skills to Learn
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Complete Setup
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-400 mt-4">
            {step === 1 
              ? "Don't worry, you can always update these later in your profile"
              : "We'll personalize exams and courses based on your preferences"
            }
          </p>
        </div>

        {/* Benefits Preview */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Personalized Exams</p>
            <p className="text-xs text-gray-500">Based on your skill level</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Curated Courses</p>
            <p className="text-xs text-gray-500">Tailored learning paths</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Smart Recommendations</p>
            <p className="text-xs text-gray-500">AI-powered suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
