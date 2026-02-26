'use client'

import { cn } from '@/app/_lib/utils'
import { X } from 'lucide-react'
import React from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const DialogContext = React.createContext<{ onClose?: () => void }>({})

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const handleClose = () => onOpenChange?.(false)
  if (!open) return null
  return (
    <DialogContext.Provider value={{ onClose: handleClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />
        {children}
      </div>
    </DialogContext.Provider>
  )
}

export function DialogContent({ className, children, ...props }: DialogContentProps) {
  const { onClose } = React.useContext(DialogContext)
  return (
    <div
      className={cn(
        'relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900/95 p-6 shadow-2xl backdrop-blur-xl',
        className,
      )}
      {...props}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      {children}
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 space-y-1.5', className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none tracking-tight text-white', className)}
      {...props}
    />
  )
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-white/60', className)} {...props} />
}
