"use client";

import { SessionContext } from "@/features/authorization/contexts/SessionProvider";
import { useContext } from "react";

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSession só pode ser usado dentro de um SessionProvider.",
    );
  }

  return context;
}
