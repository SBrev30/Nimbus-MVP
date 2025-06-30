import { FileText, Layers, Search, Palette, ArrowRight, Users, Star, CheckCircle, Menu, X, Github, Twitter, Linkedin } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthClick = () => {
    // This would trigger navigation to the AuthPage component
    window.location.href = '/login';
  };

  return (
    <div className=\"min-h-screen bg-white\">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex justify-between items-center py-4\">
            <div className=\"flex items-center space-x-2\">
              <div className=\"w-8 h-8 bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] rounded-lg flex items-center justify-center\">
                <FileText className=\"w-5 h-5 text-white\" />
              </div>
              <span className=\"text-xl font-bold text-gray-900\">Nimbus Note</span>
            </div>

            {/* Desktop Navigation */}
            <nav className=\"hidden md:flex items-center space-x-8\">
              <a href=\"#features\" className=\"text-gray-600 hover:text-gray-900 transition-colors\">Features</a>
              <a href=\"#how-it-works\" className=\"text-gray-600 hover:text-gray-900 transition-colors\">How it Works</a>
              <a href=\"#testimonials\" className=\"text-gray-600 hover:text-gray-900 transition-colors\">Reviews</a>
              <a href=\"#pricing\" className=\"text-gray-600 hover:text-gray-900 transition-colors\">Pricing</a>
            </nav>

            {/* Desktop CTA */}
            <div className=\"hidden md:flex items-center space-x-4\">
              <button 
                onClick={handleAuthClick}
                className=\"text-gray-600 hover:text-gray-900 transition-colors\"
              >
                Sign In
              </button>
              <button 
                onClick={handleAuthClick}
                className=\"bg-[#ff4e00] text-white px-6 py-2 rounded-full hover:bg-[#ff4e00]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5\"
              >
                Try Nimbus Note
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className=\"md:hidden p-2\"
            >
              {isMenuOpen ? <X className=\"w-6 h-6\" /> : <Menu className=\"w-6 h-6\" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className=\"md:hidden bg-white border-t py-4\">
              <nav className=\"flex flex-col space-y-4\">
                <a href=\"#features\" className=\"text-gray-600 hover:text-gray-900 transition-colors\">Features</a>
                <a href=\"#how-it-works\" className=\"text-gray-600 hover:text-gray-900 transition-colors\">How it Works</a>
                <a href=\"#testimonials\" className=\"text-gray-600 hover:text-gray-900 transition-colors\">Reviews</a>
                <a href=\"#pricing\" className=\"text-gray-600 hover:text-gray-900 transition-colors\">Pricing</a>
                <div className=\"flex flex-col space-y-2 pt-4 border-t\">
                  <button 
                    onClick={handleAuthClick}
                    className=\"text-left text-gray-600 hover:text-gray-900 transition-colors\"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleAuthClick}
                    className=\"bg-[#ff4e00] text-white px-6 py-2 rounded-full hover:bg-[#ff4e00]/90 transition-colors\"
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
      <section className=\"pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"grid lg:grid-cols-2 gap-12 items-center\">
            <div className=\"text-center lg:text-left\">
              <h1 className=\"text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6\">
                Visual Writing
                <span className=\"bg-gradient-to-r from-[#ff4e00] to-[#ff6b35] bg-clip-text text-transparent\">
                  {\" \"}Assistant
                </span>
              </h1>
              <p className=\"text-xl text-gray-600 mb-8 leading-relaxed\">
                Organize your creative content with visual thinking. Import files, categorize ideas, and map your story on an infinite canvas designed for writers.
              </p>
              <div className=\"flex flex-col sm:flex-row gap-4 justify-center lg:justify-start\">
                <button 
                  onClick={handleAuthClick}
                  className=\"bg-[#ff4e00] text-white px-8 py-4 rounded-full hover:bg-[#ff4e00]/90 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center group\"
                >
                  Try Nimbus Note
                  <ArrowRight className=\"ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform\" />
                </button>
                <button 
                  onClick={handleAuthClick}
                  className=\"border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-gray-400 transition-colors\"
                >
                  Sign In
                </button>
              </div>
              <div className=\"mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500\">
                <div className=\"flex items-center\">
                  <CheckCircle className=\"w-4 h-4 mr-2 text-green-500\" />
                  Free to start
                </div>
                <div className=\"flex items-center\">
                  <CheckCircle className=\"w-4 h-4 mr-2 text-green-500\" />
                  No credit card required
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className=\"relative\">
              <div className=\"bg-gradient-to-br from-[#f2eee2] to-white rounded-2xl p-8 shadow-2xl\">
                <div className=\"space-y-4\">
                  <div className=\"bg-white rounded-lg p-4 shadow-sm border border-gray-100\">
                    <div className=\"flex items-center space-x-3\">
                      <div className=\"w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center\">
                        <FileText className=\"w-4 h-4 text-blue-600\" />
                      </div>
                      <div>
                        <div className=\"font-medium text-gray-900\">Chapter 1</div>
                        <div className=\"text-sm text-gray-500\">2,341 words</div>
                      </div>
                    </div>
                  </div>
                  <div className=\"bg-white rounded-lg p-4 shadow-sm border border-gray-100\">
                    <div className=\"flex items-center space-x-3\">
                      <div className=\"w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center\">
                        <Users className=\"w-4 h-4 text-green-600\" />
                      </div>
                      <div>
                        <div className=\"font-medium text-gray-900\">Main Character</div>
                        <div className=\"text-sm text-gray-500\">Sarah Chen</div>
                      </div>
                    </div>
                  </div>
                  <div className=\"bg-white rounded-lg p-4 shadow-sm border border-gray-100\">
                    <div className=\"flex items-center space-x-3\">
                      <div className=\"w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center\">
                        <Layers className=\"w-4 h-4 text-purple-600\" />
                      </div>
                      <div>
                        <div className=\"font-medium text-gray-900\">Plot Outline</div>
                        <div className=\"text-sm text-gray-500\">Act 1 - Setup</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className=\"absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] rounded-full opacity-20 animate-pulse\"></div>
              <div className=\"absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20 animate-pulse\" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id=\"features\" className=\"py-20 bg-white\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"text-center mb-16\">
            <h2 className=\"text-4xl font-bold text-gray-900 mb-4\">
              Everything you need to organize your writing
            </h2>
            <p className=\"text-xl text-gray-600 max-w-3xl mx-auto\">
              Nimbus Note combines traditional writing tools with visual organization to help you see the big picture of your creative projects.
            </p>
          </div>

          <div className=\"grid md:grid-cols-2 lg:grid-cols-4 gap-8\">
            <div className=\"text-center group\">
              <div className=\"w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200\">
                <FileText className=\"w-8 h-8 text-white\" />
              </div>
              <h3 className=\"text-xl font-semibold text-gray-900 mb-2\">Smart Import</h3>
              <p className=\"text-gray-600\">
                Upload .docx and .txt files with automatic content extraction and intelligent categorization.
              </p>
            </div>

            <div className=\"text-center group\">
              <div className=\"w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200\">
                <Layers className=\"w-8 h-8 text-white\" />
              </div>
              <h3 className=\"text-xl font-semibold text-gray-900 mb-2\">Visual Canvas</h3>
              <p className=\"text-gray-600\">
                Organize your content on an infinite canvas. Create connections between characters, plots, and chapters.
              </p>
            </div>

            <div className=\"text-center group\">
              <div className=\"w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200\">
                <Search className=\"w-8 h-8 text-white\" />
              </div>
              <h3 className=\"text-xl font-semibold text-gray-900 mb-2\">Smart Library</h3>
              <p className=\"text-gray-600\">
                Powerful search and filtering across all content. Find any character, plot point, or research note instantly.
              </p>
            </div>

            <div className=\"text-center group\">
              <div className=\"w-16 h-16 bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200\">
                <Palette className=\"w-8 h-8 text-white\" />
              </div>
              <h3 className=\"text-xl font-semibold text-gray-900 mb-2\">Content Types</h3>
              <p className=\"text-gray-600\">
                Organize with 4 content types: Characters, Plot Outlines, Research, and Chapters with smart tagging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id=\"how-it-works\" className=\"py-20 bg-gray-50\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"text-center mb-16\">
            <h2 className=\"text-4xl font-bold text-gray-900 mb-4\">Simple workflow, powerful results</h2>
            <p className=\"text-xl text-gray-600 max-w-3xl mx-auto\">
              Transform your scattered notes and documents into a visual masterpiece in three simple steps.
            </p>
          </div>

          <div className=\"grid lg:grid-cols-3 gap-12\">
            <div className=\"text-center\">
              <div className=\"w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6\">
                <span className=\"text-2xl font-bold text-white\">1</span>
              </div>
              <h3 className=\"text-2xl font-semibold text-gray-900 mb-4\">Import & Categorize</h3>
              <p className=\"text-gray-600 leading-relaxed\">
                Upload your existing documents and watch as Nimbus Note extracts content and helps you categorize it into Characters, Plots, Research, and Chapters.
              </p>
            </div>

            <div className=\"text-center\">
              <div className=\"w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6\">
                <span className=\"text-2xl font-bold text-white\">2</span>
              </div>
              <h3 className=\"text-2xl font-semibold text-gray-900 mb-4\">Organize Visually</h3>
              <p className=\"text-gray-600 leading-relaxed\">
                Drag your content onto the visual canvas to see relationships between elements. Create connections that make sense to your creative process.
              </p>
            </div>

            <div className=\"text-center\">
              <div className=\"w-20 h-20 bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-6\">
                <span className=\"text-2xl font-bold text-white\">3</span>
              </div>
              <h3 className=\"text-2xl font-semibold text-gray-900 mb-4\">Write & Refine</h3>
              <p className=\"text-gray-600 leading-relaxed\">
                Use the integrated editor to write new content while keeping your visual map as reference. Everything syncs in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id=\"testimonials\" className=\"py-20 bg-white\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"text-center mb-16\">
            <h2 className=\"text-4xl font-bold text-gray-900 mb-4\">Loved by writers everywhere</h2>
            <p className=\"text-xl text-gray-600\">See what writers are saying about Nimbus Note</p>
          </div>

          <div className=\"grid md:grid-cols-3 gap-8\">
            <div className=\"bg-gray-50 rounded-2xl p-8\">
              <div className=\"flex items-center mb-4\">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className=\"w-5 h-5 text-yellow-400 fill-current\" />
                ))}
              </div>
              <blockquote className=\"text-gray-700 mb-6 leading-relaxed\">
                \"Finally, a tool that understands how writers actually think. The visual canvas changed how I approach my novels.\"
              </blockquote>
              <div className=\"flex items-center\">
                <div className=\"w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center\">
                  <span className=\"text-white font-semibold\">MR</span>
                </div>
                <div className=\"ml-4\">
                  <div className=\"font-semibold text-gray-900\">Maria Rodriguez</div>
                  <div className=\"text-gray-600\">Fantasy Author</div>
                </div>
              </div>
            </div>

            <div className=\"bg-gray-50 rounded-2xl p-8\">
              <div className=\"flex items-center mb-4\">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className=\"w-5 h-5 text-yellow-400 fill-current\" />
                ))}
              </div>
              <blockquote className=\"text-gray-700 mb-6 leading-relaxed\">
                \"The import feature saved me hours of manual organization. My scattered research is finally manageable.\"
              </blockquote>
              <div className=\"flex items-center\">
                <div className=\"w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center\">
                  <span className=\"text-white font-semibold\">DJ</span>
                </div>
                <div className=\"ml-4\">
                  <div className=\"font-semibold text-gray-900\">David Johnson</div>
                  <div className=\"text-gray-600\">Historical Fiction Writer</div>
                </div>
              </div>
            </div>

            <div className=\"bg-gray-50 rounded-2xl p-8\">
              <div className=\"flex items-center mb-4\">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className=\"w-5 h-5 text-yellow-400 fill-current\" />
                ))}
              </div>
              <blockquote className=\"text-gray-700 mb-6 leading-relaxed\">
                \"The visual connections help me spot plot holes before they become problems. Invaluable for complex narratives.\"
              </blockquote>
              <div className=\"flex items-center\">
                <div className=\"w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center\">
                  <span className=\"text-white font-semibold\">SK</span>
                </div>
                <div className=\"ml-4\">
                  <div className=\"font-semibold text-gray-900\">Sarah Kim</div>
                  <div className=\"text-gray-600\">Thriller Author</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id=\"pricing\" className=\"py-20 bg-gray-50\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"text-center mb-16\">
            <h2 className=\"text-4xl font-bold text-gray-900 mb-4\">Simple, transparent pricing</h2>
            <p className=\"text-xl text-gray-600\">Start free, upgrade when you're ready to scale</p>
          </div>

          <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto\">
            <div className=\"bg-white rounded-2xl p-8 shadow-lg border border-gray-100\">
              <h3 className=\"text-2xl font-bold text-gray-900 mb-2\">Free</h3>
              <div className=\"text-4xl font-bold text-gray-900 mb-6\">
                $0<span className=\"text-lg text-gray-500 font-normal\">/month</span>
              </div>
              <ul className=\"space-y-4 mb-8\">
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-green-500 mr-3\" />
                  <span className=\"text-gray-700\">Up to 100 content items</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-green-500 mr-3\" />
                  <span className=\"text-gray-700\">Basic visual canvas</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-green-500 mr-3\" />
                  <span className=\"text-gray-700\">File import (.docx, .txt)</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-green-500 mr-3\" />
                  <span className=\"text-gray-700\">Basic search & filtering</span>
                </li>
              </ul>
              <button 
                onClick={handleAuthClick}
                className=\"w-full bg-gray-100 text-gray-700 py-3 rounded-full hover:bg-gray-200 transition-colors\"
              >
                Get Started
              </button>
            </div>

            <div className=\"bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] rounded-2xl p-8 shadow-xl text-white relative\">
              <div className=\"absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold\">
                Most Popular
              </div>
              <h3 className=\"text-2xl font-bold mb-2\">Pro</h3>
              <div className=\"text-4xl font-bold mb-6\">
                $12<span className=\"text-lg opacity-80 font-normal\">/month</span>
              </div>
              <ul className=\"space-y-4 mb-8\">
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-white mr-3\" />
                  <span>Unlimited content items</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-white mr-3\" />
                  <span>Advanced visual canvas</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-white mr-3\" />
                  <span>AI-powered organization</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-white mr-3\" />
                  <span>Advanced search & insights</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-white mr-3\" />
                  <span>Export to multiple formats</span>
                </li>
              </ul>
              <button 
                onClick={handleAuthClick}
                className=\"w-full bg-white text-[#ff4e00] py-3 rounded-full hover:bg-gray-50 transition-colors font-semibold\"
              >
                Start Free Trial
              </button>
            </div>

            <div className=\"bg-white rounded-2xl p-8 shadow-lg border border-gray-100\">
              <h3 className=\"text-2xl font-bold text-gray-900 mb-2\">Team</h3>
              <div className=\"text-4xl font-bold text-gray-900 mb-6\">
                $29<span className=\"text-lg text-gray-500 font-normal\">/month</span>
              </div>
              <ul className=\"space-y-4 mb-8\">
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-green-500 mr-3\" />
                  <span className=\"text-gray-700\">Everything in Pro</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-green-500 mr-3\" />
                  <span className=\"text-gray-700\">Real-time collaboration</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-green-500 mr-3\" />
                  <span className=\"text-gray-700\">Shared workspaces</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-green-500 mr-3\" />
                  <span className=\"text-gray-700\">Advanced permissions</span>
                </li>
                <li className=\"flex items-center\">
                  <CheckCircle className=\"w-5 h-5 text-green-500 mr-3\" />
                  <span className=\"text-gray-700\">Priority support</span>
                </li>
              </ul>
              <button 
                onClick={handleAuthClick}
                className=\"w-full bg-gray-100 text-gray-700 py-3 rounded-full hover:bg-gray-200 transition-colors\"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className=\"py-20 bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] text-white\">
        <div className=\"max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8\">
          <h2 className=\"text-4xl lg:text-5xl font-bold mb-6\">
            Ready to transform your writing process?
          </h2>
          <p className=\"text-xl mb-8 opacity-90\">
            Join thousands of writers who've discovered the power of visual organization. Start your journey today.
          </p>
          <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">
            <button 
              onClick={handleAuthClick}
              className=\"bg-white text-[#ff4e00] px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center group font-semibold\"
            >
              Try Nimbus Note Free
              <ArrowRight className=\"ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform\" />
            </button>
            <button 
              onClick={handleAuthClick}
              className=\"border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-[#ff4e00] transition-colors\"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className=\"bg-black text-white py-16\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"grid md:grid-cols-4 gap-8\">
            <div className=\"col-span-2 md:col-span-1\">
              <div className=\"flex items-center space-x-2 mb-4\">
                <div className=\"w-8 h-8 bg-gradient-to-br from-[#ff4e00] to-[#ff6b35] rounded-lg flex items-center justify-center\">
                  <FileText className=\"w-5 h-5 text-white\" />
                </div>
                <span className=\"text-xl font-bold\">Nimbus Note</span>
              </div>
              <p className=\"text-gray-400 mb-6\">
                The visual writing assistant that helps you organize your creative process and bring your stories to life.
              </p>
              <div className=\"flex space-x-4\">
                <a href=\"#\" className=\"text-gray-400 hover:text-white transition-colors\">
                  <Twitter className=\"w-5 h-5\" />
                </a>
                <a href=\"#\" className=\"text-gray-400 hover:text-white transition-colors\">
                  <Github className=\"w-5 h-5\" />
                </a>
                <a href=\"#\" className=\"text-gray-400 hover:text-white transition-colors\">
                  <Linkedin className=\"w-5 h-5\" />
                </a>
              </div>
            </div>

            <div>
              <h3 className=\"font-semibold mb-4\">Product</h3>
              <ul className=\"space-y-2\">
                <li><a href=\"#features\" className=\"text-gray-400 hover:text-white transition-colors\">Features</a></li>
                <li><a href=\"#pricing\" className=\"text-gray-400 hover:text-white transition-colors\">Pricing</a></li>
                <li><a href=\"#\" className=\"text-gray-400 hover:text-white transition-colors\">Changelog</a></li>
                <li><a href=\"#\" className=\"text-gray-400 hover:text-white transition-colors\">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h3 className=\"font-`
}
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
    </div>
  );
};
