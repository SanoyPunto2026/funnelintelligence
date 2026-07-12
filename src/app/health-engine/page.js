"use client";

import { useEffect } from 'react';

export default function HealthEnginePage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('engine', true);
    }
  }, []);

  return null;
}
