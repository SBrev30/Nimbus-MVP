import React, { useState, useEffect } from 'react';
import { X, Book, Kanban, TrendingUp, Clock, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { chapterService, Chapter } from '../services/chapterService';

interface WelcomeModalProps {
  onClose: () => void;
  onNavigateToProject: (projectId: string, chapterId?: string) => void;
  onNavigateToKanban: (projectId: string) => void;
}

interface UserProfile {
  full_name: string | null;
}

interface RecentChapter extends Chapter {
  projectTitle?: string;
}

export function WelcomeModal({ onClose, onNavigateToProject, onNavigateToKanban }: WelcomeModalProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentChapter, setRecentChapter] = useState<RecentChapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDataAndProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        setUserProfile(profile);

        const chapters = await chapterService.getAllChapters();
        
        if (chapters && chapters.length > 0) {
          const sortedChapters = [...chapters].sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          const latestChapter = sortedChapters[0];
          
          if (latestChapter.projectId) {
            const { data: project } = await supabase
              .from('projects')
              .select('title')
              .eq('id', latestChapter.projectId)
              .single();
            
            setRecentChapter({
              ...latestChapter,
              projectTitle: project?.title || 'Untitled Project'
            });
          } else {
            setRecentChapter(latestChapter);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndProgress();
  }, []);

  const getProgressPercentage = (wordCount: number) => {
    const targetWordCount = 3000;
    return Math.min((wordCount / targetWordCount) * 100, 100);
  };

  const formatWordCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatDate = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Extract first name from full_name
  const firstName = userProfile?.full_name?.split(' ')[0] || 'Writer';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {getGreeting()}, {firstName}! 👋
            </h2>
            <p className="text-gray-600 text-sm mt-1">Welcome back to Nimbus</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#ff4e00] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentChapter ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Progress</h3>
                
                <div className="bg-[#f2eee2] rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-[#ff4e00]" />
                        <h4 className="text-lg font-semibold text-gray-900">
                          {recentChapter.title}
                        </h4>
                      </div>
                      {recentChapter.projectTitle && (
                        <p className="text-sm text-gray-600 mb-2">
                          Project: {recentChapter.projectTitle}
                        </p>
                      )}
                      {recentChapter.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {recentChapter.summary}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-[#ff4e00] bg-opacity-20 text-[#ff4e00] text-xs font-medium rounded-full">
                      {recentChapter.status.charAt(0).toUpperCase() + recentChapter.status.slice(1)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-600">
                        {formatWordCount(recentChapter.wordCount)} / 3,000 words
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div 
                        className="bg-[#ff4e00] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(recentChapter.wordCount)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Last edited {formatDate(recentChapter.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{Math.round(getProgressPercentage(recentChapter.wordCount))}% complete</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToProject(
                      recentChapter.projectId || 'default-project',
                      recentChapter.id
                    );
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 rounded-lg transition-colors font-medium"
                >
                  <Book className="w-4 h-4" />
                  Continue Writing
                </button>
                
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToKanban(recentChapter.projectId || 'default-project');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Kanban className="w-4 h-4" />
                  View Kanban
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Recent Chapters
              </h3>
              <p className="text-gray-600 mb-6">
                Start writing your first chapter to see your progress here
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 rounded-lg transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
