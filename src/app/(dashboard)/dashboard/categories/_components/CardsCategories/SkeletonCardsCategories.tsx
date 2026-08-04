import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { randomBytes } from "node:crypto";

export function SkeletonCardsCategories({
  countCards = 1,
}: {
  countCards: number;
}) {
  return Array.from({ length: countCards }).map((_, n) => (
    <Card key={randomBytes(n).toString("ascii")} className="h-35 w-50">
      <CardHeader>
        <Skeleton className="h-4.5 w-19 bg-gray-400/20" />
        <CardAction>
          <Skeleton className="h-4 w-7 bg-gray-400/20" />
        </CardAction>
        <CardDescription>
          <Skeleton className="h-4 w-15 bg-gray-400/20" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <Skeleton className="h-7 w-25 mt-2 bg-gray-400/20" />
      </CardContent>
    </Card>
  ));
}
