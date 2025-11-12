"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Queries } from '@/utils/graphql';

// Default store config from build-time environment variable
// This is injected by webpack DefinePlugin in next.config.js
function getDefaultStoreConfig(): any {
  try {
    if (typeof process !== 'undefined' && process.env.STORE_CONFIG_DATA) {
      return JSON.parse(process.env.STORE_CONFIG_DATA);
    }
  } catch (error) {
    console.warn('Failed to parse STORE_CONFIG_DATA:', error);
  }

  // Fallback to empty config
  return {
    base_link_url: '',
    code: process.env.STORE_VIEW_CODE || 'default',
    store_name: 'Store',
    locale: 'en_US',
    secure_base_media_url: '',
    default_title: '',
    default_keywords: '',
    default_description: '',
    title_prefix: '',
    title_suffix: '',
    head_includes: '',
    payment_service_mode: 'test',
    cms_home_page: 'home',
  };
}

interface StoreConfigContextType {
  storeConfig: any;
}

const StoreConfigContext = createContext<StoreConfigContextType | null>(null);

export const StoreConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultConfig = getDefaultStoreConfig();
  const [storeConfig, setStoreConfig] = useState(defaultConfig);

  // Fetch store config from GraphQL when component mounts
  // This allows getting fresh data at runtime, while defaultConfig provides SSR data
  const { data } = useQuery(Queries.GET_STORE_CONFIG, {
    // Skip query if window is not loaded (SSR)
    skip: typeof window === 'undefined',
    // Use cache-first strategy since store config doesn't change often
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (data?.storeConfig) {
      setStoreConfig(data.storeConfig);
    }
  }, [data]);

  return (
    <StoreConfigContext.Provider value={{ storeConfig }}>
      {children}
    </StoreConfigContext.Provider>
  );
};

export const useStoreConfig = (): StoreConfigContextType => {
  const context = useContext(StoreConfigContext);

  if (!context) {
    // Return default config if context is not available
    // This can happen if hook is used outside of StoreConfigProvider
    console.warn('useStoreConfig must be used within StoreConfigProvider');
    return {
      storeConfig: getDefaultStoreConfig(),
    };
  }

  return context;
};

