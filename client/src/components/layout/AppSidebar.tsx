import { 
  Rocket, 
  LayoutDashboard, 
  Target, 
  MessageSquare, 
  Settings,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Command Center", url: "/", icon: LayoutDashboard },
  { title: "Quests", url: "/quest", icon: Target },
  { title: "Tutor Bot", url: "/tutor", icon: MessageSquare },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-white/5 glass-panel">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            NovaLearn
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-4 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link 
                        href={item.url}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl mx-2 transition-all duration-200
                          ${isActive 
                            ? 'bg-primary/15 text-primary font-semibold' 
                            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                          }
                        `}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <Button 
          variant="outline" 
          className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary justify-start gap-2"
          onClick={() => {
            // @ts-ignore
            if (window.triggerAiCheckin) window.triggerAiCheckin();
          }}
        >
          <Sparkles className="w-4 h-4" />
          Force Check-in
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
