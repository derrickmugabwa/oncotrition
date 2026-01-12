'use client';

import { useState, useEffect } from 'react';

interface PageLoadingWrapperProps {
  children: React.ReactNode;
}

export default function PageLoadingWrapper({ children }: PageLoadingWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after client-side rendering completes
    setIsHydrated(true);
  }, []);

  return (
    <div 
      className="transition-opacity duration-300"
      style={{ opacity: isHydrated ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
