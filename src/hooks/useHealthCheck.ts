import { useState, useEffect } from 'react';

export function useHealthCheck(intervalMs: number = 10000): boolean | null {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/health');
        if (response.status === 200) {
          const text = await response.text();
          if (text === 'ok') {
            setIsHealthy(true);
            return;
          }
        }
        setIsHealthy(false);
      } catch {
        setIsHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return isHealthy;
}
