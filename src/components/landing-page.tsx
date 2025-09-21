import React, { useState } from 'react';
import { 
  ArrowRight, 
  FileText, 
  Users, 
  Layers, 
  Search,
  Upload,
  Zap,
  BookOpen,
  Star,
  Check,
  Menu,
  X
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2eee2] to-[#e8ddc1]">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <svg 
                version="1.1" 
                viewBox="0 0 107.5 112.6" 
                className="w-8 h-8 text-gray-800"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="currentColor" d="M61.8,69.1c-4-3.4-9.2-8-14.7-12.9l0,0C33.8,44.4,18.9,31.5,18.6,31c-0.6-0.7-1.6-0.6-1.8-0.6c-0.1,0,0,0,0,0H4.5
                c-1.2,0-2.2,1-2.2,2.2v48c0,1.2,1,2.2,2.2,2.2h9.7c0.1,0,0.3,0,0.3-0.3V45.4l0,0l0,0l0,0l0,0c0-0.6,0.6-1,1.2-1s0.4,0,0.6,0.1l0,0
                l0,0c0,0,0,0,0.1,0l21.8,18.9l0,0l4,3.4l0,0l13.8,12l3.1,2.7l0,0c1.6,1.9,2.5,4.3,2.5,7c0,6.4-5.5,11.6-12.2,11.6
                s-12.2-5.2-12.2-11.6s1.5-6.2,3.9-8.3s0-0.3,0-0.4l-8.3-7.1c0,0-0.3,0-0.4,0c-4.3,4.2-6.8,9.8-6.8,15.9c0,12.6,10.7,22.7,24.1,22.7
                S73.7,101,73.7,88.5s-4.3-13.1-4.6-13.4s0,0,0,0c-0.1-0.1-3-2.7-7.1-6.2L61.8,69.1z"/>
                <path fill="currentColor" d="M45.8,44c4,3.4,9.2,8,14.7,12.9l0,0C73.9,68.6,88.7,81.6,89,82c0.6,0.7,1.8,0.6,1.8,0.6h2.1h1.3h8.9c1.2,0,2.2-1,2.2-2.2
                v-48c0-1.2-1-2.2-2.2-2.2h-10v37.4l0,0l0,0l0,0l0,0c0,0.6-0.6,1-1.2,1s-0.4,0-0.6-0.1l0,0l0,0c0,0,0,0-0.1,0L69.4,49.6l0,0l-4-3.4
                l0,0l-13.8-12l-3.1-2.7c-1.6-1.9-2.5-4.3-2.5-7c0-6.4,5.5-11.6,12.2-11.6c6.7,0,12.2,5.2,12.2,11.6s-1.6,6.5-4,8.6l8.8,7.6
                c4.3-4.2,7-9.8,7-16.2C82,11.9,71.4,1.8,58,1.8S33.9,12.1,33.9,24.5s4.6,13.4,4.6,13.4s2.8,2.5,7.1,6.2L45.8,44z"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">Nimbus Note</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <button
                onClick={onGetStarted}
                className="bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                <button
                  onClick={onGetStarted}
                  className="bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white px-6 py-2 rounded-lg font-medium transition-colors text-center"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Visual Writing Platform for
              <span className="text-[#ff4e00] block">Creative Storytellers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform scattered writing materials into organized, visual workspaces. Import existing content, 
              categorize intelligently, and organize visually using our simple canvas system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Writing Today
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
              <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Organize Your Story
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From scattered documents to organized visual workspace
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Interactive Story Canvas */}
            <div className="order-2 lg:order-1">
              <div className="bg-gray-100 rounded-xl p-8 shadow-lg">
                {/* Canvas Mockup */}
                <div className="bg-white rounded-lg p-6 min-h-[300px] relative overflow-hidden">
                  {/* Canvas Background Grid */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                  
                  {/* Character Node */}
                  <div className="absolute top-8 left-8 bg-[#A5F7AC] border-2 border-green-500 rounded-lg p-3 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-green-700" />
                      <span className="text-sm font-semibold text-green-900">Elena Rodriguez</span>
                    </div>
                    <div className="text-xs text-green-800">Protagonist • Detective</div>
                    <div className="text-xs text-green-700 mt-1">Sharp-witted investigator</div>
                  </div>

                  {/* Plot Node */}
                  <div className="absolute top-20 right-8 bg-[#FEE2E2] border-2 border-red-400 rounded-lg p-3 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-red-700" />
                      <span className="text-sm font-semibold text-red-900">The Mystery</span>
                    </div>
                    <div className="text-xs text-red-800">Main Plot • Chapter 1</div>
                    <div className="text-xs text-red-700 mt-1">Lighthouse disappearance</div>
                  </div>

                  {/* Research Node */}
                  <div className="absolute bottom-8 left-12 bg-[#E0E7FF] border-2 border-indigo-400 rounded-lg p-3 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-indigo-700" />
                      <span className="text-sm font-semibold text-indigo-900">Maritime History</span>
                    </div>
                    <div className="text-xs text-indigo-800">Research • Background</div>
                    <div className="text-xs text-indigo-700 mt-1">Lighthouse operations</div>
                  </div>

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 pointer-events-none">
                    <path 
                      d="M 120 60 Q 200 100 280 80" 
                      stroke="#6366F1" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                    <path 
                      d="M 80 120 Q 150 180 200 220" 
                      stroke="#10B981" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>

                  {/* Mini Controls */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <div className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center shadow-sm">
                      <span className="text-xs">+</span>
                    </div>
                    <div className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center shadow-sm">
                      <span className="text-xs">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#ff4e00] rounded-full flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Interactive Story Canvas</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Visualize your story elements on an infinite canvas. Create characters, plot points, and locations 
                as interactive nodes. Connect related elements to see relationships and story flow.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Drag-and-drop story elements</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Visual relationship mapping</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Infinite canvas workspace</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Document Import Feature */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#ff4e00] rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Smart Document Import</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Import your existing Word documents and text files with intelligent categorization. 
                Our system automatically suggests whether content is character profiles, plot outlines, research, or chapters.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Support for .docx and .txt files</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Automatic content categorization</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Batch file processing</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="bg-gray-100 rounded-xl p-8 shadow-lg">
                {/* Import Wizard Mockup */}
                <div className="bg-white rounded-lg p-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drop files here or click to browse</p>
                    <p className="text-sm text-gray-500">Supports .docx and .txt files</p>
                  </div>
                  
                  {/* File Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-sm">Character_Elena.docx</span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Character</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-sm">Plot_Outline.txt</span>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Plot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Library Management Feature */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
            <div className="order-2 lg:order-1">
              <div className="bg-gray-100 rounded-xl p-8 shadow-lg">
                {/* Library Interface Mockup */}
                <div className="bg-white rounded-lg p-6">
                  {/* Search Bar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search titles, content, or tags..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                    <button className="px-4 py-2 bg-[#ff4e00] text-white rounded-lg text-sm">
                      Import Content
                    </button>
                  </div>

                  {/* Content Type Filters */}
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">All Items (12)</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Characters (4)</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Plot (3)</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Research (5)</span>
                  </div>

                  {/* Content Cards */}
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 border border-blue-200 rounded-lg">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Detective Elena Rodriguez</h4>
                            <p className="text-sm text-gray-600">1,247 words • Character</p>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                          Add to Canvas
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 border border-purple-200 rounded-lg">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Lighthouse Mystery Plot</h4>
                            <p className="text-sm text-gray-600">892 words • Plot</p>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                          Add to Canvas
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#ff4e00] rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Library Management</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Centralized content library with powerful search and filtering. Find any piece of content instantly 
                by title, content, or tags. Organize with custom categories and add items to your canvas with one click.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Full-text search across all content</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Filter by content type and tags</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">One-click canvas integration</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Visual Canvas Feature */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#ff4e00] rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Visual Story Mapping</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Transform your imported content into visual story maps. Drag and drop elements to explore 
                relationships, create connections between characters and plot points, and see your story structure at a glance.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Drag-and-drop organization</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Visual relationship mapping</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Real-time synchronization</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="bg-gray-100 rounded-xl p-8 shadow-lg">
                {/* Canvas with Connections Mockup */}
                <div className="bg-white rounded-lg p-6 min-h-[300px] relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="1" fill="#000"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#dots)" />
                    </svg>
                  </div>

                  {/* Connected Nodes */}
                  <div className="absolute top-6 left-6 bg-[#A5F7AC] border-2 border-green-500 rounded-lg p-2 shadow-sm">
                    <div className="text-xs font-semibold text-green-900">Sarah Chen</div>
                    <div className="text-xs text-green-700">Detective</div>
                  </div>

                  <div className="absolute top-6 right-6 bg-[#FEE2E2] border-2 border-red-400 rounded-lg p-2 shadow-sm">
                    <div className="text-xs font-semibold text-red-900">Marcus Blackwood</div>
                    <div className="text-xs text-red-700">Lighthouse Keeper</div>
                  </div>

                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#E0E7FF] border-2 border-indigo-400 rounded-lg p-2 shadow-sm">
                    <div className="text-xs font-semibold text-indigo-900">Beacon Point</div>
                    <div className="text-xs text-indigo-700">Lighthouse</div>
                  </div>

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 pointer-events-none">
                    <path 
                      d="M 80 40 L 240 40" 
                      stroke="#EF4444" 
                      strokeWidth="2" 
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    <path 
                      d="M 60 60 L 180 180" 
                      stroke="#3B82F6" 
                      strokeWidth="2" 
                      fill="none"
                      strokeDasharray="3,3"
                    />
                    <path 
                      d="M 260 60 L 200 180" 
                      stroke="#10B981" 
                      strokeWidth="2" 
                      fill="none"
                      strokeDasharray="3,3"
                    />
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                       refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#EF4444" />
                      </marker>
                    </defs>
                  </svg>

                  {/* Connection Labels */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs text-red-600 bg-white px-2 py-1 rounded shadow-sm">
                    investigates
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#f2eee2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              From Scattered Files to Organized Story
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple workflow to transform your existing writing materials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff4e00] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Import Your Files</h3>
              <p className="text-gray-600">
                Upload your existing Word documents, text files, and notes. Our system processes and categorizes them automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff4e00] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Organize & Tag</h3>
              <p className="text-gray-600">
                Review suggested categories, add custom tags, and organize your content in the centralized library.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff4e00] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Visualize & Connect</h3>
              <p className="text-gray-600">
                Add content to your visual canvas, create connections between elements, and see your story structure come to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Writers Everywhere
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Finally, a tool that understands how visual thinkers work. The canvas feature transformed how I plan my novels."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  S
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Mitchell</div>
                  <div className="text-sm text-gray-600">Fantasy Author</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The import feature saved me hours of manual organization. All my scattered notes are now beautifully organized."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Marcus Chen</div>
                  <div className="text-sm text-gray-600">Sci-Fi Writer</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The visual connections between characters and plot points helped me spot plot holes I never noticed before."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Alex Rivera</div>
                  <div className="text-sm text-gray-600">Mystery Author</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#f2eee2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Import up to 50 documents</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Unlimited canvas nodes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Basic search and filtering</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Cloud synchronization</span>
                </li>
              </ul>
              
              <button
                onClick={onGetStarted}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#ff4e00] relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#ff4e00] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$10</div>
                <p className="text-gray-600">per month</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Unlimited document imports</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Advanced search with AI</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Export to multiple formats</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Collaboration features</span>
                </li>
              </ul>
              
              <button
                onClick={onGetStarted}
                className="w-full bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Start Pro Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Writing Process?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of writers who have organized their creative process with Nimbus Note
          </p>
          <button
            onClick={onGetStarted}
            className="bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Your Free Account
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <svg 
                  version="1.1" 
                  viewBox="0 0 107.5 112.6" 
                  className="w-8 h-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="currentColor" d="M61.8,69.1c-4-3.4-9.2-8-14.7-12.9l0,0C33.8,44.4,18.9,31.5,18.6,31c-0.6-0.7-1.6-0.6-1.8-0.6c-0.1,0,0,0,0,0H4.5
                  c-1.2,0-2.2,1-2.2,2.2v48c0,1.2,1,2.2,2.2,2.2h9.7c0.1,0,0.3,0,0.3-0.3V45.4l0,0l0,0l0,0l0,0c0-0.6,0.6-1,1.2-1s0.4,0,0.6,0.1l0,0
                  l0,0c0,0,0,0,0.1,0l21.8,18.9l0,0l4,3.4l0,0l13.8,12l3.1,2.7l0,0c1.6,1.9,2.5,4.3,2.5,7c0,6.4-5.5,11.6-12.2,11.6
                  s-12.2-5.2-12.2-11.6s1.5-6.2,3.9-8.3s0-0.3,0-0.4l-8.3-7.1c0,0-0.3,0-0.4,0c-4.3,4.2-6.8,9.8-6.8,15.9c0,12.6,10.7,22.7,24.1,22.7
                  S73.7,101,73.7,88.5s-4.3-13.1-4.6-13.4s0,0,0,0c-0.1-0.1-3-2.7-7.1-6.2L61.8,69.1z"/>
                  <path fill="currentColor" d="M45.8,44c4,3.4,9.2,8,14.7,12.9l0,0C73.9,68.6,88.7,81.6,89,82c0.6,0.7,1.8,0.6,1.8,0.6h2.1h1.3h8.9c1.2,0,2.2-1,2.2-2.2
                  v-48c0-1.2-1-2.2-2.2-2.2h-10v37.4l0,0l0,0l0,0l0,0c0,0.6-0.6,1-1.2,1s-0.4,0-0.6-0.1l0,0l0,0c0,0,0,0-0.1,0L69.4,49.6l0,0l-4-3.4
                  l0,0l-13.8-12l-3.1-2.7c-1.6-1.9-2.5-4.3-2.5-7c0-6.4,5.5-11.6,12.2-11.6c6.7,0,12.2,5.2,12.2,11.6s-1.6,6.5-4,8.6l8.8,7.6
                  c4.3-4.2,7-9.8,7-16.2C82,11.9,71.4,1.8,58,1.8S33.9,12.1,33.9,24.5s4.6,13.4,4.6,13.4s2.8,2.5,7.1,6.2L45.8,44z"/>
                </svg>
                <span className="text-xl font-bold">Nimbus Note</span>
              </div>
              <p className="text-gray-400 mb-4">
                Visual writing platform for creative storytellers. Transform scattered materials into organized, visual workspaces.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Nimbus Note. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}