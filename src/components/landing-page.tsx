import React, { useState, useEffect } from 'react';
import { FileText, Layers, Search, Palette, ArrowRight, Users, Star, CheckCircle, Menu, X, Github, Twitter, Linkedin } from 'lucide-react';

const BoltLogo = () => (
  <div className="fixed bottom-6 right-6 z-[100] w-16 h-16 md:w-20 md:h-20">
    <a 
      href="https://bolt.new/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full h-full hover:scale-110 transition-transform duration-200"
    >
      <img 
        src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/refs/heads/main/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.webp"
        alt="Powered by Bolt"
        className="w-full h-full object-contain"
      />
    </a>
  </div>
);

// Nimbus Note Logo Component 
const NimbusLogo = ({ className = "w-8 h-8", collapsed = false }) => {
  if (collapsed) {
    return (
      <svg version="1.1" viewBox="0 0 107.5 112.6" className={className} xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M61.8,69.1c-4-3.4-9.2-8-14.7-12.9l0,0C33.8,44.4,18.9,31.5,18.6,31c-0.6-0.7-1.6-0.6-1.8-0.6c-0.1,0,0,0,0,0H4.5 c-1.2,0-2.2,1-2.2,2.2v48c0,1.2,1,2.2,2.2,2.2h9.7c0.1,0,0.3,0,0.3-0.3V45.4l0,0l0,0l0,0l0,0c0-0.6,0.6-1,1.2-1s0.4,0,0.6,0.1l0,0 l0,0c0,0,0,0,0.1,0l21.8,18.9l0,0l4,3.4l0,0l13.8,12l3.1,2.7l0,0c1.6,1.9,2.5,4.3,2.5,7c0,6.4-5.5,11.6-12.2,11.6 s-12.2-5.2-12.2-11.6s1.5-6.2,3.9-8.3s0-0.3,0-0.4l-8.3-7.1c0,0-0.3,0-0.4,0c-4.3,4.2-6.8,9.8-6.8,15.9c0,12.6,10.7,22.7,24.1,22.7 S73.7,101,73.7,88.5s-4.3-13.1-4.6-13.4s0,0,0,0c-0.1-0.1-3-2.7-7.1-6.2L61.8,69.1z" />
        <path fill="currentColor" d="M45.8,44c4,3.4,9.2,8,14.7,12.9l0,0C73.9,68.6,88.7,81.6,89,82c0.6,0.7,1.8,0.6,1.8,0.6h2.1h1.3h8.9c1.2,0,2.2-1,2.2-2.2 v-48c0-1.2-1-2.2-2.2-2.2h-10v37.4l0,0l0,0l0,0l0,0c0,0.6-0.6,1-1.2,1s-0.4,0-0.6-0.1l0,0l0,0c0,0,0,0-0.1,0L69.4,49.6l0,0l-4-3.4 l0,0l-13.8-12l-3.1-2.7c-1.6-1.9-2.5-4.3-2.5-7c0-6.4,5.5-11.6,12.2-11.6c6.7,0,12.2,5.2,12.2,11.6s-1.6,6.5-4,8.6l8.8,7.6 c4.3-4.2,7-9.8,7-16.2C82,11.9,71.4,1.8,58,1.8S33.9,12.1,33.9,24.5s4.6,13.4,4.6,13.4s2.8,2.5,7.1,6.2L45.8,44z" />
      </svg>
    );
  }
  
  return (
    <svg version="1.1" viewBox="0 0 107.5 112.6" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M61.8,69.1c-4-3.4-9.2-8-14.7-12.9l0,0C33.8,44.4,18.9,31.5,18.6,31c-0.6-0.7-1.6-0.6-1.8-0.6c-0.1,0,0,0,0,0H4.5 c-1.2,0-2.2,1-2.2,2.2v48c0,1.2,1,2.2,2.2,2.2h9.7c0.1,0,0.3,0,0.3-0.3V45.4l0,0l0,0l0,0l0,0c0-0.6,0.6-1,1.2-1s0.4,0,0.6,0.1l0,0 l0,0c0,0,0,0,0.1,0l21.8,18.9l0,0l4,3.4l0,0l13.8,12l3.1,2.7l0,0c1.6,1.9,2.5,4.3,2.5,7c0,6.4-5.5,11.6-12.2,11.6 s-12.2-5.2-12.2-11.6s1.5-6.2,3.9-8.3s0-0.3,0-0.4l-8.3-7.1c0,0-0.3,0-0.4,0c-4.3,4.2-6.8,9.8-6.8,15.9c0,12.6,10.7,22.7,24.1,22.7 S73.7,101,73.7,88.5s-4.3-13.1-4.6-13.4s0,0,0,0c-0.1-0.1-3-2.7-7.1-6.2L61.8,69.1z" />
      <path fill="currentColor" d="M45.8,44c4,3.4,9.2,8,14.7,12.9l0,0C73.9,68.6,88.7,81.6,89,82c0.6,0.7,1.8,0.6,1.8,0.6h2.1h1.3h8.9c1.2,0,2.2-1,2.2-2.2 v-48c0-1.2-1-2.2-2.2-2.2h-10v37.4l0,0l0,0l0,0l0,0c0,0.6-0.6,1-1.2,1s-0.4,0-0.6-0.1l0,0l0,0c0,0,0,0-0.1,0L69.4,49.6l0,0l-4-3.4 l0,0l-13.8-12l-3.1-2.7c-1.6-1.9-2.5-4.3-2.5-7c0-6.4,5.5-11.6,12.2-11.6c6.7,0,12.2,5.2,12.2,11.6s-1.6,6.5-4,8.6l8.8,7.6 c4.3-4.2,7-9.8,7-16.2C82,11.9,71.4,1.8,58,1.8S33.9,12.1,33.9,24.5s4.6,13.4,4.6,13.4s2.8,2.5,7.1,6.2L45.8,44z" />
    </svg>
  );
};

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <NimbusLogo className="w-8 h-8 text-gray-900" />
              <span className="text-xl font-bold text-gray-900">Nimbus Note</span>
            </div>
          
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={onGetStarted}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-[#ff4e00] text-white px-6 py-2 rounded-full hover:bg-[#ff4e00]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Try Nimbus Note
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t py-4">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <button 
                    onClick={onGetStarted}
                    className="text-left text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={onGetStarted}
                    className="bg-[#ff4e00] text-white px-6 py-2 rounded-full hover:bg-[#ff4e00]/90 transition-colors"
                  >
                    Try Nimbus Note
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Visual Writing
                <span className="bg-gradient-to-r from-[#ff4e00] to-[#ff6b35] bg-clip-text text-transparent">
                  {" "}Assistant
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Organize your creative content with visual thinking. Import files, categorize ideas, and map your story on an infinite canvas designed for writers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={onGetStarted}
                  className="bg-[#ff4e00] text-white px-8 py-4 rounded-full hover:bg-[#ff4e00]/90 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center group"
                >
                  Try Nimbus Note
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onGetStarted}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-gray-400 transition-colors"
                >
                  Sign In
                </button>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Free to start
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  No credit card required
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#f2eee2] to-white rounded-2xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Chapter 1</div>
                        <div className="text-sm text-gray-500">2,341 words</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Main Character</div>
                        <div className="text-sm text-gray-500">Sarah Chen</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Plot Outline</div>
                        <div className="text-sm text-gray-500">Act 1 - Setup</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

     {/* Features with Visual Examples Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your organized writing is just a few clicks away
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock your creative potential with our easy-to-use visual organization system.
            </p>
          </div>

          {/* Import & Categorize Feature */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Smart import to organize your content
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Upload your existing documents and watch as Nimbus Note extracts content and helps you categorize it into Characters, Plots, Research, and Chapters. Our intelligent system recognizes content types and suggests the best organization structure.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Automatic content extraction from .docx and .txt files</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Intelligent categorization suggestions</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Smart tagging system for easy retrieval</span>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="ml-4 text-sm text-gray-600">Planning - Plot</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Plot Thread Card - Based on actual PlotPage component */}
                      <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-100 hover:scale-102 hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎯</span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 transition-colors duration-200 hover:bg-blue-200">
                              Main Plot
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">65%</div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">Dimensional War & Alliance</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">Primary story arc driving the narrative through demon invasion</p>
                        
                        {/* Tension Curve Preview */}
                        <div className="mb-3 overflow-hidden rounded">
                          <svg className="w-full h-8 transition-all duration-300 group-hover:h-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <polyline
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="1.5"
                              points="0,15 10,10 20,8 30,5 40,12 50,6 60,3 70,2 80,8 90,12 100,15"
                              className="transition-all duration-300 group-hover:stroke-2"
                            />
                          </svg>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500 bg-blue-500"
                              style={{ width: '65%' }}
                            />
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded transition-colors duration-200 hover:bg-gray-200">war</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded transition-colors duration-200 hover:bg-gray-200">alliance</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded transition-colors duration-200 hover:bg-gray-200">magic</span>
                        </div>
                      </div>

                      {/* Character Arc Card */}
                      <div className="p-4 rounded-lg border border-green-200 bg-green-50 cursor-pointer transition-all duration-200 hover:border-green-300 hover:bg-green-100 hover:scale-102 hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👤</span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Character Arc
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">45%</div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">Mana Awakening Journey</h3>
                        <p className="text-sm text-gray-600 mb-3">Individual character development from ordinary to mana master</p>
                        
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">character-growth</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">training</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Organize Visually Feature */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Visualize connections in your story
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Transform your linear notes into a visual masterpiece. Our infinite canvas lets you see relationships between characters, plot points, and themes. Create connections that make sense to your creative process and discover new story possibilities.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Infinite canvas for unlimited creativity</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Drag-and-drop organization system</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Visual connections between story elements</span>
                  </div>
                </div>
              </div>
              <div className="lg:order-1 relative group">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="ml-4 text-sm text-gray-600">Visual Canvas</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 h-80 relative overflow-hidden">
                    {/* Canvas nodes based on actual Canvas.tsx component */}
                    <div className="absolute top-8 left-8 min-w-[150px] bg-green-100 border-2 border-green-300 rounded-lg p-3 shadow-sm transform transition-all duration-300 hover:scale-110 hover:rotate-1 hover:shadow-lg cursor-pointer group-hover:animate-bounce">
                      <div className="font-semibold text-green-800 text-sm">Sarah</div>
                      <div className="text-xs text-green-600 mt-1">Protagonist</div>
                      <div className="absolute top-1 right-1 text-xs bg-green-200 hover:bg-green-300 rounded px-1 transition-colors duration-200">📋</div>
                    </div>
                    
                    <div className="absolute top-8 right-8 min-w-[150px] bg-blue-100 border-2 border-blue-300 rounded-lg p-3 shadow-sm transform transition-all duration-300 hover:scale-110 hover:-rotate-1 hover:shadow-lg cursor-pointer group-hover:animate-bounce" style={{animationDelay: '0.1s'}}>
                      <div className="font-semibold text-blue-800 text-sm">Opening Scene</div>
                      <div className="text-xs text-blue-600 mt-1">Setup</div>
                      <div className="absolute top-1 right-1 text-xs bg-blue-200 hover:bg-blue-300 rounded px-1 transition-colors duration-200">📋</div>
                    </div>
                    
                    <div className="absolute bottom-8 left-8 min-w-[150px] bg-purple-100 border-2 border-purple-300 rounded-lg p-3 shadow-sm transform transition-all duration-300 hover:scale-110 hover:rotate-1 hover:shadow-lg cursor-pointer group-hover:animate-bounce" style={{animationDelay: '0.2s'}}>
                      <div className="font-semibold text-purple-800 text-sm">Coastal Town</div>
                      <div className="text-xs text-purple-600 mt-1">Setting</div>
                      <div className="absolute top-1 right-1 text-xs bg-purple-200 hover:bg-purple-300 rounded px-1 transition-colors duration-200">📋</div>
                    </div>
                    
                    <div className="absolute bottom-8 right-8 min-w-[150px] bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 shadow-sm transform transition-all duration-300 hover:scale-110 hover:-rotate-1 hover:shadow-lg cursor-pointer group-hover:animate-bounce" style={{animationDelay: '0.3s'}}>
                      <div className="font-semibold text-yellow-800 text-sm">Peace vs Chaos</div>
                      <div className="text-xs text-yellow-600 mt-1">Theme</div>
                    </div>

                    {/* Connection lines with React Flow style */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 group-hover:opacity-80">
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
                        </marker>
                      </defs>
                      <path 
                        d="M 170 50 Q 250 30 330 50" 
                        fill="none" 
                        stroke="#6366F1" 
                        strokeWidth="2" 
                        strokeDasharray="4,4"
                        markerEnd="url(#arrowhead)"
                        className="animate-pulse transition-all duration-500" 
                      />
                      <path 
                        d="M 170 90 Q 250 150 330 210" 
                        fill="none" 
                        stroke="#8B5CF6" 
                        strokeWidth="2" 
                        strokeDasharray="4,4"
                        markerEnd="url(#arrowhead)"
                        className="animate-pulse transition-all duration-500" 
                        style={{animationDelay: '0.5s'}}
                      />
                      <path 
                        d="M 330 90 Q 250 150 170 210" 
                        fill="none" 
                        stroke="#F59E0B" 
                        strokeWidth="2" 
                        strokeDasharray="4,4"
                        markerEnd="url(#arrowhead)"
                        className="animate-pulse transition-all duration-500" 
                        style={{animationDelay: '1s'}}
                      />
                    </svg>

                    {/* Handle indicators based on React Flow */}
                    <div className="absolute top-12 left-12 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-12 right-12 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-12 left-12 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-12 right-12 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Write & Refine Feature */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Write with your entire world at your fingertips
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Never lose track of your story details again. Our integrated editor keeps your visual map and research notes right beside your writing. Access character details, plot points, and research instantly without breaking your creative flow.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Integrated editor with side-by-side notes</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Real-time sync with your visual canvas</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Quick access to all related content</span>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="ml-4 text-sm text-gray-600">Editor - Chapter 1</span>
                    </div>
                  </div>
                  <div className="flex">
                    {/* Editor area - Based on actual Editor.tsx */}
                    <div className="flex-1 p-6">
                      <div className="space-y-4">
                        {/* Title area */}
                        <div className="text-center mb-6">
                          <div className="text-2xl font-semibold text-black font-inter transition-all duration-300 group-hover:text-blue-900">
                            The Golden Sunset
                          </div>
                        </div>
                        
                        {/* Content editor with realistic text and hover effects */}
                        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                          <p className="transition-all duration-300 group-hover:text-gray-900">
                            The golden sunset cast a tranquil spell over the ocean.
                          </p>
                          <p className="transition-all duration-300 group-hover:text-gray-900">
                            As the sun began to set, <span className="bg-purple-100 px-1 rounded transition-all duration-300 hover:bg-purple-200 cursor-pointer">Sarah</span> felt a sense of peace wash over her. The <span className="bg-orange-100 px-1 rounded transition-all duration-300 hover:bg-orange-200 cursor-pointer">coastal town</span> had always been her sanctuary, a place where she could escape the chaos of her everyday life.
                          </p>
                          <div className="w-2 h-4 bg-blue-400 animate-pulse inline-block transition-all duration-300 group-hover:bg-blue-600"></div>
                        </div>
                        
                        {/* Auto-save indicator */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 mt-4">
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Auto-saving...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes panel - Based on the side panel concept */}
                    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 transition-all duration-300 group-hover:bg-gray-100">
                      <div className="text-sm font-semibold text-gray-900 mb-3 transition-all duration-300 group-hover:text-blue-900">Quick Notes</div>
                      <div className="space-y-3">
                        {/* Character note */}
                        <div className="bg-purple-50 p-3 rounded border border-purple-200 transform transition-all duration-300 hover:scale-105 hover:bg-purple-100 hover:shadow-md cursor-pointer">
                          <div className="text-xs font-semibold text-purple-800 mb-1">Sarah - Protagonist</div>
                          <div className="text-xs text-purple-600">Age 28, Marine biologist, seeking peace after divorce</div>
                        </div>
                        
                        {/* Setting note */}
                        <div className="bg-orange-50 p-3 rounded border border-orange-200 transform transition-all duration-300 hover:scale-105 hover:bg-orange-100 hover:shadow-md cursor-pointer">
                          <div className="text-xs font-semibold text-orange-800 mb-1">Coastal Town Setting</div>
                          <div className="text-xs text-orange-600">Population 3,000, lighthouse on cliff, fishing village</div>
                        </div>
                        
                        {/* Plot note */}
                        <div className="bg-blue-50 p-3 rounded border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:bg-blue-100 hover:shadow-md cursor-pointer">
                          <div className="text-xs font-semibold text-blue-800 mb-1">Plot Point</div>
                          <div className="text-xs text-blue-600">Establish peaceful setting before conflict introduction</div>
                        </div>
                      </div>
                      
                      {/* Word count stats - Based on Editor.tsx status bar */}
                      <div className="mt-4 pt-3 border-t border-gray-200 transition-all duration-300 group-hover:border-gray-300">
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Words:</span>
                            <span className="font-medium transition-all duration-300 group-hover:text-blue-600">347</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Characters:</span>
                            <span className="font-medium">1,823</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Reading time:</span>
                            <span className="font-medium">2 min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by writers everywhere</h2>
            <p className="text-xl text-gray-600">See what writers are saying about Nimbus Note</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "Finally, a tool that understands how writers actually think. The visual canvas changed how I approach my novels."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MR</span>
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Maria Rodriguez</div>
                  <div className="text-gray-600">Fantasy Author</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "The import feature saved me hours of manual organization. My scattered research is finally manageable."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">DJ</span>
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">David Johnson</div>
                  <div className="text-gray-600">Historical Fiction Writer</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "The visual connections help me spot plot holes before they become problems. Invaluable for complex narratives."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SK</span>
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Sarah Kim</div>
                  <div className="text-gray-600">Thriller Author</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you're ready to scale</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $0<span className="text-lg text-gray-500 font-normal">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Basic search & filtering</span>
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-full hover:bg-gray-200 transition-colors"
              >
                Get Started
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] rounded-2xl p-8 shadow-xl text-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">
                $12<span className="text-lg opacity-80 font-normal">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Unlimited content items</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Advanced visual canvas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>AI-powered organization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Advanced search & insights</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Export to multiple formats</span>
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full bg-white text-[#ff4e00] py-3 rounded-full hover:bg-gray-50 transition-colors font-semibold"
              >
                Start Free Trial
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Team</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $29<span className="text-lg text-gray-500 font-normal">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Real-time collaboration</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Shared workspaces</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Advanced permissions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-full hover:bg-gray-200 transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to transform your writing process?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of writers who've discovered the power of visual organization. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onGetStarted}
              className="bg-white text-[#ff4e00] px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center group font-semibold"
            >
              Try Nimbus Note
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onGetStarted}
              className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-[#ff4e00] transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <NimbusLogo className="w-8 h-8 text-white" />
                <span className="text-xl font-bold">Nimbus Note</span>
              </div>
              <p className="text-gray-400 mb-6">
                The visual writing assistant that helps you organize your creative process and bring your stories to life.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Changelog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Nimbus Note. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
      {/* Add the Bolt Logo here */}
      <BoltLogo />
    </div>
  );
};
