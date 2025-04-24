import { ReactNode } from 'react';

interface SkipToContentProps {
  children: ReactNode;
}

export default function SkipToContent({ children }: SkipToContentProps) {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:p-4 focus:bg-white focus:text-primary focus:z-50 focus:shadow-lg focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {children}
    </a>
  );
}