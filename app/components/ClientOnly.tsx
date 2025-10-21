'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Clean up browser extension attributes that cause hydration warnings
    const cleanup = () => {
      const body = document.body;
      if (body) {
        // Remove Grammarly and other extension attributes
        body.removeAttribute('data-new-gr-c-s-check-loaded');
        body.removeAttribute('data-gr-ext-installed');
        body.removeAttribute('data-gramm_editor');
        body.removeAttribute('data-gramm');
      }
    };

    // Clean up immediately and on DOM changes
    cleanup();
    
    const observer = new MutationObserver(cleanup);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'] });
    
    return () => observer.disconnect();
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
