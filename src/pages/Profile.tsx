import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { questStore } from '@/data/questStore';
import { Trophy, Zap, Target, TrendingUp, Wallet, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => questStore.getCurrentUser(),
  });

  const xpProgress = user ? (user.xp / user.xpToNextLevel) * 100 : 0;
  const completionRate = user ? (user.completedQuests / user.totalQuests) * 100 : 0;

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Your quest journey and achievements</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              <div className="h-32 gradient-primary" />
              <CardContent className="relative pt-16 pb-6">
                <Avatar className="absolute -top-16 left-6 h-32 w-32 border-4 border-background">
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback className="text-3xl">{user?.username[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-40">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">{user?.username}</h2>
                    <Badge className="gradient-gold text-white">
                      {user?.tier.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Rank #{user?.rank}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>{user?.completedQuests} Quests Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>{user?.streak} Day Streak 🔥</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Level Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold">Level {user?.level}</span>
                    <span className="text-muted-foreground">
                      {user?.xp.toLocaleString()} / {user?.xpToNextLevel.toLocaleString()} XP
                    </span>
                  </div>
                  <Progress value={xpProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {user && user.xpToNextLevel - user.xp} XP until next level
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Wallet */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-green-500" />
                    Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">💰</div>
                      <div>
                        <div className="font-semibold">USDC Balance</div>
                        <div className="text-sm text-muted-foreground">Cryptocurrency</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-500">
                      ${user?.usdcBalance.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-3">
                      <Coins className="h-6 w-6 text-accent" />
                      <div>
                        <div className="font-semibold">Platform Credits</div>
                        <div className="text-sm text-muted-foreground">Internal currency</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-accent">
                      {user?.credits.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quest Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-lg bg-muted/50">
                    <div className="text-4xl font-bold text-primary mb-2">{user?.totalQuests}</div>
                    <div className="text-sm text-muted-foreground">Total Quests</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted/50">
                    <div className="text-4xl font-bold text-green-500 mb-2">{user?.completedQuests}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted/50">
                    <div className="text-4xl font-bold text-accent mb-2">{completionRate.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {user?.badges.map((badge, index) => (
                    <motion.div
                      key={badge}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + 0.1 * index }}
                      className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="text-4xl mb-2">🏆</div>
                      <div className="text-sm font-semibold text-center">{badge}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;