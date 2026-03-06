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
  id,
  ...props
}) => {
  return (
    <span
      className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />
      <div
        className={`
          w-5 h-5 border border-gray-300 rounded flex items-center justify-center
          peer-checked:bg-blue-600 peer-checked:border-blue-600
          peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2
          ${!checked ? 'bg-white' : 'bg-blue-600 border-blue-600'}
          ${disabled ? 'opacity-50' : 'hover:border-blue-500'}
          ${className}
        `}
      >
        {checked && (
          <CheckIcon className="w-3.5 h-3.5 text-white" />
        )}
      </div>
    </span>
  );
};
