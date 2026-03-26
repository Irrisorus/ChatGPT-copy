"use client";

import { Plus, MessageSquare, LogIn, MessageCircle } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/use-chats";

export function AppSidebar() {
  const { chats, isLoading, createChat, isCreating } = useChats();
  const params = useParams();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Button 
          onClick={() => createChat('title')} 
          disabled={isCreating}
          variant="secondary" 
          className="w-full justify-start gap-2 overflow-hidden"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Новый чат</span>
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>История чатов</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="px-4 py-2 text-xs text-muted-foreground">Загрузка...</div>
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
                        <span>{chat.title || "Новый чат"}</span>
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
            <SidebarMenuButton className="gap-2">
              <LogIn className="h-4 w-4" />
              <span>Войти</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
