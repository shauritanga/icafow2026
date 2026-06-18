"use client";

import React, { createContext, useContext } from 'react';
import type { SiteConfig } from '@/lib/content/site';

const SiteContext = createContext<SiteConfig | null>(null);

export function SiteProvider({ settings, children }: { settings: any, children: React.ReactNode }) {
  return <SiteContext.Provider value={settings}>{children}</SiteContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSiteSettings must be used within SiteProvider');
  }
  return ctx;
}
