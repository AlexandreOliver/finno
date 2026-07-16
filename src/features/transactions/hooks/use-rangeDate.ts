"use client";

import { RangeDateContext } from "../contexts/rangeDateProvider";
import { useContext } from "react";

export function useRangeDate() {
  const context = useContext(RangeDateContext);

  if (!context) {
    throw new Error(
      "useRangeDate só pode ser usado dentro de um RangeDateProvider.",
    );
  }

  return context;
}
