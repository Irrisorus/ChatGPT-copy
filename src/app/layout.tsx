import './globals.css'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import QueryProvider from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip"; // Импортируем провайдер

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        <QueryProvider>
              <TooltipProvider delayDuration={0}> {/* Оборачиваем здесь */}
                <SidebarProvider>
                  <div className="flex h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 flex flex-col min-w-0 bg-background">
                      <header className="flex h-12 items-center border-b px-4 shrink-0">
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
