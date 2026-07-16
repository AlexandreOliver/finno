"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

interface Range {
  start: Date;
  end: Date;
}

interface IRangeDate {
  range: {
    start: Date;
    end: Date;
  };
  setRange: Dispatch<SetStateAction<Range>>;
}

export const RangeDateContext = createContext<IRangeDate | null>(null);

export function RangeDateProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [rangeDate, setRangeDate] = useState<Range>(() => {
    return {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0),
      end: new Date(),
    };
  });

  const value = {
    range: rangeDate,
    setRange: setRangeDate,
  };

  return (
    <RangeDateContext.Provider value={value as IRangeDate}>
      {children}
    </RangeDateContext.Provider>
  );
}
