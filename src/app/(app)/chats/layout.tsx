"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar/AppSideBar";
import { ChatInput } from "@/components/Chat/ChatInput/ChatInput";
import { useSelectedLayoutSegments } from "next/navigation";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segments = useSelectedLayoutSegments();

  const isChatPage = segments[0] === "chat" && !!segments[1];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />

        <main className="flex-1 flex flex-col min-w-0 relative">
          <header className="flex h-12 items-center border-b px-4 shrink-0 bg-background/95 backdrop-blur z-10">
            <SidebarTrigger />
            <div className="ml-4 font-medium text-sm text-primary">Gemini</div>
          </header>

          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>

            {isChatPage && (
              <div className="border-t bg-background/50 backdrop-blur-md">
                <ChatInput />
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
