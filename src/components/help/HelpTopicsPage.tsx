import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { HelpLayout } from './HelpLayout';
import { HelpSearch } from './HelpSearch';

interface HelpTopic {
  id: string;
  question: string;
  answer: string;
  relatedLinks?: Array<{ label: string; view: string }>;
}

interface HelpCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  topics: HelpTopic[];
}

interface HelpTopicsPageProps {
  activeView: string;
  onNavigate?: (view: string) => void;
}

export function HelpTopicsPage({ activeView, onNavigate }: HelpTopicsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['getting-started']));
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      topics: [
        {
          id: 'create-account',
          question: 'How do I create an account?',
          answer: 'To create an account, click the "Sign Up" button on the homepage and follow the prompts. You can sign up with your email or use Google OAuth for quick access.',
          relatedLinks: [{ label: 'Get Started Guide', view: 'get-started' }]
        },
        {
          id: 'first-project',
          question: 'How do I create my first project?',
          answer: 'After logging in, navigate to the Write section and click "Create New Project". Choose your project type (novel, screenplay, etc.) and follow the setup wizard.',
          relatedLinks: [{ label: 'Project Management', view: 'projects' }]
        },
        {
          id: 'import-existing',
          question: 'Can I import my existing work?',
          answer: 'Yes! WritersBlock supports importing from Notion, Microsoft Word, and plain text files. Go to the Import section in your project settings.',
          relatedLinks: [{ label: 'Integration Settings', view: 'integrations' }]
        }
      ]
    },
    {
      id: 'writing-features',
      title: 'Writing Features',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      topics: [
        {
          id: 'focused-writing',
          question: 'How does focused writing mode work?',
          answer: 'Focused writing mode provides a distraction-free environment with minimal formatting options. Access it from the Write section for uninterrupted writing sessions.',
        },
        {
          id: 'auto-save',
          question: 'Does WritersBlock automatically save my work?',
          answer: 'Yes, your work is automatically saved every few seconds while you type. You can also see the last saved timestamp in the editor.',
        },
        {
          id: 'formatting',
          question: 'What formatting options are available?',
          answer: 'WritersBlock includes essential formatting tools: bold, italic, headers, lists, and quotes. The editor focuses on content over complex formatting.',
        }
      ]
    },
    {
      id: 'canvas-features',
      title: 'Visual Canvas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      topics: [
        {
          id: 'canvas-navigation',
          question: 'How do I navigate the infinite canvas?',
          answer: 'Use your mouse to drag and pan around the canvas. Scroll to zoom in/out. Hold Space + drag for quick panning. Use the minimap for overview navigation.',
        },
        {
          id: 'creating-nodes',
          question: 'How do I create and connect nodes?',
          answer: 'Right-click on empty canvas space to create new nodes. Drag from node connection points to create relationships. Double-click nodes to edit content.',
        },
        {
          id: 'ai-nodes',
          question: 'What are AI nodes and how do I use them?',
          answer: 'AI nodes provide context-aware assistance based on nearby story elements. Create an AI node and it will analyze surrounding content to offer relevant suggestions.',
        }
      ]
    },
    {
      id: 'characters',
      title: 'Character Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-6 0v2.25" />
        </svg>
      ),
      topics: [
        {
          id: 'character-creation',
          question: 'How do I create a character?',
          answer: 'Go to Planning > Characters and click "Create New Character". Fill in basic details, then use AI assistance to develop deeper characteristics and backstory.',
          relatedLinks: [{ label: 'Planning Section', view: 'characters' }]
        },
        {
          id: 'character-relationships',
          question: 'How do I map character relationships?',
          answer: 'In the Character panel, use the relationship mapping feature to connect characters. You can also visualize relationships on the infinite canvas.',
        },
        {
          id: 'completeness-score',
          question: 'What is the character completeness score?',
          answer: 'The completeness score indicates how fully developed your character is based on filled profile fields, backstory depth, and relationship connections.',
        }
      ]
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      topics: [
        {
          id: 'ai-credits',
          question: 'How do AI credits work?',
          answer: 'Each AI request uses credits based on complexity. Your subscription includes 250,000 credits monthly. Monitor usage in your account settings.',
          relatedLinks: [{ label: 'Account Settings', view: 'settings' }]
        },
        {
          id: 'ai-presets',
          question: 'What are AI presets?',
          answer: 'AI presets are pre-configured prompts for common tasks like "brainstorm plot points" or "develop character motivation". Access them via the AI assistance panel.',
        },
        {
          id: 'custom-prompts',
          question: 'Can I create custom AI prompts?',
          answer: 'Yes! You can create and save custom prompts tailored to your writing style and needs. Find this option in the AI settings panel.',
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      topics: [
        {
          id: 'slow-performance',
          question: 'Why is the app running slowly?',
          answer: 'Performance issues can occur with very large projects or many open browser tabs. Try closing unused tabs, clearing browser cache, or reducing canvas complexity.',
        },
        {
          id: 'sync-issues',
          question: 'My changes aren\'t syncing properly',
          answer: 'Check your internet connection and refresh the page. If issues persist, your work is saved locally and will sync when connection is restored.',
        },
        {
          id: 'browser-compatibility',
          question: 'Which browsers are supported?',
          answer: 'WritersBlock works best on Chrome, Firefox, Safari, and Edge (latest versions). Some features may be limited on older browsers.',
        }
      ]
    }
  ];

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return helpCategories;
    }

    return helpCategories.map(category => ({
      ...category,
      topics: category.topics.filter(topic =>
        topic.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.topics.length > 0);
  }, [searchQuery]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  return (
    <HelpLayout
      activeView={activeView}
      onNavigate={onNavigate}
      title="Help Topics"
      description="Find answers to common questions and learn how to make the most of WritersBlock"
      showBackButton
    >
      {/* Main Content Container - Full width with proper scrolling */}
      <div className="w-full max-h-screen overflow-y-auto">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          {/* Search Section */}
          <div className="mb-6 sm:mb-8">
            <HelpSearch 
              onSearch={setSearchQuery}
              placeholder="Search help topics..."
              className="max-w-md w-full"
            />
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={() => onNavigate?.('get-started')}
              className="p-3 sm:p-4 border border-[#C6C5C5] rounded-lg hover:border-[#e8ddc1] hover:bg-gray-50 transition-colors text-left group touch-manipulation"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#e8ddc1] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-medium sm:font-semibold text-gray-900 font-inter text-sm sm:text-base">Get Started</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#889096] font-inter">Interactive walkthrough of all features</p>
            </button>

            <button
              onClick={() => onNavigate?.('ask-question')}
              className="p-3 sm:p-4 border border-[#C6C5C5] rounded-lg hover:border-[#e8ddc1] hover:bg-gray-50 transition-colors text-left group touch-manipulation"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#e8ddc1] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium sm:font-semibold text-gray-900 font-inter text-sm sm:text-base">Ask a Question</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#889096] font-inter">Contact our support team directly</p>
            </button>

            <button
              onClick={() => onNavigate?.('get-feedback')}
              className="p-3 sm:p-4 border border-[#C6C5C5] rounded-lg hover:border-[#e8ddc1] hover:bg-gray-50 transition-colors text-left group touch-manipulation"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#e8ddc1] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="font-medium sm:font-semibold text-gray-900 font-inter text-sm sm:text-base">Give Feedback</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#889096] font-inter">Help us improve WritersBlock</p>
            </button>
          </div>

          {/* Help Categories */}
          <div className="space-y-3 sm:space-y-4 pb-6 sm:pb-8">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border border-[#C6C5C5] rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-between touch-manipulation"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="text-[#889096] flex-shrink-0">
                      {category.icon}
                    </div>
                    <h3 className="font-medium sm:font-semibold text-gray-900 font-inter text-left text-sm sm:text-base truncate">{category.title}</h3>
                    <span className="text-xs sm:text-sm text-[#889096] bg-white px-2 py-1 rounded-full flex-shrink-0">
                      {category.topics.length}
                    </span>
                  </div>
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#889096] flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#889096] flex-shrink-0 ml-2" />
                  )}
                </button>

                {expandedCategories.has(category.id) && (
                  <div className="bg-white">
                    {category.topics.map((topic, index) => (
                      <div key={topic.id} className={index > 0 ? "border-t border-[#C6C5C5]" : ""}>
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className="w-full p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-start justify-between text-left touch-manipulation"
                        >
                          <h4 className="font-medium text-gray-900 font-inter pr-3 sm:pr-4 text-sm sm:text-base leading-relaxed flex-1">{topic.question}</h4>
                          {expandedTopics.has(topic.id) ? (
                            <ChevronDown className="w-4 h-4 text-[#889096] flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#889096] flex-shrink-0 mt-0.5" />
                          )}
                        </button>

                        {expandedTopics.has(topic.id) && (
                          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                            <div className="pl-3 sm:pl-4 border-l-2 border-[#e8ddc1]">
                              <p className="text-[#889096] font-inter mb-3 leading-relaxed text-sm sm:text-base">{topic.answer}</p>
                              
                              {topic.relatedLinks && topic.relatedLinks.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 font-inter">Related:</p>
                                  <div className="space-y-1">
                                    {topic.relatedLinks.map((link, linkIndex) => (
                                      <button
                                        key={linkIndex}
                                        onClick={() => onNavigate?.(link.view)}
                                        className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 active:text-blue-900 transition-colors font-inter touch-manipulation p-1 -m-1 rounded"
                                      >
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        <span className="break-words">{link.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && searchQuery && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#889096]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 font-inter">No results found</h3>
              <p className="text-[#889096] font-inter mb-4 text-sm sm:text-base max-w-md mx-auto">
                We couldn't find any help topics matching "<span className="font-medium break-words">{searchQuery}</span>". Try a different search term or browse the categories above.
              </p>
              <button
                onClick={() => onNavigate?.('ask-question')}
                className="inline-flex items-center gap-2 bg-[#e8ddc1] hover:bg-[#e8ddc1]/80 active:bg-[#e8ddc1]/90 px-3 sm:px-4 py-2 rounded-lg transition-colors font-inter font-medium text-sm sm:text-base touch-manipulation"
              >
                Ask a Question Instead
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </HelpLayout>
  );
}
