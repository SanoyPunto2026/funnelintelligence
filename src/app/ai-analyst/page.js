"use client";

import { useEffect } from 'react';

export default function AIAnalystPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('ai', true);
    }
  }, []);

  return null;
}
