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
      <section className="py-20 bg-[#e8ddc1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your organized writing is just a few clicks away
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock your creative potential with our easy-to-use visual organization system.
            </p>
          </div>

      {/* Visual Canvas Feature - Centered */}
<div className="mb-20">
  {/* Centered Canvas Graphic - 70% width */}
  <div className="w-full flex justify-center mb-16">
    <div className="w-[70%] relative group">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all duration-300 group-hover:shadow-3xl">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="ml-4 text-sm text-gray-600">Story Canvas - Interactive Visualization</span>
          </div>
        </div>
        
        <div className="flex h-[500px]">
          {/* Collapsed Sidebar */}
          <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-xs">📊</span>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors">
              <span className="text-xs">✏️</span>
            </div>
            <div className="w-8 h-8 bg-[#e8ddc1] rounded-lg flex items-center justify-center hover:bg-[#d4c7a8] transition-colors">
              <span className="text-xs">🎨</span>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-xs">📋</span>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-xs">📁</span>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-xs">⚙️</span>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-xs">❓</span>
            </div>
          </div>
          
          {/* Main Canvas Area */}
          <div className="flex-1 bg-gray-50 relative overflow-hidden">
            {/* Canvas Grid Background */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
        Build your story visually on an infinite canvas. Create character nodes, plot points, and locations, then connect them to see relationships and story flow. Sync with Planning Pages and use templates to get started quickly.
      </p>
      <div className="space-y-3">
        <div className="flex items-center text-gray-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          <span>Drag-and-drop story elements and connections</span>
        </div>
        <div className="flex items-center text-gray-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          <span>Templates for Hero's Journey, Three-Act Structure, and more</span>
        </div>
        <div className="flex items-center text-gray-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          <span>Real-time sync with Planning Pages for consistency</span>
        </div>
      </div>
    </div>
    
    <div className="relative">
      <div className="bg-gradient-to-br from-[#f2eee2] to-white rounded-2xl p-8 shadow-2xl">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">👥</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">8 Characters</div>
                <div className="text-sm text-gray-500">Connected in story web</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">📖</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">12 Plot Points</div>
                <div className="text-sm text-gray-500">Linked in sequence</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">🗺️</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">6 Locations</div>
                <div className="text-sm text-gray-500">Mapped relationships</div>
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

<style>
.node-hover:hover {
  border-width: 4px;
}

.tab-button.active {
  background: white;
  color: rgb(17 24 39);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.tab-content.hidden {
  display: none;
}
</style>

<script>
function showTab(tabName) {
  // Hide all tab contents
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => content.classList.add('hidden'));
  
  // Remove active class from all buttons
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(button => button.classList.remove('active'));
  
  // Show selected tab content
  const selectedContent = document.getElementById(tabName + '-tab');
  if (selectedContent) {
    selectedContent.classList.remove('hidden');
  }
  
  // Add active class to clicked button
  event.target.classList.add('active');
}attern id="canvasgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#d1d5db" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#canvasgrid)"/>
            </svg>
            
            {/* Story Nodes - Based on sampleNodes.ts */}
            {/* Sylandria Character Node */}
            <div className="absolute top-16 left-20 min-w-[140px] bg-green-100 border-2 border-green-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-green-500 node-hover">
              <div className="font-semibold text-green-800 text-sm">Sylandria Moonwhisper</div>
              <div className="text-xs text-green-600 mt-1">Dark Elf Princess</div>
              <div className="text-xs text-green-500 mt-1">Mage/Noble</div>
              <div className="absolute top-1 right-1 text-xs bg-green-200 hover:bg-green-300 rounded px-1 transition-colors duration-200">⚛️</div>
              {/* Connection handles */}
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Theron Character Node */}
            <div className="absolute top-16 right-20 min-w-[140px] bg-green-100 border-2 border-green-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-green-500 node-hover">
              <div className="font-semibold text-green-800 text-sm">Theron Brightblade</div>
              <div className="text-xs text-green-600 mt-1">Human Knight</div>
              <div className="text-xs text-green-500 mt-1">Knight/Guardian</div>
              <div className="absolute top-1 right-1 text-xs bg-green-200 hover:bg-green-300 rounded px-1 transition-colors duration-200">⚛️</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Awakening Power Plot Node */}
            <div className="absolute top-40 left-1/3 transform -translate-x-1/2 min-w-[140px] bg-blue-100 border-2 border-blue-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-blue-500 node-hover">
              <div className="font-semibold text-blue-800 text-sm">Awakening Power</div>
              <div className="text-xs text-blue-600 mt-1">Major Event</div>
              <div className="text-xs text-blue-500 mt-1">Chapter 1</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* The Mentor Arrives Plot Node */}
            <div className="absolute top-40 right-1/3 transform translate-x-1/2 min-w-[140px] bg-blue-100 border-2 border-blue-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-blue-500 node-hover">
              <div className="font-semibold text-blue-800 text-sm">The Mentor Arrives</div>
              <div className="text-xs text-blue-600 mt-1">Major Event</div>
              <div className="text-xs text-blue-500 mt-1">Chapter 2</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Nyth'Anduil Location Node */}
            <div className="absolute bottom-20 left-20 min-w-[140px] bg-purple-100 border-2 border-purple-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-purple-500 node-hover">
              <div className="font-semibold text-purple-800 text-sm">Nyth'Anduil</div>
              <div className="text-xs text-purple-600 mt-1">Dark Elf City</div>
              <div className="text-xs text-purple-500 mt-1">Underground</div>
              <div className="absolute top-1 right-1 text-xs bg-purple-200 hover:bg-purple-300 rounded px-1 transition-colors duration-200">⚛️</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Kingdom of Astoria Location Node */}
            <div className="absolute bottom-20 right-20 min-w-[140px] bg-purple-100 border-2 border-purple-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-purple-500 node-hover">
              <div className="font-semibold text-purple-800 text-sm">Kingdom of Astoria</div>
              <div className="text-xs text-purple-600 mt-1">Human Kingdom</div>
              <div className="text-xs text-purple-500 mt-1">Surface Realm</div>
              <div className="absolute top-1 right-1 text-xs bg-purple-200 hover:bg-purple-300 rounded px-1 transition-colors duration-200">⚛️</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Magic System Research Node */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-[140px] bg-indigo-100 border-2 border-indigo-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-indigo-500 node-hover">
              <div className="font-semibold text-indigo-800 text-sm">Magic System</div>
              <div className="text-xs text-indigo-600 mt-1">Research Notes</div>
              <div className="text-xs text-indigo-500 mt-1">World Building</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Power and Responsibility Theme Node */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 min-w-[140px] bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-yellow-500 node-hover">
              <div className="font-semibold text-yellow-800 text-sm">Power & Responsibility</div>
              <div className="text-xs text-yellow-600 mt-1">Central Theme</div>
              <div className="text-xs text-yellow-500 mt-1">Major</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id="canvasarrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#6366F1" />
                </marker>
              </defs>
              {/* Sylandria to Theron */}
              <path 
                d="M 220 50 Q 300 30 380 50" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s'}}
              />
              {/* Sylandria to Awakening Power */}
              <path 
                d="M 160 80 Q 180 120 200 140" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s', animationDelay: '0.5s'}}
              />
              {/* Theron to Mentor Arrives */}
              <path 
                d="M 440 80 Q 460 120 480 140" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s', animationDelay: '1s'}}
              />
              {/* Awakening Power to Mentor Arrives */}
              <path 
                d="M 280 170 Q 350 180 420 170" 
                fill="none" 
                stroke="#F59E0B" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s', animationDelay: '1.5s'}}
              />
              {/* Sylandria to Nyth'Anduil */}
              <path 
                d="M 140 110 Q 120 200 140 320" 
                fill="none" 
                stroke="#8B5CF6" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s', animationDelay: '2s'}}
              />
              {/* Theron to Astoria */}
              <path 
                d="M 460 110 Q 480 200 460 320" 
                fill="none" 
                stroke="#8B5CF6" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s', animationDelay: '2.5s'}}
              />
              {/* Theme to Characters */}
              <path 
                d="M 300 80 Q 250 60 200 70" 
                fill="none" 
                stroke="#EC4899" 
                strokeWidth="1.5" 
                strokeDasharray="3,3"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '4s'}}
              />
              <path 
                d="M 340 80 Q 390 60 440 70" 
                fill="none" 
                stroke="#EC4899" 
                strokeWidth="1.5" 
                strokeDasharray="3,3"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '4s', animationDelay: '0.3s'}}
              />
            </svg>
            
            {/* Mini Map Preview */}
            <div className="absolute bottom-4 right-4 w-20 h-16 bg-white border border-gray-300 rounded opacity-80 transition-opacity group-hover:opacity-100">
              <div className="w-full h-full bg-gray-100 rounded relative overflow-hidden">
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/4 left-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
            
            {/* Canvas Controls */}
            <div className="absolute bottom-4 left-4 flex flex-col space-y-1 opacity-80 transition-opacity group-hover:opacity-100">
              <button className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-sm font-medium">+</button>
              <button className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-sm font-medium">-</button>
              <button className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-sm">⚏</button>
              <button className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-sm">⊡</button>
            </div>
          </div>
          
          {/* Right Sidebar Menu - Interactive */}
          <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Story Canvas</h3>
                  <p className="text-sm text-gray-600">Plan your story visually</p>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <span className="text-xs">←</span>
                </button>
              </div>
              
              {/* Interactive Tab Navigation */}
              <div className="flex bg-[#e8ddc1] rounded-lg p-1" id="canvas-tabs">
                <button 
                  className="flex-1 px-3 py-1.5 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm tab-button active"
                  onclick="showTab('elements')"
                >
                  Elements
                </button>
                <button 
                  className="flex-1 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-white hover:shadow-sm tab-button"
                  onclick="showTab('templates')"
                >
                  Templates
                </button>
                <button 
                  className="flex-1 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-white hover:shadow-sm tab-button"
                  onclick="showTab('samples')"
                >
                  Samples
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Elements Tab */}
              <div className="p-4 tab-content" id="elements-tab">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Elements</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 text-xs rounded-lg border-2 border-green-300 bg-green-100 hover:bg-green-200 transition-colors flex items-center justify-center font-medium text-green-800">
                    Character
                  </button>
                  <button className="p-3 text-xs rounded-lg border-2 border-blue-300 bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-center font-medium text-blue-800">
                    Plot
                  </button>
                  <button className="p-3 text-xs rounded-lg border-2 border-purple-300 bg-purple-100 hover:bg-purple-200 transition-colors flex items-center justify-center font-medium text-purple-800">
                    Location
                  </button>
                  <button className="p-3 text-xs rounded-lg border-2 border-yellow-300 bg-yellow-100 hover:bg-yellow-200 transition-colors flex items-center justify-center font-medium text-yellow-800">
                    Theme
                  </button>
                  <button className="p-3 text-xs rounded-lg border-2 border-red-300 bg-red-100 hover:bg-red-200 transition-colors flex items-center justify-center font-medium text-red-800">
                    Conflict
                  </button>
                  <button className="p-3 text-xs rounded-lg border-2 border-indigo-300 bg-indigo-100 hover:bg-indigo-200 transition-colors flex items-center justify-center font-medium text-indigo-800">
                    Research
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-[#eae4d3] rounded-lg">
                  <div className="text-xs text-gray-700 font-medium mb-1">💡 Tip</div>
                  <div className="text-xs text-gray-600">
                    Click the ⚛️ button on nodes to link them to your Planning data!
                  </div>
                </div>
              </div>
              
              {/* Templates Tab */}
              <div className="p-4 tab-content hidden" id="templates-tab">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Story Templates</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Hero's Journey</div>
                    <div className="text-xs text-gray-600 mt-1">Classic monomyth structure</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Three-Act Structure</div>
                    <div className="text-xs text-gray-600 mt-1">Traditional screenplay format</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Mystery Structure</div>
                    <div className="text-xs text-gray-600 mt-1">Detective story template</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Romance Arc</div>
                    <div className="text-xs text-gray-600 mt-1">Love story progression</div>
                  </button>
                </div>
              </div>
              
              {/* Samples Tab */}
              <div className="p-4 tab-content hidden" id="samples-tab">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Sample Stories</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">The Shattered Crown</div>
                    <div className="text-xs text-gray-600 mt-1">Fantasy epic with magic system</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Lighthouse Keeper's Secret</div>
                    <div className="text-xs text-gray-600 mt-1">Mystery novel example</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Neural Echo</div>
                    <div className="text-xs text-gray-600 mt-1">Sci-fi thriller story</div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Actions Section */}
            <div className="p-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
              <div className="space-y-2">
                <button className="w-full p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium">
                  Sync Planning
                </button>
                <button className="w-full p-2 bg-[#f2eee2] border-[#e8ddc1] text-gray-700 rounded-lg hover:bg-[#e8ddc1] transition-colors text-sm">
                  Load File
                </button>
                <button className="w-full p-2 bg-[#f2eee2] border-[#e8ddc1] text-gray-700 rounded-lg hover:bg-[#e8ddc1] transition-colors text-sm">
                  Clear All
                </button>
              </div>
              
              <div className="text-xs text-gray-500 mt-3 space-y-1">
                <div>Last synced: 2:34 PM</div>
                <div className="text-green-600 font-medium">
                  All changes saved
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/* Visual Canvas Feature - Centered */}
<div className="mb-20">
  {/* Centered Canvas Graphic - 70% width */}
  <div className="w-full flex justify-center mb-16">
    <div className="w-[70%] relative group">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all duration-300 group-hover:shadow-3xl">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="ml-4 text-sm text-gray-600">Story Canvas - Interactive Visualization</span>
          </div>
        </div>
        
        <div className="flex h-[500px]">
          {/* Collapsed Sidebar */}
          <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-xs">📊</span>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors">
              <span className="text-xs">✏️</span>
            </div>
            <div className="w-8 h-8 bg-[#e8ddc1] rounded-lg flex items-center justify-center hover:bg-[#d4c7a8] transition-colors">
              <span className="text-xs">🎨</span>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-xs">📋</span>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-xs">📁</span>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-xs">⚙️</span>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="text-xs">❓</span>
            </div>
          </div>
          
          {/* Main Canvas Area */}
          <div className="flex-1 bg-gray-50 relative overflow-hidden">
            {/* Canvas Grid Background */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
        Build your story visually on an infinite canvas. Create character nodes, plot points, and locations, then connect them to see relationships and story flow. Sync with Planning Pages and use templates to get started quickly.
      </p>
      <div className="space-y-3">
        <div className="flex items-center text-gray-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          <span>Drag-and-drop story elements and connections</span>
        </div>
        <div className="flex items-center text-gray-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          <span>Templates for Hero's Journey, Three-Act Structure, and more</span>
        </div>
        <div className="flex items-center text-gray-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          <span>Real-time sync with Planning Pages for consistency</span>
        </div>
      </div>
    </div>
    
    <div className="relative">
      <div className="bg-gradient-to-br from-[#f2eee2] to-white rounded-2xl p-8 shadow-2xl">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">👥</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">8 Characters</div>
                <div className="text-sm text-gray-500">Connected in story web</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">📖</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">12 Plot Points</div>
                <div className="text-sm text-gray-500">Linked in sequence</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">🗺️</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">6 Locations</div>
                <div className="text-sm text-gray-500">Mapped relationships</div>
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

<style>
.node-hover:hover {
  border-width: 4px;
}

.tab-button.active {
  background: white;
  color: rgb(17 24 39);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.tab-content.hidden {
  display: none;
}
</style>

<script>
function showTab(tabName) {
  // Hide all tab contents
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => content.classList.add('hidden'));
  
  // Remove active class from all buttons
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(button => button.classList.remove('active'));
  
  // Show selected tab content
  const selectedContent = document.getElementById(tabName + '-tab');
  if (selectedContent) {
    selectedContent.classList.remove('hidden');
  }
  
  // Add active class to clicked button
  event.target.classList.add('active');
}attern id="canvasgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#d1d5db" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#canvasgrid)"/>
            </svg>
            
            {/* Story Nodes - Based on sampleNodes.ts */}
            {/* Sylandria Character Node */}
            <div className="absolute top-16 left-20 min-w-[140px] bg-green-100 border-2 border-green-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-green-500 node-hover">
              <div className="font-semibold text-green-800 text-sm">Sylandria Moonwhisper</div>
              <div className="text-xs text-green-600 mt-1">Dark Elf Princess</div>
              <div className="text-xs text-green-500 mt-1">Mage/Noble</div>
              <div className="absolute top-1 right-1 text-xs bg-green-200 hover:bg-green-300 rounded px-1 transition-colors duration-200">⚛️</div>
              {/* Connection handles */}
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Theron Character Node */}
            <div className="absolute top-16 right-20 min-w-[140px] bg-green-100 border-2 border-green-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-green-500 node-hover">
              <div className="font-semibold text-green-800 text-sm">Theron Brightblade</div>
              <div className="text-xs text-green-600 mt-1">Human Knight</div>
              <div className="text-xs text-green-500 mt-1">Knight/Guardian</div>
              <div className="absolute top-1 right-1 text-xs bg-green-200 hover:bg-green-300 rounded px-1 transition-colors duration-200">⚛️</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Awakening Power Plot Node */}
            <div className="absolute top-40 left-1/3 transform -translate-x-1/2 min-w-[140px] bg-blue-100 border-2 border-blue-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-blue-500 node-hover">
              <div className="font-semibold text-blue-800 text-sm">Awakening Power</div>
              <div className="text-xs text-blue-600 mt-1">Major Event</div>
              <div className="text-xs text-blue-500 mt-1">Chapter 1</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* The Mentor Arrives Plot Node */}
            <div className="absolute top-40 right-1/3 transform translate-x-1/2 min-w-[140px] bg-blue-100 border-2 border-blue-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-blue-500 node-hover">
              <div className="font-semibold text-blue-800 text-sm">The Mentor Arrives</div>
              <div className="text-xs text-blue-600 mt-1">Major Event</div>
              <div className="text-xs text-blue-500 mt-1">Chapter 2</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Nyth'Anduil Location Node */}
            <div className="absolute bottom-20 left-20 min-w-[140px] bg-purple-100 border-2 border-purple-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-purple-500 node-hover">
              <div className="font-semibold text-purple-800 text-sm">Nyth'Anduil</div>
              <div className="text-xs text-purple-600 mt-1">Dark Elf City</div>
              <div className="text-xs text-purple-500 mt-1">Underground</div>
              <div className="absolute top-1 right-1 text-xs bg-purple-200 hover:bg-purple-300 rounded px-1 transition-colors duration-200">⚛️</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Kingdom of Astoria Location Node */}
            <div className="absolute bottom-20 right-20 min-w-[140px] bg-purple-100 border-2 border-purple-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-purple-500 node-hover">
              <div className="font-semibold text-purple-800 text-sm">Kingdom of Astoria</div>
              <div className="text-xs text-purple-600 mt-1">Human Kingdom</div>
              <div className="text-xs text-purple-500 mt-1">Surface Realm</div>
              <div className="absolute top-1 right-1 text-xs bg-purple-200 hover:bg-purple-300 rounded px-1 transition-colors duration-200">⚛️</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Magic System Research Node */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-[140px] bg-indigo-100 border-2 border-indigo-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-indigo-500 node-hover">
              <div className="font-semibold text-indigo-800 text-sm">Magic System</div>
              <div className="text-xs text-indigo-600 mt-1">Research Notes</div>
              <div className="text-xs text-indigo-500 mt-1">World Building</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Power and Responsibility Theme Node */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 min-w-[140px] bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 hover:border-yellow-500 node-hover">
              <div className="font-semibold text-yellow-800 text-sm">Power & Responsibility</div>
              <div className="text-xs text-yellow-600 mt-1">Central Theme</div>
              <div className="text-xs text-yellow-500 mt-1">Major</div>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id="canvasarrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#6366F1" />
                </marker>
              </defs>
              {/* Sylandria to Theron */}
              <path 
                d="M 220 50 Q 300 30 380 50" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s'}}
              />
              {/* Sylandria to Awakening Power */}
              <path 
                d="M 160 80 Q 180 120 200 140" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s', animationDelay: '0.5s'}}
              />
              {/* Theron to Mentor Arrives */}
              <path 
                d="M 440 80 Q 460 120 480 140" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s', animationDelay: '1s'}}
              />
              {/* Awakening Power to Mentor Arrives */}
              <path 
                d="M 280 170 Q 350 180 420 170" 
                fill="none" 
                stroke="#F59E0B" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s', animationDelay: '1.5s'}}
              />
              {/* Sylandria to Nyth'Anduil */}
              <path 
                d="M 140 110 Q 120 200 140 320" 
                fill="none" 
                stroke="#8B5CF6" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s', animationDelay: '2s'}}
              />
              {/* Theron to Astoria */}
              <path 
                d="M 460 110 Q 480 200 460 320" 
                fill="none" 
                stroke="#8B5CF6" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '3s', animationDelay: '2.5s'}}
              />
              {/* Theme to Characters */}
              <path 
                d="M 300 80 Q 250 60 200 70" 
                fill="none" 
                stroke="#EC4899" 
                strokeWidth="1.5" 
                strokeDasharray="3,3"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '4s'}}
              />
              <path 
                d="M 340 80 Q 390 60 440 70" 
                fill="none" 
                stroke="#EC4899" 
                strokeWidth="1.5" 
                strokeDasharray="3,3"
                markerEnd="url(#canvasarrowhead)"
                className="animate-pulse" 
                style={{animationDuration: '4s', animationDelay: '0.3s'}}
              />
            </svg>
            
            {/* Mini Map Preview */}
            <div className="absolute bottom-4 right-4 w-20 h-16 bg-white border border-gray-300 rounded opacity-80 transition-opacity group-hover:opacity-100">
              <div className="w-full h-full bg-gray-100 rounded relative overflow-hidden">
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/4 left-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
            
            {/* Canvas Controls */}
            <div className="absolute bottom-4 left-4 flex flex-col space-y-1 opacity-80 transition-opacity group-hover:opacity-100">
              <button className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-sm font-medium">+</button>
              <button className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-sm font-medium">-</button>
              <button className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-sm">⚏</button>
              <button className="w-10 h-10 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-sm">⊡</button>
            </div>
          </div>
          
          {/* Right Sidebar Menu - Interactive */}
          <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Story Canvas</h3>
                  <p className="text-sm text-gray-600">Plan your story visually</p>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <span className="text-xs">←</span>
                </button>
              </div>
              
              {/* Interactive Tab Navigation */}
              <div className="flex bg-[#e8ddc1] rounded-lg p-1" id="canvas-tabs">
                <button 
                  className="flex-1 px-3 py-1.5 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm tab-button active"
                  onclick="showTab('elements')"
                >
                  Elements
                </button>
                <button 
                  className="flex-1 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-white hover:shadow-sm tab-button"
                  onclick="showTab('templates')"
                >
                  Templates
                </button>
                <button 
                  className="flex-1 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-white hover:shadow-sm tab-button"
                  onclick="showTab('samples')"
                >
                  Samples
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Elements Tab */}
              <div className="p-4 tab-content" id="elements-tab">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Elements</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 text-xs rounded-lg border-2 border-green-300 bg-green-100 hover:bg-green-200 transition-colors flex items-center justify-center font-medium text-green-800">
                    Character
                  </button>
                  <button className="p-3 text-xs rounded-lg border-2 border-blue-300 bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-center font-medium text-blue-800">
                    Plot
                  </button>
                  <button className="p-3 text-xs rounded-lg border-2 border-purple-300 bg-purple-100 hover:bg-purple-200 transition-colors flex items-center justify-center font-medium text-purple-800">
                    Location
                  </button>
                  <button className="p-3 text-xs rounded-lg border-2 border-yellow-300 bg-yellow-100 hover:bg-yellow-200 transition-colors flex items-center justify-center font-medium text-yellow-800">
                    Theme
                  </button>
                  <button className="p-3 text-xs rounded-lg border-2 border-red-300 bg-red-100 hover:bg-red-200 transition-colors flex items-center justify-center font-medium text-red-800">
                    Conflict
                  </button>
                  <button className="p-3 text-xs rounded-lg border-2 border-indigo-300 bg-indigo-100 hover:bg-indigo-200 transition-colors flex items-center justify-center font-medium text-indigo-800">
                    Research
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-[#eae4d3] rounded-lg">
                  <div className="text-xs text-gray-700 font-medium mb-1">💡 Tip</div>
                  <div className="text-xs text-gray-600">
                    Click the ⚛️ button on nodes to link them to your Planning data!
                  </div>
                </div>
              </div>
              
              {/* Templates Tab */}
              <div className="p-4 tab-content hidden" id="templates-tab">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Story Templates</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Hero's Journey</div>
                    <div className="text-xs text-gray-600 mt-1">Classic monomyth structure</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Three-Act Structure</div>
                    <div className="text-xs text-gray-600 mt-1">Traditional screenplay format</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Mystery Structure</div>
                    <div className="text-xs text-gray-600 mt-1">Detective story template</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Romance Arc</div>
                    <div className="text-xs text-gray-600 mt-1">Love story progression</div>
                  </button>
                </div>
              </div>
              
              {/* Samples Tab */}
              <div className="p-4 tab-content hidden" id="samples-tab">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Sample Stories</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">The Shattered Crown</div>
                    <div className="text-xs text-gray-600 mt-1">Fantasy epic with magic system</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Lighthouse Keeper's Secret</div>
                    <div className="text-xs text-gray-600 mt-1">Mystery novel example</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-sm">Neural Echo</div>
                    <div className="text-xs text-gray-600 mt-1">Sci-fi thriller story</div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Actions Section */}
            <div className="p-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Actions</h4>
              <div className="space-y-2">
                <button className="w-full p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium">
                  Sync Planning
                </button>
                <button className="w-full p-2 bg-[#f2eee2] border-[#e8ddc1] text-gray-700 rounded-lg hover:bg-[#e8ddc1] transition-colors text-sm">
                  Load File
                </button>
                <button className="w-full p-2 bg-[#f2eee2] border-[#e8ddc1] text-gray-700 rounded-lg hover:bg-[#e8ddc1] transition-colors text-sm">
                  Clear All
                </button>
              </div>
              
              <div className="text-xs text-gray-500 mt-3 space-y-1">
                <div>Last synced: 2:34 PM</div>
                <div className="text-green-600 font-medium">
                  All changes saved
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

  {/* Feature Description Below */}
  <div className="grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <h3 className="text-3xl font-bold text-gray-900 mb-6">
        Interactive story canvas with drag-and-drop visualization
      </h3>
      <p

  {/* Feature Description Below */}
  <div className="grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <h3 className="text-3xl font-bold text-gray-900 mb-6">
        Interactive story canvas with drag-and-drop visualization
      </h3>
      <p

          

          {/* Import & Categorize Feature */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Document import with smart categorization
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Upload .docx and .txt files up to 10MB with automatic content extraction. Our system suggests content types (Character, Plot, Research, Chapter) and lets you add custom tags for organization.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Support for .docx and .txt files up to 10MB</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Auto-suggested categories: Character, Plot, Research, Chapter</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Custom tagging system for organization</span>
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
                  Visual canvas with drag-and-drop nodes
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Add imported content as visual nodes on an infinite canvas. Create connections between ideas using React Flow's drag-and-drop interface. Organize your content visually to see relationships and discover new story possibilities.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Infinite canvas with React Flow integration</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Imported content becomes interactive nodes</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Drag connections to show relationships</span>
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
        Library management with search and filtering
      </h3>
      <p className="text-lg text-gray-600 mb-6 leading-relaxed">
        Manage all your imported content in one organized library. Search by title, content, or tags. Filter by content type and easily add items to your visual canvas. Everything syncs with Supabase for reliable storage.
      </p>
      <div className="space-y-3">
        <div className="flex items-center text-gray-700">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
          <span>Search by title, content, or custom tags</span>
        </div>
        <div className="flex items-center text-gray-700">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
          <span>Filter by content type (Character, Plot, Research, Chapter)</span>
        </div>
        <div className="flex items-center text-gray-700">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
          <span>One-click "Add to Canvas" functionality</span>
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

            {/* Subplot Card */}
            <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 cursor-pointer transition-all duration-200 hover:border-purple-300 hover:bg-purple-100 hover:scale-102 hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📚</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    Subplot
                  </span>
                </div>
                <div className="text-sm text-gray-600">30%</div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">Political Intrigue</h3>
              <p className="text-sm text-gray-600 mb-3">Dark Elf noble house politics affecting alliance</p>
              
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">politics</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">betrayal</span>
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

     {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">Start organizing your writing projects today</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $0<span className="text-lg text-gray-500 font-normal">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Upload .docx & .txt files</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Content categorization (4 types)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Basic search & filtering</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Tag-based organization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Visual canvas organization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Cloud storage & sync</span>
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-full hover:bg-gray-200 transition-colors"
              >
                Get Started Free
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] rounded-2xl p-8 shadow-xl text-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                Coming Soon
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">
                $12<span className="text-lg opacity-80 font-normal">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>AI-powered content analysis</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Smart categorization suggestions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Character completeness scoring</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Plot hole detection</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Advanced AI insights</span>
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
                Join Waitlist
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Questions about pricing?</p>
            <button className="text-[#ff4e00] hover:text-[#ff6b35] font-semibold">
              Contact us for more information
            </button>
          </div>
        </div>
      </section>

            {/* Call to Action */}
      <section className="py-16 bg-[#e8ddc1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Tools for organizing your creative inspiration
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            <strong>Organize your writing visually</strong> with tools to help you import, categorize, and connect your content. 
            Your documents become an interactive visual workspace.
          </p>
          
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
                Craft better story ideas using a visual map.
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
