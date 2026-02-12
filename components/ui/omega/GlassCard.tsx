import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'neo' | 'ghost';
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', intensity = 'medium', ...props }, ref) => {
    
    const intensityMap = {
      low: 'bg-white/5 backdrop-blur-sm border-white/5',
      medium: 'bg-white/10 backdrop-blur-md border-white/10',
      high: 'bg-white/20 backdrop-blur-lg border-white/20'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border shadow-xl transition-all duration-300',
          intensityMap[intensity],
          'hover:bg-white/15 hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10',
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = 'GlassCard';
