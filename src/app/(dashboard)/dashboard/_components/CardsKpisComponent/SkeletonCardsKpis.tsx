import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCardsKpis({ countCards = 1 }: { countCards: number }) {
  return (
    <>
      {Array.from({ length: countCards }).map((_, n) => (
        <Card key={n} className="overflow-hidden rounded-none xl:col-span-4 ">
          <CardHeader>
            <Skeleton className="h-4.5 w-29 bg-gray-400/20" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-8 w-3/6 bg-gray-400/20" />
            <div className="flex flex-row justify-between">
              <Skeleton className="h-3 w-4/5 bg-gray-400/20" />
              <Skeleton className="h-3 w-10 bg-gray-400/20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
