import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={`
          w-4 h-4 border border-gray-300 rounded flex items-center justify-center cursor-pointer
          ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}
          ${className}
        `}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
      >
        {checked && (
          <CheckIcon className="w-3 h-3 text-white" />
        )}
      </div>
    </div>
  );
};