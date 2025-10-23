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
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import SignIn from "@/pages/SignIn";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 w-full min-w-0">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Index /> : <SignIn />} />
            <Route path="/browse" element={isAuthenticated ? <BrowseQuests /> : <SignIn />} />
            <Route path="/quest/:id" element={isAuthenticated ? <QuestDetails /> : <SignIn />} />
            <Route path="/create" element={isAuthenticated ? <CreateQuest /> : <SignIn />} />
            <Route path="/my-quests" element={isAuthenticated ? <MyQuests /> : <SignIn />} />
            <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard /> : <SignIn />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <SignIn />} />
            <Route path="/claim-xp" element={isAuthenticated ? <ClaimXP /> : <SignIn />} />
            <Route path="/voting" element={isAuthenticated ? <Voting /> : <SignIn />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default App;