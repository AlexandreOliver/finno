import { Coins } from "lucide-react";

export function HeaderHome() {
  return (
    <header className="h-25 m-2 transition">
      <div className="gap-3 rounded-xl border border-amber-500 p-4 items-end flex shrink-0 text-foreground">
        <Coins size="50" />
        <h1 className="text-display-large text-5xl font-medium text-deep-navy leading-tight-large tracking-tight-large">
          Finno
        </h1>
      </div>
    </header>
  );
}
