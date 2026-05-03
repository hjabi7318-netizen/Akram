import { useState, useEffect } from "react";
import { storage } from "@/src/lib/storage";
import { COMPANY_DETAILS } from "@/src/types";

export function useCompanySettings() {
  const [settings, setSettings] = useState(storage.getSettings());

  useEffect(() => {
    // Poll for changes or just set it
    const interval = setInterval(() => {
      setSettings(storage.getSettings());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return settings;
}
