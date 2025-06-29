import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Type, 
  FileText,
  RotateCcw,
  RotateCw,
  Check,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { EditorContent } from '../types';
import { useWordCount, useUndo, useKeyboard } from '../hooks/useUtilities';
import { useUnifiedAutoSave } from '../hooks/useUnifiedAutoSave';
import { SimpleSearchFilter, useSimpleFilter } from './shared/simple-search-filter';

interface EditorProps {
  content: EditorContent;
  onChange: (content: EditorContent) => void;
  selectedChapter?: { id: string; title: string; number: number } | null;
  isLoading?: boolean;
  className?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Person' | 'Place' | 'Plot' | 'Misc';
  createdAt: Date;
  updatedAt: Date;
}

const FONT_OPTIONS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Courier New', value: '"Courier New", monospace' }
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];

const ALIGNMENT_OPTIONS = [
  { icon: AlignLeft, value: 'left' },
  { icon: AlignCenter, value: 'center' },
  { icon: AlignRight, value: 'right' }
];

// Auto-save notification component
const AutoSaveNotification = ({ 
  isSaving, 
  saveError, 
  lastSaved, 
  hasUnsavedChanges 
}: { 
  isSaving: boolean; 
  saveError: string | null; 
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'saving' | 'saved' | 'error'>('saving');

  useEffect(() => {
    if (isSaving) {
      setNotificationType('saving');
      setShowNotification(true);
    } else if (saveError) {
      setNotificationType('error');
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    } else if (lastSaved && !hasUnsavedChanges) {
      setNotificationType('saved');
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, saveError, lastSaved, hasUnsavedChanges]);

  if (!showNotification) return null;

  return (
    <div className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50
      px-4 py-2 rounded-lg shadow-lg border backdrop-blur-sm
      transition-all duration-300 ease-in-out
      ${notificationType === 'saving' 
        ? 'bg-blue-50/90 border-blue-200 text-blue-800' 
        : notificationType === 'saved'
        ? 'bg-green-50/90 border-green-200 text-green-800'
        : 'bg-red-50/90 border-red-200 text-red-800'
      }
    `}>
      <div className="flex items-center space-x-2 text-sm font-medium">
        {notificationType === 'saving' && (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Saving changes...</span>
          </>
        )}
        {notificationType === 'saved' && (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span>All changes saved</span>
          </>
        )}
        {notificationType === 'error' && (
          <>
            <Cloud className="w-4 h-4 text-red-600" />
            <span>Save failed - changes stored locally</span>
          </>
        )}
      </div>
    </div>
  );
};

// Notes Panel Component
const NotesPanel = ({ 
  notes, 
  onAddNote, 
  onEditNote, 
  onDeleteNote,
  isCollapsed,
  onToggleCollapse 
}: {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Note['category']>('all');

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`fixed right-0 top-0 h-full bg-white border-l border-[#C6C5C5] transition-transform duration-300 ease-in-out z-40 ${
      isCollapsed ? 'translate-x-full' : 'translate-x-0'
    }`} style={{ width: '320px' }}>
      <div className="h-full flex flex-col">
        {/* Notes Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#889096]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Categories</option>
            <option value="Person">Person</option>
            <option value="Place">Place</option>
            <option value="Plot">Plot</option>
            <option value="Misc">Misc</option>
          </select>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <div
                  key={note.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{note.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      note.category === 'Person' ? 'bg-blue-100 text-blue-800' :
                      note.category === 'Place' ? 'bg-green-100 text-green-800' :
                      note.category === 'Plot' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {note.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {note.updatedAt.toLocaleDateString()}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEditNote(note.id, note)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No notes found</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Note Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => onAddNote({
              title: 'New Note',
              content: '',
              category: 'Misc'
            })}
            className="w-full px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Add Note
          </button>
        </div>

        {/* Collapse Button */}
        <div className="absolute -left-8 bottom-6">
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 bg-white border border-[#C6C5C5] rounded-l-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
            title={isCollapsed ? "Show Notes" : "Hide Notes"}
          >
            {isCollapsed ? (
              <ChevronLeft className="w-4 h-4 text-[#889096]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#889096]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Editor: React.FC<EditorProps> = ({ 
  content, 
  onChange, 
  selectedChapter = null,
  isLoading = false,
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(content.title);
  const [editorContent, setEditorContent] = useState(content.content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesPanelCollapsed, setNotesPanelCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Enhanced editor state
  const [currentFont, setCurrentFont] = useState('Inter, sans-serif');
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [currentAlignment, setCurrentAlignment] = useState('left');
  const [showWordCount, setShowWordCount] = useState(true);
  
  // Helper function to get text content safely
  function getTextContent(): string {
    if (editorRef.current) {
      return editorRef.current.textContent || '';
    }
    return '';
  }

  // Enhanced hooks
  const { words, characters, charactersNoSpaces, readingTime } = useWordCount(getTextContent());
  const { state: undoState, setState: setUndoState, undo, redo, canUndo, canRedo } = useUndo({
    title,
    content: editorContent
  });

  // Enhanced auto-save with 3-minute delay
  const { lastSaved, isSaving, saveError, cloudSyncStatus } = useUnifiedAutoSave(
    { title, content: editorContent, wordCount: words, lastSaved: new Date() },
    'current-user',
    {
      localKey: `chapter-${selectedChapter?.id || 'default'}`,
      enableCloud: true,
      delay: 180000,
      onSaveSuccess: (data) => {
        onChange(data);
        setHasUnsavedChanges(false);
      },
      onSaveError: (error) => {
        console.error('Auto-save failed:', error);
      }
    }
  );

  // Keyboard shortcuts
  useKeyboard({
    'ctrl+s': (e) => {
      e.preventDefault();
      handleSave();
    },
    'ctrl+z': (e) => {
      e.preventDefault();
      if (canUndo) undo();
    },
    'ctrl+y': (e) => {
      e.preventDefault();
      if (canRedo) redo();
    },
    'ctrl+b': (e) => {
      e.preventDefault();
      formatText('bold');
    },
    'ctrl+i': (e) => {
      e.preventDefault();
      formatText('italic');
    },
    'ctrl+u': (e) => {
      e.preventDefault();
      formatText('underline');
    }
  }, [canUndo, canRedo, undo, redo]);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      const textContent = getTextContent();
      
      setEditorContent(newContent);
      setUndoState({ title, content: newContent });
      setHasUnsavedChanges(true);
      
      onChange({
        title,
        content: newContent,
        wordCount: textContent.trim() === '' ? 0 : textContent.trim().split(/\s+/).length,
        lastSaved: new Date(),
      });
    }
  }, [title, onChange, setUndoState]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    setUndoState({ title: newTitle, content: editorContent });
    setHasUnsavedChanges(true);
    
    onChange({
      title: newTitle,
      content: editorContent,
      wordCount: words,
      lastSaved: new Date(),
    });
  }, [editorContent, words, onChange, setUndoState]);

  const handleSave = useCallback(() => {
    const currentContent = {
      title,
      content: editorContent,
      wordCount: words,
      lastSaved: new Date()
    };
    onChange(currentContent);
    setHasUnsavedChanges(false);
  }, [title, editorContent, words, onChange]);

  const formatText = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  }, [handleContentChange]);

  const applyFont = useCallback((font: string) => {
    setCurrentFont(font);
    if (editorRef.current) {
      editorRef.current.style.fontFamily = font;
    }
  }, []);

  const applyFontSize = useCallback((size: number) => {
    setCurrentFontSize(size);
    if (editorRef.current) {
      editorRef.current.style.fontSize = `${size}px`;
    }
  }, []);

  const applyAlignment = useCallback((alignment: string) => {
    setCurrentAlignment(alignment);
    formatText('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1));
  }, [formatText]);

  // Notes handlers
  const handleAddNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
  }, []);

  const handleEditNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  // Restore undo state when undoing/redoing
  useEffect(() => {
    if (undoState.title !== title) {
      setTitle(undoState.title);
    }
    if (undoState.content !== editorContent) {
      setEditorContent(undoState.content);
      if (editorRef.current) {
        editorRef.current.innerHTML = undoState.content;
      }
    }
  }, [undoState, title, editorContent]);

  // Update editor content when external content changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content.content) {
      editorRef.current.innerHTML = content.content;
      setEditorContent(content.content);
    }
    if (content.title !== title) {
      setTitle(content.title);
    }
  }, [content.content, content.title, title]);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#f2eee2' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#889096]">Loading chapter...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex-1 flex flex-col relative overflow-hidden ${className}`}
      style={{ backgroundColor: '#f2eee2' }}
    >
      {/* Auto-save Notification */}
      <AutoSaveNotification 
        isSaving={isSaving}
        saveError={saveError}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Header with Breadcrumb and Centered Search */}
      <div className="border-b border-[#C6C5C5] px-4 md:px-6 py-4" style={{ backgroundColor: '#f2eee2' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm text-[#889096] font-semibold">
            <span className="text-gray-900">Write</span>
            <span className="text-[#889096]">›</span>
            <span className="text-gray-900">Editor</span>
          </div>
          
          {/* Centered Search Bar */}
          <div className="w-full md:flex-1 md:flex md:justify-center md:max-w-md md:mx-8">
            <SimpleSearchFilter
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search..."
              className="w-full md:max-w-md"
            />
          </div>
          
          <div className="hidden md:block w-24"></div>
        </div>
      </div>

      {/* Floating Toolbar */}
      <div 
        className="fixed left-1/2 transform -translate-x-1/2 flex items-center px-2 py-1 gap-1"
        style={{
          backgroundColor: '#F6F6F1',
          width: '200px',
          height: '30px',
          borderRadius: '5.277px',
          bottom: '60px',
          zIndex: 50,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        <button
          onClick={() => formatText('bold')}
          className="text-xs px-2 py-1 rounded hover:bg-gray-200 min-w-[24px] transition-colors"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => formatText('italic')}
          className="text-xs px-2 py-1 rounded hover:bg-gray-200 min-w-[24px] transition-colors"
          title="Italic"
        >
          I
        </button>
        <button
          onClick={() => formatText('underline')}
          className="text-xs px-2 py-1 rounded hover:bg-gray-200 min-w-[24px] transition-colors"
          title="Underline"
        >
          U
        </button>
        <div className="w-px h-4 bg-gray-300"></div>
        <select
          value={currentFontSize}
          onChange={(e) => applyFontSize(Number(e.target.value))}
          className="text-xs bg-transparent border-none outline-none cursor-pointer"
          style={{ width: '30px' }}
        >
          {FONT_SIZES.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <button
          onClick={() => applyAlignment('center')}
          className="text-xs px-2 py-1 rounded hover:bg-gray-200 min-w-[24px] transition-colors"
          title="Center Align"
        >
          ⟷
        </button>
      </div>

      {/* Editor Container */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`transition-all duration-300 ${notesPanelCollapsed ? 'flex-1' : 'flex-1 mr-80'}`}>
          <div className="w-full h-full bg-white mx-3 md:mx-6 mb-3 md:mb-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Chapter Info */}
            {selectedChapter?.title && (
              <div className="px-4 md:px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Chapter {selectedChapter?.number || 'Unknown'}: {selectedChapter.title}
                  </span>
                </div>
                {showWordCount && (
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                    <span>{words} words</span>
                    <span className="hidden sm:inline">{characters} characters</span>
                    <span className="hidden md:inline">{readingTime} min read</span>
                  </div>
                )}
              </div>
            )}

            {/* Editor Content */}
            <div className="h-full overflow-y-auto">
              {!selectedChapter ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No chapter selected</h3>
                    <p className="text-[#889096]">Select a chapter to start writing</p>
                  </div>
                </div>
              ) : (
                <div className="px-4 md:px-10 pt-6 md:pt-10 pb-20 md:pb-32">
                  <div className="max-w-[803px] mx-auto">
                    {/* Title Input */}
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="text-2xl md:text-4xl font-semibold text-black text-center mb-8 md:mb-16 font-inter w-full bg-transparent border-none outline-none cursor-text"
                      placeholder="Chapter Title"
                    />
                    
                    {/* Content Editor */}
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleContentChange}
                      className="text-sm md:text-base text-black leading-relaxed font-inter outline-none min-h-96 cursor-text focus:outline-none focus:ring-0"
                      style={{ 
                        fontFamily: currentFont,
                        fontSize: isMobile ? `${Math.max(14, currentFontSize - 2)}px` : `${currentFontSize}px`,
                        textAlign: currentAlignment as any
                      }}
                      suppressContentEditableWarning={true}
                      data-placeholder="Start writing your chapter..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Panel */}
        <NotesPanel
          notes={notes}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          isCollapsed={notesPanelCollapsed}
          onToggleCollapse={() => setNotesPanelCollapsed(!notesPanelCollapsed)}
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white border-t border-[#C6C5C5] px-4 md:px-6 py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-[#889096]">
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <span>{words} words</span>
            <span className="hidden sm:inline">{characters} characters</span>
            <span className="hidden md:inline">{charactersNoSpaces} without spaces</span>
            <span>{readingTime} min read</span>
          </div>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <span className="text-blue-600">Auto-saving...</span>
            ) : (
              lastSaved && (
                <span className="text-xs">Saved {lastSaved.toLocaleTimeString()}</span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
