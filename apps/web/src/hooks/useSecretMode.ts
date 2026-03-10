"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "ces-secret-mode";

export type SecretMode = { isSecret: boolean; toggle: () => void };

export function useSecretMode(): SecretMode {
  // Always false on server — read from localStorage on client only (FR-9)
  const [isSecret, setIsSecret] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsSecret(JSON.parse(stored) === true);
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — stay false
    }
  }, []);

  function toggle() {
    setIsSecret((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore write failures
      }
      return next;
    });
  }

  return { isSecret, toggle };
}
