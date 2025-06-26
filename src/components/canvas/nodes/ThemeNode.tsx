import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Lightbulb, Edit2, Save, X, Plus, Minus } from 'lucide-react';
import { ThemeNodeData } from '../types';

interface ThemeNodeProps {
  data: ThemeNodeData;
  selected: boolean;
  id: string;
  onDataChange?: (id: string, newData: Partial<ThemeNodeData>) => void;
}

export const ThemeNode: React.FC<ThemeNodeProps> = ({ 
  data, 
  selected, 
  id,
  onDataChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);
  const [newCharacter, setNewCharacter] = useState('');

  const handleSave = useCallback(() => {
    onDataChange?.(id, editData);
    setIsEditing(false);
  }, [id, editData, onDataChange]);

  const handleCancel = useCallback(() => {
    setEditData(data);
    setIsEditing(false);
  }, [data]);

  const updateField = useCallback((field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }, []);

  const addCharacter = useCallback(() => {
    if (newCharacter.trim()) {
      setEditData(prev => ({
        ...prev,
        relatedCharacters: [...(prev.relatedCharacters || []), newCharacter.trim()]
      }));
      setNewCharacter('');
    }
  }, [newCharacter]);

  const removeCharacter = useCallback((index: number) => {
    setEditData(prev => ({
      ...prev,
      relatedCharacters: prev.relatedCharacters?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const getThemeColor = (type: string) => {
    switch (type) {
      case 'central': return 'bg-yellow-100 border-yellow-400 text-yellow-900';
      case 'supporting': return 'bg-orange-100 border-orange-400 text-orange-900';
      case 'minor': return 'bg-amber-100 border-amber-400 text-amber-900';
      case 'subplot': return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-900';
    }
  };

  const getSignificanceIndicator = (significance: string) => {
    switch (significance) {
      case 'critical': return '🔴';
      case 'high': return '🟡';
      case 'moderate': return '🟢';
      case 'low': return '⚪';
      default: return '⚪';
    }
  };

  return (
    <div className={`theme-node min-w-[220px] max-w-[350px] p-4 border-2 rounded-lg transition-all shadow-md ${
      selected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
    } ${getThemeColor(data.type)} bg-white bg-opacity-90`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-yellow-500" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <Lightbulb className="w-4 h-4 flex-shrink-0" />
          <span className="text-lg">{getSignificanceIndicator(data.significance)}</span>
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="font-semibold text-sm bg-white border border-gray-300 rounded px-2 py-1 flex-1"
              placeholder="Theme title"
            />
          ) : (
            <h3 className="font-semibold text-sm flex-1">{data.title || 'New Theme'}</h3>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="p-1 hover:bg-green-200 rounded transition-colors"
              title="Save"
            >
              <Save size={14} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-red-200 rounded transition-colors"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>

      {/* Type and Significance */}
      <div className="flex items-center gap-2 mb-3">
        {isEditing ? (
          <select
            value={editData.type}
            onChange={(e) => updateField('type', e.target.value)}
className="text-xs bg-white border border-gray-300 rounded px-2 py-1 capitalize"
         >
           <option value="central">Central</option>
           <option value="supporting">Supporting</option>
           <option value="minor">Minor</option>
           <option value="subplot">Subplot</option>
         </select>
       ) : (
         <span className="text-xs font-medium capitalize opacity-75">{data.type}</span>
       )}
       <span className="text-xs opacity-50">•</span>
       {isEditing ? (
         <select
           value={editData.significance}
           onChange={(e) => updateField('significance', e.target.value)}
           className="text-xs bg-white border border-gray-300 rounded px-2 py-1 capitalize"
         >
           <option value="critical">Critical</option>
           <option value="high">High</option>
           <option value="moderate">Moderate</option>
           <option value="low">Low</option>
         </select>
       ) : (
         <span className="text-xs font-medium capitalize opacity-75">{data.significance} significance</span>
       )}
     </div>

     {/* Description */}
     <div className="mb-3">
       {isEditing ? (
         <textarea
           value={editData.description}
           onChange={(e) => updateField('description', e.target.value)}
           className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1 resize-none"
           rows={3}
           placeholder="Theme description and how it manifests..."
         />
       ) : (
         <p className="text-xs leading-relaxed opacity-90">
           {data.description || 'No description provided...'}
         </p>
       )}
     </div>

     {/* Development */}
     {(data.development || isEditing) && (
       <div className="mb-3">
         <h4 className="text-xs font-semibold mb-1 opacity-75">Development:</h4>
         {isEditing ? (
           <textarea
             value={editData.development || ''}
             onChange={(e) => updateField('development', e.target.value)}
             className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1 resize-none"
             rows={2}
             placeholder="How this theme develops throughout the story..."
           />
         ) : (
           <p className="text-xs leading-relaxed opacity-80">
             {data.development}
           </p>
         )}
       </div>
     )}

     {/* Related Characters */}
     <div>
       <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
         👥 Related Characters
       </h4>
       
       {isEditing ? (
         <div className="space-y-2">
           <div className="flex flex-wrap gap-1">
             {editData.relatedCharacters?.map((char, idx) => (
               <span 
                 key={idx} 
                 className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
               >
                 {char}
                 <button
                   onClick={() => removeCharacter(idx)}
                   className="hover:text-yellow-600"
                 >
                   <Minus size={10} />
                 </button>
               </span>
             ))}
           </div>
           <div className="flex gap-1">
             <input
               type="text"
               value={newCharacter}
               onChange={(e) => setNewCharacter(e.target.value)}
               onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
               className="flex-1 text-xs bg-white border border-gray-300 rounded px-2 py-1"
               placeholder="Add character..."
             />
             <button
               onClick={addCharacter}
               className="p-1 bg-yellow-200 hover:bg-yellow-300 rounded transition-colors"
             >
               <Plus size={12} />
             </button>
           </div>
         </div>
       ) : (
         <div className="flex flex-wrap gap-1">
           {data.relatedCharacters && data.relatedCharacters.length > 0 ? (
             data.relatedCharacters.slice(0, 3).map((char, idx) => (
               <span 
                 key={idx} 
                 className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
               >
                 {char}
               </span>
             ))
           ) : (
             <span className="text-xs opacity-50 italic">No characters linked</span>
           )}
           {data.relatedCharacters && data.relatedCharacters.length > 3 && (
             <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
               +{data.relatedCharacters.length - 3}
             </span>
           )}
         </div>
       )}
     </div>

     <Handle type="source" position={Position.Right} className="w-3 h-3 bg-yellow-500" />
   </div>
 );
};
