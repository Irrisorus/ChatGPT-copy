"use client";

import { SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarChatsSkeleton() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <SidebarMenuItem key={`skeleton-${i}`}>
                    <div className="flex items-center gap-3 px-2 py-2">
                        <Skeleton className="size-4 shrink-0 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                    </div>
                </SidebarMenuItem>
            ))}
        </>
    );
}
