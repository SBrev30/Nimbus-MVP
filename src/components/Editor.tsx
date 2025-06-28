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
  Save,
  RotateCcw,
  RotateCw,
  Eye,
  EyeOff,
  Check,
  Cloud
} from 'lucide-react';
import { EditorContent } from '../types';
import { useWordCount, useUndo, useKeyboard } from '../hooks/useUtilities';
import { useUnifiedAutoSave } from '../hooks/useUnifiedAutoSave';

interface EditorProps {
  content: EditorContent;
  onChange: (content: EditorContent) => void;
  selectedChapter?: { id: string; title: string; number: number } | null;
  isLoading?: boolean;
  className?: string;
}

interface Chapter {
  id: string;
  title: string;
  number: number;
  wordCount: number;
  status: 'draft' | 'review' | 'final';
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
      // Auto-hide error after 5 seconds
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    } else if (lastSaved && !hasUnsavedChanges) {
      setNotificationType('saved');
      setShowNotification(true);
      // Auto-hide success after 2 seconds
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

export const Editor: React.FC<EditorProps> = ({ 
  content, 
  onChange, 
  selectedChapter = null, // Default to null to prevent undefined
  isLoading = false,
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(content.title);
  const [editorContent, setEditorContent] = useState(content.content);
  const [isReadOnly, setIsReadOnly] = useState(false);
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

  // Enhanced auto-save with 3-minute delay
  const { lastSaved, isSaving, saveError, cloudSyncStatus } = useUnifiedAutoSave(
    { title, content: editorContent, wordCount: words, lastSaved: new Date() },
    'current-user', // Replace with actual user ID
    {
      localKey: `chapter-${selectedChapter?.id || 'default'}`,
      enableCloud: true,
      delay: 180000, // 3 minutes = 180,000ms
      onSaveSuccess: (data) => {
        onChange(data);
        setHasUnsavedChanges(false);
      },
      onSaveError: (error) => {
        console.error('Auto-save failed:', error);
        // Changes are still saved locally via localStorage
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
    if (editorRef.current && !isReadOnly) {
      const newContent = editorRef.current.innerHTML;
      const textContent = getTextContent();
      
      setEditorContent(newContent);
      setUndoState({ title, content: newContent });
      setHasUnsavedChanges(true);
      
      // Trigger onChange with updated content (this will trigger auto-save after delay)
      onChange({
        title,
        content: newContent,
        wordCount: textContent.trim() === '' ? 0 : textContent.trim().split(/\s+/).length,
        lastSaved: new Date(),
      });
    }
  }, [title, onChange, setUndoState, isReadOnly]);

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
    if (isReadOnly) return;
    
    document.execCommand(command, false, value);
    handleContentChange();
  }, [handleContentChange, isReadOnly]);

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

  // Container dimensions for responsive design
  const [containerDimensions, setContainerDimensions] = useState({
    width: 900,
    height: 600,
    borderRadius: 17,
    topPadding: 20
  });

  useEffect(() => {
    const updateDimensions = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      setContainerDimensions({
        width: Math.min(900, windowWidth - 40),
        height: Math.min(600, windowHeight - 200),
        borderRadius: windowWidth < 768 ? 8 : 17,
        topPadding: windowWidth < 768 ? 10 : 20
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#889096]">Loading chapter...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex-1 flex flex-col bg-[#F9FAFB] relative overflow-hidden ${className}`}
      style={{ paddingTop: `${containerDimensions.topPadding}px` }}
    >
      {/* Auto-save Notification */}
      <AutoSaveNotification 
        isSaving={isSaving}
        saveError={saveError}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Enhanced Toolbar */}
      <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4 flex-wrap">
          {/* Font Controls */}
          <div className="flex items-center space-x-2">
            <select
              value={currentFont}
              onChange={(e) => applyFont(e.target.value)}
              className="text-sm border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
            >
              {FONT_OPTIONS.map(font => (
                <option key={font.value} value={font.value}>{font.name}</option>
              ))}
            </select>
            
            <select
              value={currentFontSize}
              onChange={(e) => applyFontSize(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
            >
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>

          {/* Format Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => formatText('bold')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment Controls */}
          <div className="flex items-center space-x-1">
            {ALIGNMENT_OPTIONS.map(({ icon: Icon, value }) => (
              <button
                key={value}
                onClick={() => applyAlignment(value)}
                className={`p-2 rounded transition-colors ${
                  currentAlignment === value ? 'bg-[#A5F7AC] text-white' : 'hover:bg-gray-100'
                }`}
                title={`Align ${value}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center space-x-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          {/* Read Only Toggle */}
          <button
            onClick={() => setIsReadOnly(!isReadOnly)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
              isReadOnly ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={isReadOnly ? 'Enable editing' : 'Read only mode'}
          >
            {isReadOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm">{isReadOnly ? 'Read Only' : 'Edit'}</span>
          </button>

          {/* Subtle Save Status Indicator */}
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>Unsaved changes</span>
            </div>
          )}

          {/* Manual Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-3 py-1 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-white rounded-lg transition-colors"
            title="Save Now (Ctrl+S)"
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            <span className="text-sm">Save</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 flex justify-center overflow-hidden">
        <div 
          className="relative bg-white overflow-hidden"
          style={{
            width: `${containerDimensions.width}px`,
            height: `${containerDimensions.height}px`,
            borderTopLeftRadius: `${containerDimensions.borderRadius}px`,
            borderTopRightRadius: `${containerDimensions.borderRadius}px`
          }}
        >
          {/* Chapter Info - FIXED: Added proper null checking */}
          {selectedChapter?.title && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Chapter {selectedChapter?.number || 'Unknown'}: {selectedChapter.title}
                </span>
              </div>
              {showWordCount && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{words} words</span>
                  <span>{characters} characters</span>
                  <span>{readingTime} min read</span>
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
              <div className="px-10 pt-10 pb-32">
                <div className="max-w-[803px] mx-auto">
                  {/* Title Input */}
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    readOnly={isReadOnly}
                    className={`text-4xl font-semibold text-black text-center mb-16 font-inter w-full bg-transparent border-none outline-none ${
                      isReadOnly ? 'cursor-default' : 'cursor-text'
                    }`}
                    placeholder="Chapter Title"
                  />
                  
                  {/* Content Editor */}
                  <div
                    ref={editorRef}
                    contentEditable={!isReadOnly}
                    onInput={handleContentChange}
                    className={`text-base text-black leading-[1.1875] font-inter outline-none min-h-96 ${
                      isReadOnly ? 'cursor-default' : 'cursor-text'
                    }`}
                    style={{ 
                      fontFamily: currentFont,
                      fontSize: `${currentFontSize}px`,
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

      {/* Minimalist Status Bar */}
      <div className="px-6 py-2 bg-white border-t border-gray-200 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setShowWordCount(!showWordCount)}
            className="flex items-center space-x-2 hover:text-[#A5F7AC] transition-colors"
          >
            <Type className="w-4 h-4" />
            <span>{words} words</span>
          </button>
          <span className="text-gray-500">{characters} characters</span>
          <span className="text-gray-500">{charactersNoSpaces} without spaces</span>
          <span className="text-gray-500">{readingTime} min read</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Last Saved Info (subtle) */}
          {lastSaved && !hasUnsavedChanges && (
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Check className="w-3 h-3" />
              <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
            </div>
          )}

          {/* Chapter Navigation - FIXED: Added proper null checking */}
          {selectedChapter?.title && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Chapter {selectedChapter?.number || 'Unknown'}</span>
            </div>
          )}

          {/* Font Info */}
          <span className="text-gray-500">
            {currentFont.split(',')[0]} {currentFontSize}px
          </span>
        </div>
      </div>
    </div>
  );
};
