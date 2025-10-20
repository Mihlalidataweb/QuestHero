import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "@/pages/Index";
import BrowseQuests from "@/pages/BrowseQuests";
import QuestDetails from "@/pages/QuestDetails";
import CreateQuest from "@/pages/CreateQuest";
import MyQuests from "@/pages/MyQuests";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import ClaimXP from "@/pages/ClaimXP";
import Voting from "@/pages/Voting";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <SidebarInset className="flex-1 w-full min-w-0">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/browse" element={<BrowseQuests />} />
                  <Route path="/quest/:id" element={<QuestDetails />} />
                  <Route path="/create" element={<CreateQuest />} />
                  <Route path="/my-quests" element={<MyQuests />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/claim-xp" element={<ClaimXP />} />
                  <Route path="/voting" element={<Voting />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;