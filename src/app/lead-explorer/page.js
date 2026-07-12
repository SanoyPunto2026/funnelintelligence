"use client";

import { useEffect } from 'react';

export default function LeadExplorerPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('leads', true);
    }
  }, []);

  return null;
}
