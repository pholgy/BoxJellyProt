import React, { useState } from 'react';

export interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  open: controlledOpen,
  onOpenChange,
  children
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <div>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === CollapsibleTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              open,
              onOpenChange: handleOpenChange
            });
          }
          if (child.type === CollapsibleContent) {
            return React.cloneElement(child as React.ReactElement<any>, {
              open
            });
          }
        }
        return child;
      })}
    </div>
  );
};

export interface CollapsibleTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({
  children,
  asChild,
  open,
  onOpenChange
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: () => onOpenChange?.(!open),
      'aria-expanded': open,
      role: children.props.role || 'button',
      tabIndex: children.props.tabIndex ?? 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenChange?.(!open);
        }
        children.props.onKeyDown?.(e);
      }
    });
  }

  return (
    <button onClick={() => onOpenChange?.(!open)} aria-expanded={open}>
      {children}
    </button>
  );
};

export interface CollapsibleContentProps {
  children: React.ReactNode;
  open?: boolean;
}

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  open
}) => {
  if (!open) return null;

  return (
    <div className="transition-all duration-300 ease-in-out">
      {children}
    </div>
  );
};
