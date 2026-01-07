import { CheckCircle, Play, Star, Users, Award } from "lucide-react";

export default function Hero({ goToLogin, goToRegister }) {
  return (
    <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 bg-gradient-to-br from-violet-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto">
       

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
              New: AI-Powered Skill Assessment
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Master Any AI Skill,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
                Verified by Data.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              AI Skill Forage customizes your learning path and validates your
              mastery with hyper-realistic, AI-generated exams. Stop guessing,
              start certifying your expertise with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
              <button 
                onClick={goToRegister}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4" />
                Start Free Trial
                <span className="ml-1">→</span>
              </button>

              <button 
                onClick={goToLogin}
                className="bg-white hover:bg-gray-50 text-gray-900 px-6 sm:px-8 py-3 rounded-lg font-medium border border-gray-300 transition-all duration-300 hover:border-gray-400 hover:shadow-md"
              >
                Sign In
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-gray-600 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Free Acess Content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Start learning in minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span> learn  anytime</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/Dashboard.jpg"
                alt="AI Dashboard"
                className="w-full h-auto object-cover rounded-xl shadow-2xl"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>

        
      </div>
    </section>
  );
}