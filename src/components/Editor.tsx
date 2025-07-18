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
  ChevronDown
} from 'lucide-react';
import { EditorContent } from '../types';
import { useWordCount, useUndo, useKeyboard } from '../hooks/useUtilities';
import { useUnifiedAutoSave } from '../hooks/useUnifiedAutoSave';
import { chapterService } from '../services/chapterService';

interface EditorProps {
  content: EditorContent;
  onChange: (content: EditorContent) => void;
  selectedChapter?: { id: string; title: string; number: number } | null;
  isLoading?: boolean;
  className?: string;
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

// Alignment Dropdown Component
const AlignmentDropdown = ({ 
  currentAlignment, 
  onAlignmentChange 
}: { 
  currentAlignment: string; 
  onAlignmentChange: (alignment: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const alignmentOptions = [
    { value: 'left', icon: AlignLeft, label: 'Left Align' },
    { value: 'center', icon: AlignCenter, label: 'Center Align' },
    { value: 'right', icon: AlignRight, label: 'Right Align' }
  ];

  const currentOption = alignmentOptions.find(opt => opt.value === currentAlignment) || alignmentOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-2 py-1 rounded hover:bg-[#e8ddc1] transition-colors"
        title="Text Alignment"
      >
        <CurrentIcon className="w-3 h-3 text-black" />
        <ChevronDown className="w-3 h-3 ml-1 text-gray-600" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[120px]">
          {alignmentOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onAlignmentChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 text-xs hover:bg-gray-100 transition-colors ${
                  currentAlignment === option.value ? 'bg-gray-100' : ''
                }`}
              >
                <Icon className="w-3 h-3 mr-2" />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
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

  // Enhanced auto-save with database integration
  const { lastSaved, isSaving, saveError, cloudSyncStatus } = useUnifiedAutoSave(
    { title, content: editorContent, wordCount: words, lastSaved: new Date() },
    selectedChapter?.id || 'default', // Use chapter ID as key
    {
      localKey: `chapter-${selectedChapter?.id || 'default'}`,
      enableCloud: true,
      delay: 180000, // 3 minutes
      onSaveSuccess: (data) => {
        // Save to database when auto-save triggers
        if (selectedChapter?.id) {
          chapterService.updateChapter(selectedChapter.id, {
            title: data.title,
            content: data.content,
            wordCount: data.wordCount
          }).catch(error => {
            console.error('Failed to save chapter to database:', error);
          });
        }
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

  const handleSave = useCallback(async () => {
    const currentContent = {
      title,
      content: editorContent,
      wordCount: words,
      lastSaved: new Date()
    };
    
    // Save to local state
    onChange(currentContent);
    setHasUnsavedChanges(false);
    
    // Save to database if we have a chapter selected
    if (selectedChapter?.id) {
      try {
        await chapterService.updateChapter(selectedChapter.id, {
          title,
          content: editorContent,
          wordCount: words
        });
      } catch (error) {
        console.error('Failed to save chapter to database:', error);
        // Could show a user notification here
      }
    }
  }, [title, editorContent, words, onChange, selectedChapter?.id]);

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
        <div className="text-center p-8">
          <div className="w-16 h-16 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#889096] font-inter">Loading chapter content...</p>
          <p className="text-xs text-[#889096] mt-2 font-inter">Please wait while we retrieve your chapter from the database</p>
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

      {/* Enhanced Floating Toolbar */}
      <div 
        className="fixed left-1/2 transform -translate-x-1/2 flex items-center px-2 py-1 gap-2"
        style={{
          backgroundColor: '#e8ddc1',
          width: 'auto',
          maxWidth: '450px',
          minWidth: '300px',
          height: '32px',
          borderRadius: '5.277px',
          bottom: '60px',
          zIndex: 50,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Section 1: Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-1 rounded transition-colors ${
            canUndo 
              ? 'hover:bg-gray-200 text-black' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Undo"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-1 rounded transition-colors ${
            canRedo 
              ? 'hover:bg-gray-200 text-black' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Redo"
        >
          <RotateCw className="w-3 h-3" />
        </button>

        {/* 1pt Separator */}
        <div className="w-px h-4 bg-gray-400"></div>

        {/* Section 2: Font Controls */}
        <select
          value={currentFont}
          onChange={(e) => applyFont(e.target.value)}
          className="text-xs bg-transparent border-none outline-none cursor-pointer min-w-[80px] text-black"
          title="Font Family"
        >
          {FONT_OPTIONS.map(font => (
            <option key={font.value} value={font.value}>{font.name}</option>
          ))}
        </select>

        <select
          value={currentFontSize}
          onChange={(e) => applyFontSize(Number(e.target.value))}
          className="text-xs bg-transparent border-none outline-none cursor-pointer min-w-[35px] text-black"
          title="Font Size"
        >
          {FONT_SIZES.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        {/* 1pt Separator */}
        <div className="w-px h-4 bg-gray-400"></div>

        {/* Section 3: Text Formatting */}
        <button
          onClick={() => formatText('bold')}
          className="text-xs px-2 py-1 rounded hover:bg-gray-200 min-w-[24px] transition-colors font-bold text-black"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => formatText('italic')}
          className="text-xs px-2 py-1 rounded hover:bg-gray-200 min-w-[24px] transition-colors italic text-black"
          title="Italic"
        >
          I
        </button>
        <button
          onClick={() => formatText('underline')}
          className="text-xs px-2 py-1 rounded hover:bg-gray-200 min-w-[24px] transition-colors underline text-black"
          title="Underline"
        >
          U
        </button>

        {/* Alignment Dropdown */}
        <AlignmentDropdown 
          currentAlignment={currentAlignment} 
          onAlignmentChange={applyAlignment} 
        />
      </div>

      {/* Editor Container - Full width since NotesPanel is handled by App.tsx */}
      <div className="flex-1 flex overflow-hidden">
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
