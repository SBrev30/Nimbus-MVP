import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, ChevronLeft, Trash2, MoreHorizontal, AlertCircle, Edit3 } from 'lucide-react';
import { Note, NoteCategory } from '../types';
import { useNotes } from '../hooks/use-notes';

interface NotesPanelProps {
  notes?: Note[]; // Legacy prop - now optional since we fetch from database
  onAddNote?: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void; // Legacy prop
  onEditNote?: (id: string, note: Partial<Note>) => void; // Legacy prop
  onDeleteNote?: (id: string) => void; // Legacy prop
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

const categories: { label: NoteCategory; active?: boolean }[] = [
  { label: 'All' },
  { label: 'Person', active: true },
  { label: 'Place' },
  { label: 'Plot' },
  { label: 'Misc' },
];

export function NotesPanel({ 
  isCollapsed, 
  onToggleCollapse 
}: NotesPanelProps) {
  const { 
    notes: allNotes, 
    loading, 
    error, 
    createNote, 
    updateNote, 
    deleteNote: deleteNoteFromDb 
  } = useNotes();

  const [activeCategory, setActiveCategory] = useState<NoteCategory>('All');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'Person' as const });
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: '', content: '' });
  const [noteMenuOpen, setNoteMenuOpen] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null);

  // Filter notes by active category
  const filteredNotes = React.useMemo(() => {
    if (!allNotes || !Array.isArray(allNotes)) {
      return [];
    }
    
    return activeCategory === 'All' 
      ? allNotes 
      : allNotes.filter(note => note.category === activeCategory);
  }, [allNotes, activeCategory]);

  const handleCategoryChange = (category: NoteCategory) => {
    setActiveCategory(category);
    setScrollPercentage(0);
  };

  const handleAddNote = async () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      try {
        await createNote({
          title: newNote.title.trim(),
          content: newNote.content.trim(),
          category: newNote.category as NoteCategory,
        });
        setNewNote({ title: '', content: '', category: activeCategory === 'All' ? 'Person' : activeCategory });
        setIsAddingNote(false);
      } catch (error) {
        console.error('Failed to create note:', error);
      }
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note.id);
    setEditData({ title: note.title, content: note.content });
    setNoteMenuOpen(null);
  };

  const handleSaveEdit = async () => {
    if (editingNote && (editData.title.trim() || editData.content.trim())) {
      try {
        await updateNote(editingNote, {
          title: editData.title.trim(),
          content: editData.content.trim(),
        });
        setEditingNote(null);
        setEditData({ title: '', content: '' });
      } catch (error) {
        console.error('Failed to update note:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditData({ title: '', content: '' });
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteFromDb(noteId, 'Removed from notes panel');
      setDeleteConfirmOpen(null);
      setNoteMenuOpen(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const maxScroll = scrollHeight - clientHeight;
    const percentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    setScrollPercentage(Math.min(percentage, 100));
  };

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Collapsed state - minimal width at right edge
  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-0 w-[18px] h-full bg-[#f2eee2] border-l border-[#C6C5C5] flex items-start justify-center pt-3 transition-all duration-300 ease-in-out z-40">
        <button
          onClick={handleToggleCollapse}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
          title="Expand Notes Panel"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#C6C5C5]" />
        </button>
      </div>
    );
  }

  const maxNotes = 25;
  const currentNoteCount = filteredNotes?.length || 0;
  const hasMaxNotes = currentNoteCount >= maxNotes;

  return (
    <div className="fixed right-0 top-0 w-[320px] h-full bg-[#f2eee2] border-l border-[#C6C5C5] flex flex-col transition-all duration-300 ease-in-out z-40">
      {/* Header */}
      <div className="h-[94px] border-b border-[#C6C5C5] p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#889096] font-inter">Notes</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNote(true)}
              className="w-[14.66px] h-[14.66px] rounded-full bg-[#889096] flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={hasMaxNotes ? "Maximum notes reached" : "Add Note"}
              disabled={hasMaxNotes}
            >
              <Plus className="w-3 h-3 text-white" />
            </button>
            <button
              onClick={handleToggleCollapse}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              title="Collapse Notes Panel"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#889096]" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-[#889096]">
          {categories.map((category, index) => (
            <button
              key={category.label}
              onClick={() => handleCategoryChange(category.label)}
              className={`px-2 py-1.5 text-xs font-medium transition-all font-roboto flex-1 ${
                activeCategory === category.label
                  ? 'bg-[#e8ddc1] text-[#18181B]'
                  : 'bg-transparent text-[#889096] hover:bg-gray-100'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3"
        onScroll={handleScroll}
      >
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Add Note Form */}
        {isAddingNote && (
          <div className="bg-white p-4 rounded border-2 border-[#e8ddc1]">
            <input
              type="text"
              placeholder="Note title (optional)"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full text-sm text-black bg-transparent border-none outline-none mb-2 font-inter placeholder-gray-400"
              autoFocus
            />
            <textarea
              placeholder="What's on your mind?"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full text-sm text-[#666] bg-transparent border-none outline-none resize-none font-inter placeholder-gray-400"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <select
                value={newNote.category}
                onChange={(e) => setNewNote({ ...newNote, category: e.target.value as NoteCategory })}
                className="text-xs bg-gray-100 border border-gray-300 rounded px-2 py-1 font-inter"
              >
                <option value="Person">Person</option>
                <option value="Place">Place</option>
                <option value="Plot">Plot</option>
                <option value="Misc">Misc</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className="text-xs bg-[#e8ddc1] hover:bg-[#e8ddc1]/80 px-3 py-1 rounded transition-colors font-inter"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote({ title: '', content: '', category: 'Person' });
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 font-inter"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-[#889096] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-[#889096] font-inter">Loading notes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNotes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-[#889096] font-inter mb-3">
              {activeCategory === 'All' ? 'No notes yet.' : `No ${activeCategory.toLowerCase()} notes yet.`}
            </p>
            {!hasMaxNotes && (
              <button
                onClick={() => setIsAddingNote(true)}
                className="text-xs text-[#e8ddc1] hover:underline font-inter"
              >
                Add your first note
              </button>
            )}
          </div>
        )}

        {/* Notes List */}
        {!loading && filteredNotes.length > 0 && filteredNotes.map((note) => (
          <div key={note.id} className="relative">
            {editingNote === note.id ? (
              /* Edit Mode */
              <div className="bg-white p-4 rounded border-2 border-blue-200">
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full text-sm text-black bg-transparent border-none outline-none mb-2 font-inter placeholder-gray-400"
                  placeholder="Note title (optional)"
                />
                <textarea
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  className="w-full text-sm text-[#666] bg-transparent border-none outline-none resize-none font-inter"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors font-inter"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs text-gray-500 hover:text-gray-700 font-inter"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div className="bg-[#FAF9F9] p-4 rounded relative group">
                {/* Note Actions Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setNoteMenuOpen(noteMenuOpen === note.id ? null : note.id)}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Note actions"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {noteMenuOpen === note.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[120px] z-50">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOpen(note.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Note Content */}
                {note.title && (
                  <h4 className="text-sm font-medium text-black mb-1 font-inter pr-8">
                    {note.title}
                  </h4>
                )}
                <p className="text-sm text-[#898989] mb-2 font-inter leading-relaxed pr-8">
                  {note.content}
                </p>
                <div className="flex items-center justify-between text-xs text-[#898989] font-inter">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {note.category}
                  </span>
                  <span>{formatDate(note.updatedAt)}</span>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmOpen === note.id && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                  <h3 className="text-lg font-semibold mb-2">Delete Note</h3>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this note? It will be moved to your history and can be restored later.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeleteConfirmOpen(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Max Notes Warning */}
        {hasMaxNotes && (
          <div className="text-center py-4 bg-orange-50 rounded border border-orange-200">
            <p className="text-xs text-orange-700 font-inter">
              Maximum notes reached ({maxNotes}). Delete some notes to add more.
            </p>
          </div>
        )}

        {/* Note Count */}
        <div className="text-center py-2">
          <p className="text-xs text-[#889096] font-inter">
            {currentNoteCount} / {maxNotes} notes
          </p>
        </div>
      </div>

      {/* Dynamic Scrollbar */}
      <div className="absolute right-1 top-[100px] w-1 h-[calc(100vh-200px)] bg-gray-200 rounded opacity-60">
        <div 
          className="w-1 bg-gray-400 rounded transition-all duration-200"
          style={{
            height: hasMaxNotes ? '100%' : `${Math.max(10, scrollPercentage)}%`,
            backgroundColor: hasMaxNotes ? '#ef4444' : '#9ca3af'
          }}
        ></div>
      </div>

      {/* Click outside to close menus */}
      {(noteMenuOpen || deleteConfirmOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setNoteMenuOpen(null);
            setDeleteConfirmOpen(null);
          }}
        />
      )}
    </div>
  );
}
