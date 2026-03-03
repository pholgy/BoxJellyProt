import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => setIsOpen(!isOpen),
              isOpen,
              selectedValue
            });
          }
          if (child.type === SelectContent) {
            return React.cloneElement(child as React.ReactElement<any>, {
              isOpen,
              onValueChange: handleValueChange,
              selectedValue
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
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  isOpen,
  selectedValue,
  className = '',
  ...props
}) => (
  <button
    type="button"
    className={`flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    {...props}
  >
    {React.Children.map(children, child => {
      if (React.isValidElement(child) && child.type === SelectValue) {
        return selectedValue || child.props.placeholder;
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
  // This component receives selectedValue from the parent Select through context
  return <span>{placeholder}</span>;
};

export interface SelectContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onValueChange?: (value: string) => void;
  selectedValue?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  isOpen,
  onValueChange,
  selectedValue
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onSelect: onValueChange,
            isSelected: child.props.value === selectedValue
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
  onSelect?: (value: string) => void;
  isSelected?: boolean;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  value,
  children,
  onSelect,
  isSelected
}) => (
  <div
    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
      isSelected ? 'bg-blue-50 text-blue-900' : ''
    }`}
    onClick={() => onSelect?.(value)}
  >
    {children}
  </div>
);