"use client";

import { Plus, MessageSquare, LogIn, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton"; 
import { useChats } from "@/hooks/use-chats";

export function AppSidebar() {
    const { chats, isLoading, createChat, isCreating } = useChats();
    const params = useParams();

    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="cursor-pointer"
                            onClick={() => createChat('new chat')}
                            disabled={isCreating}
                            tooltip="Новый чат"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                {isCreating ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Plus className="size-4" />
                                )}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {isCreating ? "Создание..." : "Новый чат"}
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>История чатов</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <SidebarMenuItem key={i}>
                                        <div className="flex items-center gap-2 px-2 py-2">
                                            <Skeleton className="size-6 shrink-0 rounded" />
                                            <Skeleton className="h-6 w-full" />
                                        </div>
                                    </SidebarMenuItem>
                                ))
                            ) : (
                                chats?.map((chat) => (
                                    <SidebarMenuItem key={chat.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={params.id === chat.id}
                                            tooltip={chat.title || "Новый чат"}
                                        >
                                            <Link href={`/chat/${chat.id}`}>
                                                <MessageSquare className="h-4 w-4" />
                                                <span className="truncate">
                                                    {chat.title || "Новый чат"}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="gap-2" tooltip="Войти">
                            <LogIn className="h-4 w-4" />
                            <span>Войти</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
