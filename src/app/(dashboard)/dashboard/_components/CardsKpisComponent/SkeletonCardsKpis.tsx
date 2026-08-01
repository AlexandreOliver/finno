import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { randomBytes } from "node:crypto";

export function SkeletonCardsKpis({ countCards = 1 }: { countCards: number }) {
  return Array.from({ length: countCards }).map((_, n) => (
    <Card key={randomBytes(n).toString("ascii")}>
      <CardHeader>
        <Skeleton className="h-4.5 w-29 bg-gray-400/20" />
        <CardAction>
          <Skeleton className="h-4.5 w-11 bg-gray-400/20" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-8 w-3/6 bg-gray-400/20" />
        <Skeleton className="h-2.5 w-4/5 bg-gray-400/20" />
      </CardContent>
    </Card>
  ));
}
