import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AiCheckInModal } from "../AiCheckInModal";
import { useUser } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  const { data: user, isLoading } = useUser();

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <AppSidebar />
        
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-16 flex items-center justify-between px-4 border-b border-white/5 glass-panel z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-white" />
            </div>
            
            <div className="flex items-center gap-4">
              {isLoading ? (
                <Skeleton className="h-8 w-24 rounded-full bg-white/5" />
              ) : user ? (
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm">
                    <Zap className="w-4 h-4 fill-yellow-400" />
                    {user.currentStreak}
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <span className="text-sm font-semibold text-primary">{user.rank}</span>
                  <div className="w-px h-4 bg-white/20" />
                  <span className="text-sm font-bold">{user.points} pts</span>
                </div>
              ) : null}
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 relative">
            {children}
          </main>
        </div>
      </div>
      
      <AiCheckInModal />
    </SidebarProvider>
  );
}
