import React from 'react';
import { X } from 'lucide-react';

// Reusable Tag Pill Component
export function TagPill({ tag, onRemove, size = 'sm' }) {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-5 py-2 text-base'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: tag.color + '20',
        color: tag.color,
        border: `1px solid ${tag.color}40`
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={() => onRemove(tag)}
          className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
          title="Remove tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

// Tag Selector Component (Multi-select dropdown)
export function TagSelector({ availableTags, selectedTags, onChange, label }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleTag = (tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(selectedTags.filter(t => t.id !== tagToRemove.id));
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <TagPill key={tag.id} tag={tag} onRemove={removeTag} />
          ))}
        </div>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 bg-white text-left"
      >
        <span className="text-gray-500">
          {selectedTags.length > 0
            ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
            : 'Select tags...'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableTags.map(tag => {
                const isSelected = selectedTags.some(t => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-2 border-blue-400'
                        : 'border-2 border-transparent hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: isSelected ? tag.color + '15' : undefined,
                      borderColor: isSelected ? tag.color : undefined
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium">{tag.name}</span>
                      {isSelected && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Tags Display Component (Read-only)
export function TagsDisplay({ tags, size = 'sm', maxDisplay = null }) {
  if (!tags || tags.length === 0) return null;

  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
  const remaining = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap gap-2">
      {displayTags.map(tag => (
        <TagPill key={tag.id} tag={tag} size={size} />
      ))}
      {remaining > 0 && (
        <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
