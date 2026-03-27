import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar/AppSideBar";
import QueryProvider from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Gemini Chat",
  description: "AI Assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
  
    <html lang="ru" className={`dark ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased font-sans"> 
        <QueryProvider>
          <AuthProvider>
              <TooltipProvider delayDuration={0}>
                <SidebarProvider>
                  <div className="flex h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 flex flex-col min-w-0 bg-background text-foreground">
                      <header className="flex h-12 items-center border-b px-4 shrink-0 bg-background/95 backdrop-blur">
                        <SidebarTrigger />
                        <div className="ml-4 font-medium text-sm text-primary">Gemini</div>
                      </header>
                      <div className="flex-1 overflow-hidden relative">
                        {children}
                        <Toaster position="top-center" richColors />
                      </div>
                    </main>
                  </div>
                </SidebarProvider>
              </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
