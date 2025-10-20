import { Link, useLocation } from 'react-router-dom';
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Compass, 
  Plus, 
  ListChecks, 
  Trophy, 
  User, 
  Star,
  Vote,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export function AppSidebar() {
  const location = useLocation();
  
  const menuItems = [
    { title: 'Dashboard', icon: Home, href: '/' },
    { title: 'Browse Quests', icon: Compass, href: '/browse' },
    { title: 'Create Quest', icon: Plus, href: '/create' },
    { title: 'My Quests', icon: ListChecks, href: '/my-quests' },
    { title: 'Voting', icon: Vote, href: '/voting', badge: 3 },
    { title: 'Claim XP', icon: Star, href: '/claim-xp', badge: 'NEW' },
    { title: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
    { title: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">QuestClash</h1>
            <p className="text-xs text-muted-foreground">Level Up Your Life</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="bg-sidebar-accent rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Daily Streak</span>
            <span className="text-lg font-bold text-accent">🔥 7</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Keep it up! Complete a quest today.
          </div>
        </div>
        <div className="mt-3">
          <ThemeSwitcher />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}