import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { questStore } from '@/data/questStore';
import { enhancedQuestService } from '@/services/enhancedQuestService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Trophy, Zap, Target, TrendingUp, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { user, userProfile, isAuthenticated } = useAuth();

  // Fetch real-time user data
  const { data: realTimeUserData } = useQuery({
    queryKey: ['userProfile', userProfile?.id],
    queryFn: () => userProfile?.id ? userService.getUserById(userProfile.id) : null,
    enabled: !!userProfile?.id,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch user's active quests
  const { data: activeQuests } = useQuery({
    queryKey: ['activeQuests', userProfile?.id],
    queryFn: () => userProfile?.id ? enhancedQuestService.getUserActiveQuests(userProfile.id) : [],
    enabled: !!userProfile?.id,
  });

  // Fetch user's quest participations
  const { data: questParticipations } = useQuery({
    queryKey: ['questParticipations', userProfile?.id],
    queryFn: () => userProfile?.id ? userService.getUserQuestParticipations(userProfile.id) : [],
    enabled: !!userProfile?.id,
  });

  // Calculate stats from real data
  const currentUser = realTimeUserData || userProfile;
  const totalQuests = (activeQuests?.length || 0) + (questParticipations?.length || 0);
  const completedQuests = questParticipations?.filter(p => p.status === 'completed').length || 0;
  const xpProgress = currentUser ? (currentUser.xp / currentUser.xp_to_next_level) * 100 : 0;

  // Get recent active quests for display
  const recentActiveQuests = activeQuests?.slice(0, 3) || [];

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {currentUser?.username || 'User'}!</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Level</CardTitle>
                  <Zap className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{currentUser?.level || 1}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(currentUser?.xp || 0).toLocaleString()} / {(currentUser?.xp_to_next_level || 1000).toLocaleString()} XP
                  </p>
                  <Progress value={xpProgress} className="mt-2" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-secondary/20 bg-gradient-to-br from-secondary/10 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Rank</CardTitle>
                  <Trophy className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">#{currentUser?.rank || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(currentUser?.tier || 'bronze').toUpperCase()} Tier
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Quests</CardTitle>
                  <Target className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completedQuests}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {totalQuests} completed
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Streak</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{currentUser?.streak || 0} 🔥</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    days in a row
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Active Quests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Trending Quests</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/browse">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentActiveQuests.map((quest, index) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link to={`/quest/${quest.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                        <div className="relative h-32">
                          <img
                            src={quest.image}
                            alt={quest.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 right-2 gradient-primary">
                            {quest.xpReward} XP
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-1">{quest.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users size={12} />
                              {quest.participants}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {quest.duration}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {(currentUser?.badges || []).map((badge, index) => (
                  <motion.div
                    key={badge}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Badge variant="outline" className="text-sm py-2 px-4">
                      🏆 {badge}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;