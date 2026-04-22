import React, { createContext, useContext, useState, useEffect } from 'react';
import { platformService } from '../services/api';

const PlatformContext = createContext();

export const PlatformProvider = ({ children }) => {
  const [platformName, setPlatformName] = useState('QuanStore');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await platformService.getSettings();
      setPlatformName(res.data.platform_name);
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to fetch platform branding", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateBranding = (newName) => {
    setPlatformName(newName);
  };

  return (
    <PlatformContext.Provider value={{ platformName, settings, updateBranding, refreshSettings: fetchSettings, loading }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
