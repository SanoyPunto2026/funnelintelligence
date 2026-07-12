"use client";

import { useEffect } from 'react';

export default function RisksPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('risks', true);
    }
  }, []);

  return null;
}
