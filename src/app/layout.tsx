import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import QueryProvider from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Gemini Chat",
  description: "AI Assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
  
    <html lang="ru" className={`dark ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased font-sans"> 
        <QueryProvider>
              <TooltipProvider delayDuration={0}>
                <SidebarProvider>
                  <div className="flex h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 flex flex-col min-w-0 bg-background text-foreground">
                      <header className="flex h-12 items-center border-b px-4 shrink-0 bg-background/95 backdrop-blur">
                        <SidebarTrigger />
                      </header>
                      <div className="flex-1 overflow-hidden relative">
                        {children}
                      </div>
                    </main>
                  </div>
                </SidebarProvider>
              </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
