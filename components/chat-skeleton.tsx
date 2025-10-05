import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-y-auto relative max-h-[calc(100vh-15rem)] overflow-auto">
        {/* Sticky Question Alert Skeleton */}
        <div className="sticky top-0 z-20 flex justify-center p-4">
          <div className="max-w-2xl w-full">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>

        <div className="mx-auto max-w-3xl relative z-10 p-4">
          {/* Chat Messages Skeleton */}
          <div className="space-y-6">
            {/* User Message Skeleton */}
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            {/* AI Message Skeleton */}
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Another User Message Skeleton */}
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </div>

            {/* Another AI Message Skeleton */}
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="border-t bg-background">
        <div className="mx-auto max-w-3xl p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-2">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-10 w-10 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
