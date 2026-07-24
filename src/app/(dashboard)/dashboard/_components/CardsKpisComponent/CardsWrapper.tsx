import { ReactNode } from "react";

export function CardsWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl">
      <div className="grid grid-cols-1 xl:grid-cols-8">{children}</div>
    </div>
  );
}
