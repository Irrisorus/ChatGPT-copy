"use client";

import { Plus, Loader2 } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNewChatButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

export function SidebarNewChatButton({ onClick, isLoading }: SidebarNewChatButtonProps) {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="cursor-pointer bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors"
                    onClick={onClick}
                    disabled={isLoading}
                    tooltip="Начать новый чат"
                >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                        {isLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Plus className="size-5" />
                        )}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                        <span className="truncate font-semibold text-foreground">
                            {isLoading ? "Создание..." : "Новый чат"}
                        </span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
