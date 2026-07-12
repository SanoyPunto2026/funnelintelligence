"use client";

import { useEffect } from 'react';

export default function AlertEnginePage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('alerts', true);
    }
  }, []);

  return null;
}
