"use client";

import { useEffect } from 'react';

export default function ClientsPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.showView === 'function') {
      window.showView('clients', true);
    }
  }, []);

  return null;
}
