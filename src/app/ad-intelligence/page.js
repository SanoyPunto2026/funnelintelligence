"use client";

import { useEffect } from 'react';

export default function AdIntelligencePage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('ads', true);
    }
  }, []);

  return null;
}
