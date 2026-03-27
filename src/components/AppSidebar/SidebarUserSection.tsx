"use client";

import Link from "next/link";
import { User as UserIcon, LogOut, LogIn } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { User } from "@supabase/supabase-js";

interface SidebarUserSectionProps {
    user: User | null;
    onLogout: () => void;
}

export function SidebarUserSection({ user, onLogout }: SidebarUserSectionProps) {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                {user ? (
                    <SidebarMenuButton
                        size="lg"
                        className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 group/logout cursor-pointer"
                        onClick={onLogout}
                        tooltip="Выйти"
                    >
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent group-hover/logout:bg-destructive/20 duration-200 transition-colors">
                            <UserIcon className="size-4 text-foreground group-hover/logout:text-destructive duration-200" />
                        </div>

                        <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                            <span className="truncate font-medium">{user.email}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                Нажмите, чтобы выйти
                            </span>
                        </div>

                        <LogOut className="size-4 ml-auto opacity-50 duration-200 group-hover/logout:opacity-100" />
                    </SidebarMenuButton>
                ) : (
                    <SidebarMenuButton asChild size="lg" tooltip="Войти">
                        <Link href="/login">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent">
                                <LogIn className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                                <span className="truncate font-semibold">Войти</span>
                                <span className="text-[10px] text-muted-foreground">Гостевой режим</span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                )}
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
