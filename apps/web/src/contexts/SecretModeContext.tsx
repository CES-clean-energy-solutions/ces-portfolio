"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSecretMode, type SecretMode } from "@/hooks/useSecretMode";

const SecretModeContext = createContext<SecretMode>({
  isSecret: false,
  toggle: () => {},
});

export function SecretModeProvider({ children }: { children: ReactNode }) {
  const value = useSecretMode();
  return (
    <SecretModeContext.Provider value={value}>
      {children}
    </SecretModeContext.Provider>
  );
}

export function useSecretModeContext(): SecretMode {
  return useContext(SecretModeContext);
}
