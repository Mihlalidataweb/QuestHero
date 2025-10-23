import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { enhancedQuestService } from '@/services/enhancedQuestService';
import { userService } from '@/services/userService';
import { Trophy, Zap, Target, TrendingUp, Wallet, Coins, Clock, CheckCircle, History, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { payUSDC } from '@/services/baseAccount';
import { TransferDialog } from '@/components/wallet/TransferDialog';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { user, userProfile, isAuthenticated } = useAuth();
  const [transferOpen, setTransferOpen] = useState(false);

  // Fetch real-time user data from database
  const { data: realTimeUserData, refetch: refetchUserData } = useQuery({
    queryKey: ['realTimeUserData', userProfile?.id],
    queryFn: () => userProfile?.id ? userService.getUserById(userProfile.id) : null,
    enabled: !!userProfile?.id,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Use real-time data if available, fallback to userProfile
  const currentUserData = realTimeUserData || userProfile;

  // Fetch user's XP transactions
  const { data: xpTransactions } = useQuery({
    queryKey: ['xpTransactions', userProfile?.id],
    queryFn: () => userService.getUserXPTransactions(userProfile?.id || ''),
    enabled: !!userProfile?.id,
  });

  // Fetch user's active quests
  const { data: activeQuests } = useQuery({
    queryKey: ['userActiveQuests', userProfile?.id],
    queryFn: () => enhancedQuestService.getUserActiveQuests(userProfile?.id || ''),
    enabled: !!userProfile?.id,
  });

  // Fetch user's created quests
  const { data: createdQuests } = useQuery({
    queryKey: ['userCreatedQuests', userProfile?.username],
    queryFn: () => enhancedQuestService.getQuestsByCreator(userProfile?.username || ''),
    enabled: !!userProfile?.username,
  });

  const xpToNextLevel = currentUserData ? currentUserData.xp_to_next_level || Math.floor(currentUserData.level * 100 * 1.5) : 100;
  const xpProgress = currentUserData ? (currentUserData.xp / xpToNextLevel) * 100 : 0;
  const completionRate = activeQuests && createdQuests ? 
    ((activeQuests.filter(q => q.status === 'completed').length) / 
     (activeQuests.length + createdQuests.length)) * 100 : 0;

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 relative">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Your quest journey and achievements</p>
        </div>
        {isAuthenticated && (
          <div className="absolute top-4 right-6 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchUserData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="secondary" onClick={() => payUSDC({ amount: '5.00' })}>Pay $5</Button>
            <Button onClick={() => setTransferOpen(true)}>Transfer</Button>
          </div>
        )}
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
                  <AvatarImage src={currentUserData?.avatar} alt={currentUserData?.username} />
                  <AvatarFallback className="text-3xl">{currentUserData?.username?.[0] || user?.username?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="ml-40">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">{currentUserData?.username || user?.username || 'Anonymous'}</h2>
                    <Badge className="gradient-gold text-white">
                      {currentUserData?.tier?.toUpperCase() || 'BRONZE'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Level {currentUserData?.level || 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>{activeQuests?.filter(q => q.status === 'completed').length || 0} Quests Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      <span>{currentUserData?.reward_points || 0} Reward Points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span className="font-mono text-xs">{user?.address?.slice(0, 6)}...{user?.address?.slice(-4)}</span>
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
                    <span className="text-4xl font-bold">Level {currentUserData?.level || 1}</span>
                    <span className="text-muted-foreground">
                      {currentUserData?.xp?.toLocaleString() || '0'} / {xpToNextLevel.toLocaleString()} XP
                    </span>
                  </div>
                  <Progress value={xpProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {xpToNextLevel - (currentUserData?.xp || 0)} XP until next level
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
                      ${currentUserData?.usdc_balance?.toFixed(2) || '0.00'}
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
                      {currentUserData?.credits?.toLocaleString() || '0'}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 rounded-lg bg-muted/50">
                    <div className="text-4xl font-bold text-primary mb-2">{(activeQuests?.length || 0) + (createdQuests?.length || 0)}</div>
                    <div className="text-sm text-muted-foreground">Total Quests</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted/50">
                    <div className="text-4xl font-bold text-green-500 mb-2">{activeQuests?.filter(q => q.status === 'completed').length || 0}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted/50">
                    <div className="text-4xl font-bold text-blue-500 mb-2">{createdQuests?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Created</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted/50">
                    <div className="text-4xl font-bold text-accent mb-2">{completionRate.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Activity & History</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="xp-transactions" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="xp-transactions">XP Transactions</TabsTrigger>
                    <TabsTrigger value="active-quests">Active Quests</TabsTrigger>
                    <TabsTrigger value="created-quests">Created Quests</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="xp-transactions" className="space-y-4">
                    <div className="space-y-3">
                      {xpTransactions?.length ? (
                        xpTransactions.slice(0, 10).map((transaction, index) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Zap className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{transaction.description}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(transaction.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount} XP
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No XP transactions yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="active-quests" className="space-y-4">
                    <div className="space-y-3">
                      {activeQuests?.length ? (
                        activeQuests.map((quest) => (
                          <div key={quest.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-blue-500/10">
                                <Target className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <div className="font-medium">{quest.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  Status: {quest.status}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={quest.status === 'completed' ? 'default' : 'secondary'}>
                                {quest.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No active quests</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="created-quests" className="space-y-4">
                    <div className="space-y-3">
                      {createdQuests?.length ? (
                        createdQuests.map((quest) => (
                          <div key={quest.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-green-500/10">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </div>
                              <div>
                                <div className="font-medium">{quest.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  Created: {new Date(quest.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{quest.xpReward} XP</div>
                              <div className="text-sm text-muted-foreground">Reward</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No quests created yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} />
    </div>
  );
};

export default Profile;