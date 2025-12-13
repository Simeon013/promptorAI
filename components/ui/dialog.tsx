'use client';

import * as React from 'react';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;

  return (
    <DialogContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function DialogTrigger({ asChild, children }: DialogTriggerProps) {
  const { onOpenChange } = useDialog();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e);
        onOpenChange(true);
      },
    });
  }

  return (
    <button onClick={() => onOpenChange(true)} type="button">
      {children}
    </button>
  );
}

export interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogContent({ className = '', children }: DialogContentProps) {
  const { open, onOpenChange } = useDialog();

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`relative bg-background border border-border rounded-lg shadow-lg w-full ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogHeader({ className = '', children }: DialogHeaderProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
      {children}
    </div>
  );
}

export interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogTitle({ className = '', children }: DialogTitleProps) {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

export interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogDescription({ className = '', children }: DialogDescriptionProps) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}
