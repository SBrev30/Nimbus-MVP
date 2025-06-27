import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Note, NoteCategory } from '../types';

interface NotesPanelProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditNote: (id: string, note: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
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

// Sample notes data organized by category
const sampleNotesByCategory = {
  All: [
    { id: '1', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', date: 'Feb 8, 2021', highlighted: true },
    { id: '2', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed at arcu dui.', date: 'Feb 8, 2021' },
    { id: '3', content: 'Character development notes for the protagonist.', date: 'Feb 7, 2021' },
    { id: '4', content: 'Plot twist ideas for chapter 5.', date: 'Feb 6, 2021' },
    { id: '5', content: 'Setting description for the ancient library.', date: 'Feb 5, 2021' },
  ],
  Person: [
    { id: '1', content: 'Sarah Character Profile: Protagonist, age 28, journalist investigating mysterious occurrences.', date: 'Feb 8, 2021', highlighted: true },
    { id: '2', content: 'Detective Morrison: Gruff exterior, haunted by past case failures.', date: 'Feb 7, 2021' },
    { id: '3', content: 'Mrs. Henderson: Elderly witness with sharp memory and mysterious past.', date: 'Feb 6, 2021' },
    { id: '4', content: 'Dr. Webb: Town physician hiding dark secrets about the incidents.', date: 'Feb 5, 2021' },
    { id: '5', content: 'Tommy: Local teenager who may have witnessed something important.', date: 'Feb 4, 2021' },
  ],
  Place: [
    { id: '1', content: 'The Old Oak Tree: Central location with mystical properties at forest edge.', date: 'Feb 8, 2021', highlighted: true },
    { id: '2', content: 'Town Square: Where the mysterious events first began occurring.', date: 'Feb 7, 2021' },
    { id: '3', content: 'Abandoned Mill: Eerie location on the outskirts, potential hideout.', date: 'Feb 6, 2021' },
    { id: '4', content: 'Local Diner: Information hub where townspeople gather and gossip.', date: 'Feb 5, 2021' },
    { id: '5', content: 'Cemetery: Ancient burial ground with unexplained phenomena.', date: 'Feb 4, 2021' },
  ],
  Plot: [
    { id: '1', content: 'The Journal Mystery: Sarah discovers journal containing predictions about town events.', date: 'Feb 8, 2021', highlighted: true },
    { id: '2', content: 'Missing persons pattern: Three disappearances follow lunar calendar.', date: 'Feb 7, 2021' },
    { id: '3', content: 'Town conspiracy: Local officials covering up supernatural incidents.', date: 'Feb 6, 2021' },
    { id: '4', content: 'Ancient curse: Town built on sacred indigenous burial ground.', date: 'Feb 5, 2021' },
    { id: '5', content: 'Time loop theory: Events repeating in 50-year cycles.', date: 'Feb 4, 2021' },
  ],
  Misc: [
    { id: '1', content: 'Research weather patterns for atmospheric storytelling.', date: 'Feb 8, 2021', highlighted: true },
    { id: '2', content: 'Check historical records of town founding date.', date: 'Feb 7, 2021' },
    { id: '3', content: 'Interview local folklore expert about regional legends.', date: 'Feb 6, 2021' },
    { id: '4', content: 'Create timeline of mysterious events over past century.', date: 'Feb 5, 2021' },
    { id: '5', content: 'Develop soundtrack playlist for writing mood.', date: 'Feb 4, 2021' },
  ],
};

export function NotesPanel({ 
  notes = [], // Default to empty array to prevent undefined errors
  onAddNote, 
  onEditNote, 
  onDeleteNote, 
  isCollapsed, 
  onToggleCollapse 
}: NotesPanelProps) {
  const [activeCategory, setActiveCategory] = useState<NoteCategory>('Person');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'Person' as const });
  const [displayedNotes, setDisplayedNotes] = useState(sampleNotesByCategory.Person);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  // Safely filter notes with null check
  const filteredNotes = React.useMemo(() => {
    if (!notes || !Array.isArray(notes)) {
      return [];
    }
    
    return activeCategory === 'All' 
      ? notes 
      : notes.filter(note => note.category === activeCategory);
  }, [notes, activeCategory]);

  // Update displayed notes when category changes
  useEffect(() => {
    const categoryNotes = sampleNotesByCategory[activeCategory];
    setDisplayedNotes(categoryNotes || []);
  }, [activeCategory]);

  const handleCategoryChange = (category: NoteCategory) => {
    setActiveCategory(category);
    // Reset scroll position when changing categories
    setScrollPercentage(0);
  };

  const handleAddNote = () => {
    if (newNote.title.trim() && onAddNote) {
      onAddNote(newNote);
      setNewNote({ title: '', content: '', category: activeCategory });
      setIsAddingNote(false);
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

  // Collapsed state - minimal width at right edge
  if (isCollapsed) {
    return (
      <div className="w-[18px] bg-[#EAE9E9] border-l border-[#C6C5C5] flex items-start justify-center pt-3 transition-all duration-300 ease-in-out">
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
  const currentNoteCount = displayedNotes?.length || 0;
  const hasMaxNotes = currentNoteCount >= maxNotes;

  return (
    <div className="w-[296px] bg-[#EAE9E9] border-l border-[#C6C5C5] flex flex-col h-screen relative ml-5 transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="h-[94px] border-b border-[#C6C5C5] p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#889096] font-inter">Notes</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNote(true)}
              className="w-[14.66px] h-[14.66px] rounded-full bg-[#889096] flex items-center justify-center hover:bg-gray-600 transition-colors"
              title="Add Note"
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
                  ? 'bg-[#A5F7AC] text-[#18181B]'
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
        {/* Add Note Form - when adding */}
        {isAddingNote && (
          <div className="bg-white p-4 rounded">
            <input
              type="text"
              placeholder="What's on your mind?"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full text-xs text-black bg-transparent border-none outline-none mb-2 font-inter placeholder-gray-400"
              autoFocus
            />
            <textarea
              placeholder="Add your thoughts.."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full text-sm text-[#C6C5C5] bg-transparent border-none outline-none resize-none font-inter placeholder-gray-300"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddNote}
                className="text-xs bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 px-3 py-1 rounded transition-colors font-inter"
              >
                Save
              </button>
              <button
                onClick={() => setIsAddingNote(false)}
                className="text-xs text-gray-500 hover:text-gray-700 font-inter"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Display notes based on active category */}
        {displayedNotes && displayedNotes.length > 0 ? (
          displayedNotes.map((note, index) => (
            <div 
              key={note.id} 
              className={`p-4 rounded ${
                note.highlighted ? 'bg-[#A5F7AC]' : 'bg-[#FAF9F9]'
              }`}
            >
              <p className={`text-sm mb-2 font-inter leading-relaxed ${
                note.highlighted ? 'text-black' : 'text-[#898989]'
              }`}>
                {note.content}
              </p>
              <p className={`text-xs font-inter ${
                note.highlighted ? 'text-[#090808]' : 'text-[#898989]'
              }`}>
                {note.date}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-[#889096] font-inter">
              No notes in this category yet.
            </p>
            <button
              onClick={() => setIsAddingNote(true)}
              className="mt-2 text-xs text-[#A5F7AC] hover:underline font-inter"
            >
              Add your first note
            </button>
          </div>
        )}

        {/* Show message when max notes reached */}
        {hasMaxNotes && (
          <div className="text-center py-4">
            <p className="text-xs text-[#889096] font-inter">
              Maximum notes reached ({maxNotes})
            </p>
          </div>
        )}

        {/* Show current count */}
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
    </div>
  );
}
