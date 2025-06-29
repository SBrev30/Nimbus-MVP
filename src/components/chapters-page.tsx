import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Clock, 
  TrendingUp, 
  MoreHorizontal, 
  Edit3, 
  Eye,
  X,
  ClipboardList,
  PenTool,
  RotateCcw,
  CheckCircle,
  File
} from 'lucide-react';
import { chapterService, Chapter } from '../services/chapterService';
import { SimpleSearchFilter, useSimpleFilter } from './shared/simple-search-filter';

interface ChapterWithMeta extends Chapter {
  tags?: string[];
  notes?: string;
 }

interface ChaptersPageProps {
  projectId: string;
  projectTitle: string;
  onBack: () => void;
  onSelectChapter?: (chapterId: string) => void;
  onCreateChapter?: () => void;
  onEditChapter?: (chapterId: string) => void;
}

export function ChaptersPage({ 
  projectId, 
  projectTitle, 
  onBack, 
  onSelectChapter, 
  onCreateChapter,
  onEditChapter 
}: ChaptersPageProps) {
  const [chapters, setChapters] = useState<ChapterWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'lastModified' | 'wordCount'>('order');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showNewChapterModal, setShowNewChapterModal] = useState(false);
  const [newChapter, setNewChapter] = useState({
    title: '',
    summary: '',
    status: 'draft' as const
  });

  // Define filter options for chapters
  const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'outline', label: 'Outline' },
    { value: 'draft', label: 'Draft' },
    { value: 'revision', label: 'Revision' },
    { value: 'final', label: 'Final' }
  ];

  // Use the simplified filter hook
  const {
    searchTerm,
    setSearchTerm,
    filterValue: filterStatus,
    setFilterValue: setFilterStatus,
    filteredItems: filteredChapters,
    clearFilters,
    hasActiveFilters
  } = useSimpleFilter(
    chapters,
    (chapter, search) => 
      chapter.title.toLowerCase().includes(search.toLowerCase()) ||
      (chapter.summary || '').toLowerCase().includes(search.toLowerCase()) ||
      (chapter.tags && chapter.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))),
    (chapter, filter) => filter === 'all' || chapter.status === filter
  );

  // Apply sorting to filtered chapters
  const filteredAndSortedChapters = filteredChapters.sort((a, b) => {
    switch (sortBy) {
      case 'order':
        return a.orderIndex - b.orderIndex;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'lastModified':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'wordCount':
        return b.wordCount - a.wordCount;
      default:
        return 0;
    }
  });

  // Fetch chapters from Supabase
  useEffect(() => {
    const fetchChapters = async () => {
      setIsLoading(true);
      try {
        const chaptersData = await chapterService.getProjectChapters(projectId);
        
        // Transform chapters to include additional metadata
        const transformedChapters = chaptersData.map(chapter => ({
          ...chapter,
          tags: [], // We'll implement tags later
          notes: chapter.summary || '' // Using summary as notes for now
        }));
        
        setChapters(transformedChapters);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapters();
  }, [projectId]);

  const handleCreateChapter = async () => {
    try {
      const createdChapter = await chapterService.createChapter({
        projectId,
        title: newChapter.title,
        content: '',
        summary: newChapter.summary,
        wordCount: 0,
        orderIndex: chapters.length + 1,
        status: newChapter.status
      });
      
      if (createdChapter) {
        // Add the new chapter to the list
        setChapters(prev => [
          ...prev,
          {
            ...createdChapter,
            tags: [],
            notes: createdChapter.summary || ''
          }
        ]);
        
        setShowNewChapterModal(false);
        setNewChapter({
          title: '',
          summary: '',
          status: 'draft' as const
        });
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'outline':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'revision':
        return 'bg-orange-100 text-orange-800';
      case 'final':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-4 h-4";
    
    switch (status) {
      case 'outline':
        return <ClipboardList className={iconClass} />;
      case 'draft':
        return <PenTool className={iconClass} />;
      case 'revision':
        return <RotateCcw className={iconClass} />;
      case 'final':
        return <CheckCircle className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
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

  const formatWordCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getProgressPercentage = (wordCount: number) => {
    // For now, we'll use a target of 3000 words per chapter
    const targetWordCount = 3000;
    return Math.min((wordCount / targetWordCount) * 100, 100);
  };

  const totalWords = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const totalTargetWords = chapters.length * 3000; // Assuming 3000 words per chapter
  const overallProgress = Math.round((totalWords / totalTargetWords) * 100);

  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col font-inter">
      {/* Header */}
      <div className="bg-white border-b border-[#C6C5C5] p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2">
                <div className="w-5 h-5 rounded-full border-2 border-[#ff4e00] border-t-transparent animate-spin"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">Loading...</h1>
              </div>
            </div>
          ) : (
            <>
              {/* Back button and title */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#889096]" />
                </button>
                
                <div className="flex-1">
                  <nav className="flex items-center space-x-2 text-sm text-[#889096] font-semibold mb-2">
                    <button onClick={onBack} className="hover:text-gray-700 transition-colors">
                      Projects
                    </button>
                    <span className="text-[#889096]">›</span>
                    <span className="text-gray-900">{projectTitle}</span>
                  </nav>
                  
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Chapters
                  </h1>
                  <p className="text-[#889096] mt-1">
                    {filteredAndSortedChapters.length} chapters • {formatWordCount(totalWords)} / {formatWordCount(totalTargetWords)} words • {overallProgress}% complete
                  </p>
                </div>
                
                <button
                  onClick={() => setShowNewChapterModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 rounded-lg transition-colors font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  New Chapter
                </button>
              </div>

              {/* Simplified Search and Filters */}
              <div className="flex items-center gap-4 mb-4">
                <SimpleSearchFilter
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                  searchPlaceholder="Search chapters..."
                  filterValue={filterStatus}
                  onFilterChange={setFilterStatus}
                  filterOptions={statusFilterOptions}
                  onClear={clearFilters}
                  showClearAll={true}
                  className="flex-1"
                />

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                >
                  <option value="order">Chapter Order</option>
                  <option value="title">Title</option>
                  <option value="lastModified">Last Modified</option>
                  <option value="wordCount">Word Count</option>
                </select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#e8ddc1] text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Grid
                  </button>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="bg-[#e8ddc1] rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Overall Progress</span>
                  <span className="text-gray-600">{formatWordCount(totalWords)} / {formatWordCount(totalTargetWords)} words</span>
                </div>
                <div className="w-full bg-white rounded-full h-3">
                  <div 
                    className="bg-[#ff4e00] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">{overallProgress}% complete</div>
              </div>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#ff4e00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#889096]">Loading chapters...</p>
          </div>
        </div>
      ) : (
        /* Content */
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {filteredAndSortedChapters.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasActiveFilters ? 'No chapters match your filters' : 'No chapters found'}
                  </h3>
                  <p className="text-[#889096] mb-4">
                    {hasActiveFilters ? 'Try adjusting your search or filters' : 'Create your first chapter to start writing'}
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowNewChapterModal(true)}
                      className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 rounded-lg transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      New Chapter
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredAndSortedChapters.map(chapter => (
                  <div
                    key={chapter.id}
                    className="bg-white rounded-lg border border-[#C6C5C5] p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getStatusIcon(chapter.status)}</span>
                            <h3 className="text-lg font-semibold text-gray-900">{chapter.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chapter.status)}`}>
                              {chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-[#889096] text-sm mb-4">{chapter.summary}</p>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-600">
                              {formatWordCount(chapter.wordCount)} / 3,000 words
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#ff4e00] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressPercentage(chapter.wordCount)}%` }}
                            />
                          </div>
                        </div>

                        {/* Tags and Notes */}
                        <div className="space-y-2">
                          {chapter.tags && chapter.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {chapter.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {chapter.notes && (
                            <div className="bg-[#F9FAFB] rounded-lg p-3">
                              <p className="text-sm text-gray-600 italic">{chapter.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 text-xs text-[#889096] mt-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Modified {formatDate(chapter.updatedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{Math.round(getProgressPercentage(chapter.wordCount))}% complete</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => onSelectChapter?.(chapter.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Read Chapter"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => onEditChapter?.(chapter.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Chapter"
                        >
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedChapters.map(chapter => (
                  <div
                    key={chapter.id}
                    className="bg-white rounded-lg border border-[#C6C5C5] p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusIcon(chapter.status)}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chapter.status)}`}>
                          {chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}
                        </span>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{chapter.title}</h3>
                    <p className="text-[#889096] text-sm mb-4 line-clamp-3">{chapter.summary}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-600">
                          {formatWordCount(chapter.wordCount)} / 3,000
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#ff4e00] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(chapter.wordCount)}%` }}
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    {chapter.tags && chapter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {chapter.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {chapter.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{chapter.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-[#889096]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(chapter.updatedAt)}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onSelectChapter?.(chapter.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Read"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onEditChapter?.(chapter.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* New Chapter Modal */}
      {showNewChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Chapter</h2>
              <button
                onClick={() => setShowNewChapterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newChapter.title}
                  onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  placeholder="Enter chapter title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                <textarea
                  value={newChapter.summary}
                  onChange={(e) => setNewChapter({...newChapter, summary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  placeholder="Brief summary of this chapter"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newChapter.status}
                  onChange={(e) => setNewChapter({...newChapter, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                >
                  <option value="outline">Outline</option>
                  <option value="draft">Draft</option>
                  <option value="revision">Revision</option>
                  <option value="final">Final</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNewChapterModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChapter}
                disabled={!newChapter.title}
                className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 rounded-lg transition-colors disabled:opacity-50"
              >
                Create Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
