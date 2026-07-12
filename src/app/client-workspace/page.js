"use client";

import { useEffect } from 'react';

export default function ClientWorkspacePage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('client', true);
    }
  }, []);

  return null;
}
