import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Resolve the display label from children whenever value or children change
  useEffect(() => {
    const content = React.Children.toArray(children).find(
      (child): child is React.ReactElement => React.isValidElement(child) && child.type === SelectContent
    );
    if (content && content.props.children) {
      const items = React.Children.toArray(content.props.children);
      for (const item of items) {
        if (React.isValidElement(item) && item.type === SelectItem && item.props.value === selectedValue) {
          const label = typeof item.props.children === 'string' ? item.props.children : '';
          setSelectedLabel(label);
          return;
        }
      }
    }
    setSelectedLabel('');
  }, [selectedValue, children]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset focused index when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const handleValueChange = (newValue: string, label?: string) => {
    setSelectedValue(newValue);
    setSelectedLabel(label || '');
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    // Get item count from children
    const content = React.Children.toArray(children).find(
      (child): child is React.ReactElement => React.isValidElement(child) && child.type === SelectContent
    );
    const itemCount = content ? React.Children.count(content.props.children) : 0;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, itemCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Select the focused item
      if (content && focusedIndex >= 0) {
        const items = React.Children.toArray(content.props.children);
        const focusedItem = items[focusedIndex];
        if (React.isValidElement(focusedItem) && focusedItem.type === SelectItem) {
          const label = typeof focusedItem.props.children === 'string' ? focusedItem.props.children : undefined;
          handleValueChange(focusedItem.props.value, label);
        }
      }
    }
  }, [isOpen, children, focusedIndex, handleValueChange]);

  return (
    <div ref={selectRef} className="relative" onKeyDown={handleKeyDown}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => setIsOpen(!isOpen),
              isOpen,
              selectedValue,
              selectedLabel
            });
          }
          if (child.type === SelectContent) {
            return React.cloneElement(child as React.ReactElement<any>, {
              isOpen,
              onValueChange: handleValueChange,
              selectedValue,
              focusedIndex
            });
          }
        }
        return child;
      })}
    </div>
  );
};

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isOpen?: boolean;
  selectedValue?: string;
  selectedLabel?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  isOpen,
  selectedValue,
  selectedLabel,
  className = '',
  ...props
}) => (
  <button
    type="button"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    className={`flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    {...props}
  >
    {React.Children.map(children, child => {
      if (React.isValidElement(child) && child.type === SelectValue) {
        return selectedLabel || selectedValue || child.props.placeholder;
      }
      return child;
    })}
    <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </button>
);

export interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  return <span>{placeholder}</span>;
};

export interface SelectContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onValueChange?: (value: string, label?: string) => void;
  selectedValue?: string;
  focusedIndex?: number;
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  isOpen,
  onValueChange,
  selectedValue,
  focusedIndex = -1
}) => {
  if (!isOpen) return null;

  let index = 0;
  return (
    <div role="listbox" aria-label="Options" className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          const currentIndex = index++;
          return React.cloneElement(child as React.ReactElement<any>, {
            onSelect: onValueChange,
            isSelected: child.props.value === selectedValue,
            isFocused: currentIndex === focusedIndex
          });
        }
        return child;
      })}
    </div>
  );
};

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string, label?: string) => void;
  isSelected?: boolean;
  isFocused?: boolean;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  value,
  children,
  onSelect,
  isSelected,
  isFocused
}) => (
  <div
    role="option"
    aria-selected={isSelected}
    tabIndex={-1}
    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
      isSelected ? 'bg-blue-50 text-blue-900' : ''
    } ${isFocused ? 'bg-gray-100 outline outline-2 outline-blue-500' : ''}`}
    onClick={() => onSelect?.(value, typeof children === 'string' ? children : undefined)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect?.(value, typeof children === 'string' ? children : undefined);
      }
    }}
  >
    {children}
  </div>
);
