"use client";

import { useParams, useRouter } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";

import { useChats } from "@/hooks/use-chats";
import { supabaseBrowser } from "@/lib/supabase-client";

import { SidebarNewChatButton } from "./SidebarNewChatButton";
import { SidebarChatItem } from "./SidebarChatItem";
import { SidebarChatsSkeleton } from "./SidebarChatsSkeleton";
import { SidebarUserSection } from "./SidebarUserSection";
import { useAuth } from "../providers/auth-provider";

export function AppSidebar() {
    const { chats, isLoading, createChat, isCreating } = useChats();
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();

    const handleLogout = async () => {
        await supabaseBrowser.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-r">
            <SidebarHeader className="pt-4">
                <SidebarNewChatButton 
                    onClick={() => createChat("Новый чат")} 
                    isLoading={isCreating} 
                />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>История чатов</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading ? (
                                <SidebarChatsSkeleton />
                            ) : chats && chats.length > 0 ? (
                                chats.map((chat) => (
                                    <SidebarChatItem 
                                        key={chat.id}
                                        id={chat.id}
                                        title={chat.title??"Новый чат"}
                                        isActive={params.id === chat.id}
                                    />
                                ))
                            ) : (
                                <div className="px-4 py-4 text-center text-xs text-muted-foreground italic">
                                    Чатов пока нет
                                </div>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="py-4">
                <SidebarUserSection 
                    user={user} 
                    onLogout={handleLogout} 
                />
            </SidebarFooter>
        </Sidebar>
    );
}
