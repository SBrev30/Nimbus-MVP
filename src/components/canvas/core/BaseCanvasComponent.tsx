import React, { useState, useEffect, useCallback } from 'react';
import { Node, Edge, Connection } from 'reactflow';

// Base interface for all canvas components
export interface BaseCanvasComponentProps {
  id: string;
  type: string;
  data: any;
  selected?: boolean;
  dragging?: boolean;
  onUpdate?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onConnect?: (connection: Connection) => void;
  className?: string;
}

// Higher-order component for canvas component common functionality
export const withCanvasComponent = <P extends BaseCanvasComponentProps>(
  WrappedComponent: React.ComponentType<P>
) => {
  return React.forwardRef<HTMLDivElement, P>((props, ref) => {
    const [localData, setLocalData] = useState(props.data);
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Auto-save changes
    useEffect(() => {
      if (hasChanges && props.onUpdate) {
        const timeoutId = setTimeout(() => {
          props.onUpdate(props.id, localData);
          setHasChanges(false);
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    }, [localData, hasChanges, props.onUpdate, props.id]);

    const handleDataChange = useCallback((field: string, value: any) => {
      setLocalData((prev: any) => ({
        ...prev,
        [field]: value
      }));
      setHasChanges(true);
    }, []);

    const handleEdit = useCallback(() => {
      setIsEditing(!isEditing);
    }, [isEditing]);

    const handleDelete = useCallback(() => {
      if (props.onDelete) {
        props.onDelete(props.id);
      }
    }, [props.onDelete, props.id]);

    return (
      <div 
        ref={ref}
        className={`canvas-component ${props.className || ''} ${props.selected ? 'selected' : ''}`}
        data-component-id={props.id}
        data-component-type={props.type}
      >
        <WrappedComponent
          {...props}
          data={localData}
          isEditing={isEditing}
          hasChanges={hasChanges}
          onDataChange={handleDataChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    );
  });
};

// Base node component with common functionality
export const BaseCanvasNode: React.FC<BaseCanvasComponentProps & {
  isEditing?: boolean;
  hasChanges?: boolean;
  onDataChange?: (field: string, value: any) => void;
  onEdit?: () => void;
  children: React.ReactNode;
}> = ({ 
  children, 
  selected, 
  isEditing, 
  hasChanges, 
  onEdit, 
  onDelete,
  className = ''
}) => {
  return (
    <div className={`base-canvas-node ${className} ${selected ? 'selected' : ''}`}>
      {/* Node Header with Common Controls */}
      <div className="node-header">
        <div className="node-controls">
          {onEdit && (
            <button 
              className="node-control-btn edit-btn"
              onClick={onEdit}
              title={isEditing ? 'Finish editing' : 'Edit'}
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button 
              className="node-control-btn delete-btn"
              onClick={onDelete}
              title="Delete"
            >
              🗑️
            </button>
          )}
          {hasChanges && (
            <div className="save-indicator" title="Auto-saving...">
              💾
            </div>
          )}
        </div>
      </div>

      {/* Node Content */}
      <div className="node-content">
        {children}
      </div>

      {/* Connection Handles */}
      <div className="connection-handles">
        <div className="handle handle-top" data-position="top" />
        <div className="handle handle-right" data-position="right" />
        <div className="handle handle-bottom" data-position="bottom" />
        <div className="handle handle-left" data-position="left" />
      </div>
    </div>
  );
};

// Component registry for dynamic loading
export interface ComponentDefinition {
  name: string;
  component: React.ComponentType<any>;
  defaultData: any;
  category: 'character' | 'plot' | 'location' | 'theme' | 'ai' | 'other';
  features: string[];
}

export class CanvasComponentRegistry {
  private static components = new Map<string, ComponentDefinition>();

  static register(definition: ComponentDefinition) {
    this.components.set(definition.name, definition);
  }

  static get(name: string): ComponentDefinition | undefined {
    return this.components.get(name);
  }

  static getAll(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  static getByCategory(category: string): ComponentDefinition[] {
    return Array.from(this.components.values()).filter(def => def.category === category);
  }
}
