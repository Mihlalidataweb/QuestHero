import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Gift, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const ClaimXP = () => {
  const { toast } = useToast();

  const rewards = [
    { id: 1, title: 'Daily Login Bonus', xp: 50, claimed: false },
    { id: 2, title: 'First Quest Completed', xp: 200, claimed: false },
    { id: 3, title: 'Community Helper', xp: 100, claimed: false },
    { id: 4, title: 'Week Streak Bonus', xp: 500, claimed: false },
  ];

  const handleClaim = (reward: any) => {
    toast({
      title: "XP Claimed! ⭐",
      description: `You earned ${reward.xp} XP from ${reward.title}`,
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Claim XP</h1>
          <p className="text-sm text-muted-foreground">Collect your earned experience points</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden border-primary/50">
              <div className="gradient-primary p-8 text-center">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-white" />
                <h2 className="text-3xl font-bold text-white mb-2">Available Rewards</h2>
                <p className="text-white/80">Claim your earned XP and bonuses</p>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <Badge className="gradient-primary">
                        <Star className="h-3 w-3 mr-1" />
                        {reward.xp} XP
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gift className="h-8 w-8 text-accent" />
                        <div>
                          <div className="font-semibold">Ready to Claim</div>
                          <div className="text-sm text-muted-foreground">
                            Expires in 24 hours
                          </div>
                        </div>
                      </div>
                      <Button
                        className="gradient-primary"
                        onClick={() => handleClaim(reward)}
                      >
                        Claim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>How to Earn More XP</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Complete Quests</div>
                      <div className="text-sm text-muted-foreground">
                        Earn XP by completing daily challenges and quests
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Participate in Voting</div>
                      <div className="text-sm text-muted-foreground">
                        Help validate quest completions and earn bonus XP
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Maintain Streaks</div>
                      <div className="text-sm text-muted-foreground">
                        Log in daily and complete quests to build your streak
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Create Quality Quests</div>
                      <div className="text-sm text-muted-foreground">
                        Design engaging quests that others want to join
                      </div>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ClaimXP;