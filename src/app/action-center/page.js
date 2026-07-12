"use client";

import { useEffect } from 'react';

export default function ActionCenterPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('action', true);
    }
  }, []);

  return null;
}
