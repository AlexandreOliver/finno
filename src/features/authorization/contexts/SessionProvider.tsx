"use client";

import { createContext, ReactNode } from "react";

interface ISession {
  isAuth: boolean;
  user: { id: string; firstName: string; lastName: string } | null;
}

const defaultSessionState: ISession = {
  isAuth: false,
  user: null,
};

export const SessionContext = createContext(defaultSessionState);

export function SessionProvider({
  value,
  children,
}: Readonly<{
  children: ReactNode;
  value: ISession;
}>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
