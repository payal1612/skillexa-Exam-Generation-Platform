import { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Target, 
  Trophy, 
  BookOpen, 
  Zap, 
  Award,
  Brain,
  Flame,
  TrendingUp,
  CheckCircle,
  Rocket
} from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Skillexa! 🎉',
    description: 'Your AI-powered learning platform that helps you master new skills, earn certificates, and track your progress.',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600',
    features: [
      'AI-Generated Exams',
      'Skill Tracking',
      'Certificates',
      'Gamification'
    ],
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your command center. Track your progress, view stats, and access all features from here.',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    highlight: '.dashboard-stats',
    position: 'right'
  },
  {
    id: 'exams',
    title: 'AI-Powered Exams',
    description: 'Generate personalized exams on any topic using AI. Test your knowledge and earn XP!',
    icon: Brain,
    color: 'from-pink-500 to-rose-500',
    highlight: '.quick-actions',
    position: 'bottom'
  },
  {
    id: 'gamification',
    title: 'Level Up System',
    description: 'Earn XP for every activity, level up, maintain streaks, and climb the leaderboard!',
    icon: Trophy,
    color: 'from-yellow-500 to-orange-500',
    highlight: '.gamification-widget',
    position: 'left'
  },
  {
    id: 'achievements',
    title: 'Unlock Achievements',
    description: 'Complete challenges and milestones to unlock badges and achievements.',
    icon: Award,
    color: 'from-green-500 to-emerald-500',
    highlight: '.achievements-section',
    position: 'right'
  },
  {
    id: 'career',
    title: 'Career Roadmaps',
    description: 'Get personalized learning paths tailored to your career goals.',
    icon: TrendingUp,
    color: 'from-purple-500 to-indigo-500',
    highlight: '.career-section',
    position: 'bottom'
  },
  {
    id: 'ready',
    title: "You're All Set! 🚀",
    description: 'Start your learning journey now. Take your first exam and earn your first XP!',
    icon: Rocket,
    color: 'from-violet-600 to-purple-700',
    position: 'center',
    isLast: true
  }
];

export default function WelcomeTour({ onComplete, userName }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('skillexa_tour_completed', 'true');
    setTimeout(() => {
      onComplete?.();
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  useEffect(() => {
    // Add highlight effect to current element
    const highlightElement = step.highlight && document.querySelector(step.highlight);
    if (highlightElement) {
      highlightElement.classList.add('tour-highlight');
      return () => highlightElement.classList.remove('tour-highlight');
    }
  }, [currentStep]);

  if (!isVisible) return null;

  const Icon = step.icon;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Tour Modal */}
      <div className={`fixed inset-0 z-[101] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div 
          className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
            isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className={`h-full bg-gradient-to-r ${step.color} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with Icon */}
          <div className={`bg-gradient-to-br ${step.color} p-8 text-white`}>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Icon className="w-10 h-10" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </p>
                <h2 className="text-2xl font-bold">{step.title}</h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Features List (for welcome step) */}
            {step.features && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {step.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Personalized greeting for first step */}
            {currentStep === 0 && userName && (
              <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 mb-6">
                <p className="text-violet-700 font-medium">
                  Hi {userName}! Let's take a quick tour to help you get started.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  currentStep === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              <div className="flex items-center gap-2">
                {TOUR_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setCurrentStep(index);
                        setIsAnimating(false);
                      }, 300);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentStep 
                        ? 'w-8 bg-violet-600' 
                        : index < currentStep 
                          ? 'bg-violet-300' 
                          : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all bg-gradient-to-r ${step.color} text-white hover:shadow-lg hover:scale-105`}
              >
                {step.isLast ? (
                  <>
                    Get Started
                    <Rocket className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for highlight effect */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 99;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          animation: pulse-highlight 2s ease-in-out infinite;
        }
        
        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.4);
          }
        }
      `}</style>
    </>
  );
}

// Feature Spotlight component for highlighting specific features
export function FeatureSpotlight({ children, title, description, position = 'bottom' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenSpotlight = localStorage.getItem(`spotlight_${title}`);
    if (!hasSeenSpotlight) {
      setIsVisible(true);
    }
  }, [title]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`spotlight_${title}`, 'true');
  };

  const positionClasses = {
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-violet-600 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-violet-600 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-violet-600 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-violet-600 border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <div className="relative inline-block">
      {children}
      
      {isVisible && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={handleDismiss} />
          <div className={`absolute z-50 ${positionClasses[position]}`}>
            <div className="bg-violet-600 text-white p-4 rounded-xl shadow-xl max-w-xs animate-bounce-slow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold mb-1">{title}</h4>
                  <p className="text-sm text-violet-100">{description}</p>
                </div>
                <button 
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`} />
          </div>
        </>
      )}
    </div>
  );
}
