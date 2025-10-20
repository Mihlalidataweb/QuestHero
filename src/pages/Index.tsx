import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { questStore } from '@/data/questStore';
import { Link } from 'react-router-dom';
import { Trophy, Zap, Target, TrendingUp, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => questStore.getCurrentUser(),
  });

  const { data: quests } = useQuery({
    queryKey: ['quests'],
    queryFn: () => questStore.getQuests(),
  });

  const activeQuests = quests?.filter(q => q.status === 'active').slice(0, 3) || [];
  const xpProgress = user ? (user.xp / user.xpToNextLevel) * 100 : 0;

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user?.username}!</p>
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
                  <div className="text-3xl font-bold">{user?.level}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user?.xp.toLocaleString()} / {user?.xpToNextLevel.toLocaleString()} XP
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
                  <div className="text-3xl font-bold">#{user?.rank}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user?.tier.toUpperCase()} Tier
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
                  <div className="text-3xl font-bold">{user?.completedQuests}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {user?.totalQuests} completed
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
                  <div className="text-3xl font-bold">{user?.streak} 🔥</div>
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
                {activeQuests.map((quest, index) => (
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
                {user?.badges.map((badge, index) => (
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