"use client";

import { useEffect } from 'react';

export default function AgencyHealthPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('agency', true);
    }
  }, []);

  return null;
}
