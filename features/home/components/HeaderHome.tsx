import { Coins } from "lucide-react";

export function HeaderHome() {
  return (
    <header className="h-25 transition fixed top-0 w-full">
      <div className="gap-3 rounded-md border-b border-amber-500 p-4 items-end flex shrink-0 text-foreground bg-background">
        <Coins size="50" />
        <h1 className="text-display-large text-5xl font-medium text-deep-navy leading-tight-large tracking-tight-large">
          Finno
        </h1>
      </div>
    </header>
  );
}
