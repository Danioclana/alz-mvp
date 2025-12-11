"use client"

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({ children, className, hoverEffect = false, variant = 'default', ...props }: CardProps & { variant?: 'default' | 'glass' }) {
  return (
    <motion.div
      initial={hoverEffect ? { opacity: 0, y: 20 } : undefined}
      whileInView={hoverEffect ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      whileHover={hoverEffect ? { y: -5 } : undefined}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border shadow-sm",
        variant === 'glass' ? "glass-card border-white/20" : "bg-card text-card-foreground border-border",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)}>
      {children}
    </div>
  );
}
