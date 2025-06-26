import React, { useState } from 'react';
import { Edit2, Link, Palette, MoreHorizontal, Copy, Trash2 } from 'lucide-react';

interface PrimaryToolbarProps {
  selectedNodes: string[];
  onAction: (action: string) => void;
  position: { x: number; y: number };
}

export const PrimaryToolbar: React.FC<PrimaryToolbarProps> = ({ 
  selectedNodes, 
  onAction, 
  position 
}) => {
  const [showMore, setShowMore] = useState(false);

  if (selectedNodes.length === 0) return null;

  return (
    <div
      className="primary-toolbar"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y - 60,
        zIndex: 1000
      }}
    >
      <div className="toolbar-background" />

      <button
        className="tool-button primary"
        onClick={() => onAction('edit')}
        disabled={selectedNodes.length === 0}
      >
        <Edit2 size={16} />
        Edit
      </button>

      <button
        className="tool-button primary"
        onClick={() => onAction('connect')}
        disabled={selectedNodes.length !== 1}
      >
        <Link size={16} />
        Connect
      </button>

      <button
        className="tool-button primary"
        onClick={() => onAction('style')}
        disabled={selectedNodes.length === 0}
      >
        <Palette size={16} />
        Style
      </button>

      <button
        className="tool-button more"
        onClick={() => setShowMore(!showMore)}
        disabled={selectedNodes.length === 0}
      >
        <MoreHorizontal size={16} />
        More
      </button>

      {showMore && (
        <div className="secondary-toolbar">
          <button onClick={() => onAction('duplicate')}>
            <Copy size={14} />
            Duplicate
          </button>
          <button onClick={() => onAction('delete')} className="danger">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};