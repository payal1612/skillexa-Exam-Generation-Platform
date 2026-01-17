import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, 
  Brain, 
  Clock, 
  Target, 
  Zap, 
  BookOpen,
  Settings,
  Info,
  Sparkles,
  Star,
  Plus,
  X
} from 'lucide-react';
import './ExamGenerator.css';

export default function ExamGenerator({ onBack, onStartExam }) {
  const [skillInput, setSkillInput] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('Expert');
  const [numQuestions, setNumQuestions] = useState(15);
  const [timeLimit, setTimeLimit] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userSkillsToLearn, setUserSkillsToLearn] = useState([]);
  const [userKnownSkills, setUserKnownSkills] = useState([]);

  // Load user's skill preferences from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('skillforge_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUserSkillsToLearn(userData.skillsToLearn || []);
        setUserKnownSkills(userData.knownSkills || []);
      }
    } catch (error) {
      console.error('Error loading user skills:', error);
    }
  }, []);

  const difficultyLevels = [
    { id: 'Novice', label: 'Novice', color: 'bg-green-100 text-green-800', description: 'Basic concepts and fundamentals' },
    { id: 'Intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800', description: 'Applied knowledge and practical skills' },
    { id: 'Expert', label: 'Expert', color: 'bg-red-100 text-red-800', description: 'Advanced concepts and complex scenarios' },
    { id: 'Master', label: 'Master', color: 'bg-purple-100 text-purple-800', description: 'Cutting-edge research and innovation' }
  ];

  const handleSkillSelect = (skill) => {
    setSkillInput(skill);
  };

  const handleClearSkill = () => {
    setSkillInput('');
  };

  const handleGenerateExam = async () => {
    if (!skillInput.trim()) {
      alert('Please enter a skill to generate exam');
      return;
    }

    setIsGenerating(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to generate exams');
        setIsGenerating(false);
        return;
      }
      
      const mcqCount = numQuestions;
      const msqCount = 0;
      // Map UI difficulty to backend accepted values
      const difficultyMap = {
        'novice': 'easy',
        'intermediate': 'medium', 
        'expert': 'hard',
        'master': 'hard'
      };
      const difficulty = difficultyMap[difficultyLevel.toLowerCase()] || 'medium';
      
      const subjectName = skillInput.trim();
      const topics = [skillInput.trim()];

      const response = await axios.post(
        `${apiBase}/api/exam/generate`,
        {
          subject: subjectName,
          topics: topics,
          difficulty,
          totalQuestions: numQuestions,
          mcqCount,
          msqCount,
          durationMinutes: timeLimit,
          negativeMarking: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const generatedExam = response.data.exam;

      onStartExam({
        skill: generatedExam.examMeta?.subject || subjectName,
        category: skillInput.trim(),
        difficulty: generatedExam.examMeta?.difficulty || difficultyLevel,
        questions: generatedExam.questions,
        timeLimit: generatedExam.examMeta?.durationMinutes || timeLimit
      });
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      const validation = error?.response?.data?.errors;
      console.error('Error generating exam:', error.response?.data || error.message);
      const friendly = apiMessage || (validation ? 'Exam generation failed. Check inputs.' : null);
      alert(friendly || 'Failed to generate exam. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Skills</span>
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-violet-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Generate AI Exam</h1>
          </div>
        </div>
        <p className="text-gray-600 mt-2">Customize your exam parameters and let our AI generate a personalized assessment</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Enter Skill */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-900 mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-600" />
                  Enter Skill to Test
                </div>
              </label>
              
              {/* Skill Input Field */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Enter any skill (e.g., React, Python, AWS, Docker, Machine Learning...)"
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-lg transition-all"
                />
                {skillInput && (
                  <button
                    onClick={handleClearSkill}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-6">
                <Sparkles className="w-4 h-4 inline mr-1 text-violet-500" />
                Our AI will generate personalized questions for any skill you enter
              </p>

              {/* User's Skills to Learn - Quick Selection */}
              {userSkillsToLearn.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-violet-600" />
                    <span className="text-sm font-medium text-violet-700">Skills you want to learn</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userSkillsToLearn.map((skill, index) => (
                      <button
                        key={index}
                        onClick={() => handleSkillSelect(skill)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 flex items-center gap-1 ${
                          skillInput === skill
                            ? 'border-violet-500 bg-violet-100 text-violet-700'
                            : 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-400 hover:bg-violet-100'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* User's Known Skills - Quick Selection */}
              {userKnownSkills.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Test your expertise</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userKnownSkills.map((skill, index) => (
                      <button
                        key={index}
                        onClick={() => handleSkillSelect(skill)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 flex items-center gap-1 ${
                          skillInput === skill
                            ? 'border-green-500 bg-green-100 text-green-700'
                            : 'border-green-200 bg-green-50 text-green-700 hover:border-green-400 hover:bg-green-100'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No saved skills message */}
              {userSkillsToLearn.length === 0 && userKnownSkills.length === 0 && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <Info className="w-4 h-4 inline mr-1" />
                    Tip: Complete your profile to see your saved skills here for quick selection!
                  </p>
                </div>
              )}
            </div>

            {/* Difficulty Level */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-900 mb-4">
                Difficulty Level
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setDifficultyLevel(level.id)}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      difficultyLevel === level.id
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${level.color}`}>
                      {level.label}
                    </div>
                    <p className="text-xs text-gray-600">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-900 mb-4">
                Number of Questions
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-2xl font-bold text-violet-600 min-w-[3rem] text-center">
                  {numQuestions}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Recommended: 10-20 questions for a balanced assessment
              </p>
            </div>

            {/* Time Limit */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-900 mb-4">
                Time Limit (minutes)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-2xl font-bold text-violet-600 min-w-[3rem] text-center">
                  {timeLimit}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Approximately {Math.round(timeLimit / numQuestions * 60)} seconds per question
              </p>
            </div>

            {/* Exam Preview */}
            {skillInput.trim() && (
              <div className="mb-8 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-violet-600" />
                  <h3 className="font-semibold text-gray-900">Exam Preview</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-700">Skill: {skillInput}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-700">Level: {difficultyLevel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-700">{numQuestions} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-600" />
                    <span className="text-gray-700">{timeLimit} minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onBack}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Back to Skills
              </button>
              <button
                onClick={handleGenerateExam}
                disabled={!skillInput.trim() || isGenerating}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Exam...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate Exam
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}