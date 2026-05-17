import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-xl border border-border shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

// Card Header
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`px-4 py-3 md:px-6 md:py-4 border-b border-border ${className}`}
    >
      {children}
    </div>
  );
}

// Card Content
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <div className={`px-4 py-4 md:px-6 md:py-5 ${className}`}>{children}</div>
  );
}

// Card Footer
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div
      className={`px-4 py-3 md:px-6 md:py-4 border-t border-border bg-gray-50/50 ${className}`}
    >
      {children}
    </div>
  );
}
