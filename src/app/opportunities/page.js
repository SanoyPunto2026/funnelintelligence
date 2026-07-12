"use client";

import { useEffect } from 'react';

export default function OpportunitiesPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('opportunities', true);
    }
  }, []);

  return null;
}
