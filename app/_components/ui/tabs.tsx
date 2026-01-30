/**
 * 🎯 CHRONOS INFINITY 2026 — Tabs Component (Shadcn-style)
 * Premium tabs with Radix UI
 */
'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/app/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'default' | 'glass' | 'aurora' | 'pills'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-muted',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    aurora: 'bg-violet-500/10 backdrop-blur-xl border border-violet-500/20',
    pills: 'bg-transparent gap-2',
  }

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg p-1 text-muted-foreground',
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: 'default' | 'glass' | 'aurora' | 'pills'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
    glass: 'data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg',
    aurora: 'data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:shadow-violet-500/25',
    pills: 'rounded-full data-[state=active]:bg-white/10 data-[state=active]:text-white',
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
