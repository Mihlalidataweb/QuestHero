import { useParams, useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questStore } from '@/data/questStore';
import { ArrowLeft, Users, Clock, Zap, CheckCircle, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const QuestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quest, isLoading } = useQuery({
    queryKey: ['quest', id],
    queryFn: () => questStore.getQuestById(id!),
  });

  const joinMutation = useMutation({
    mutationFn: () => questStore.joinQuest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest', id] });
      toast({
        title: "Quest Joined! 🎉",
        description: "You've successfully joined this quest. Good luck!",
      });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!quest) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Quest Not Found</h2>
        <Button onClick={() => navigate('/browse')}>Browse Quests</Button>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'extreme': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-700';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-cyan-400';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <SidebarTrigger />
        <Button variant="ghost" size="sm" onClick={() => navigate('/browse')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Quest Details</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              <div className="relative h-80">
                <img
                  src={quest.image}
                  alt={quest.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex gap-2 mb-3">
                    <Badge className={`${getTierColor(quest.tier)} text-white`}>
                      {quest.tier.toUpperCase()}
                    </Badge>
                    <Badge className={`${getDifficultyColor(quest.difficulty)} text-white`}>
                      {quest.difficulty.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="bg-background/80 backdrop-blur">
                      {quest.category}
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-bold mb-2">{quest.title}</h1>
                  <p className="text-lg text-muted-foreground">{quest.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {quest.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <Zap className="h-6 w-6 text-primary" />
                        <div>
                          <div className="font-semibold">Experience Points</div>
                          <div className="text-sm text-muted-foreground">Base reward</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">{quest.xpReward} XP</div>
                    </div>

                    {quest.usdcReward && (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">💰</div>
                          <div>
                            <div className="font-semibold">USDC Tokens</div>
                            <div className="text-sm text-muted-foreground">Cryptocurrency reward</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-500">${quest.usdcReward}</div>
                      </div>
                    )}

                    {quest.voucherReward && (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🎁</div>
                          <div>
                            <div className="font-semibold">Voucher</div>
                            <div className="text-sm text-muted-foreground">Special reward</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-accent">{quest.voucherReward}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quest Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Participants</div>
                      <div className="font-semibold">{quest.participants} joined</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-semibold">{quest.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Created by</div>
                      <div className="font-semibold">{quest.createdBy}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Verification</div>
                      <div className="font-semibold capitalize">{quest.verificationMethod}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full gradient-primary text-lg py-6"
                size="lg"
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? 'Joining...' : 'Join Quest'}
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestDetails;