"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarChatItemProps {
    id: string;
    title?: string;
    isActive: boolean;
}

export function SidebarChatItem({ id, title, isActive }: SidebarChatItemProps) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={title || "Без названия"}
            >
                <Link href={`/chats/chat/${id}`}>
                    <MessageSquare className="size-4" />
                    <span className="truncate">
                        {title || "Новый чат"}
                    </span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
