"use client";

import { useEffect } from 'react';

export default function AcademyPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('academy', true);
    }
  }, []);

  return null;
}
