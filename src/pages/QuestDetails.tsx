import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedQuestService } from '@/services/enhancedQuestService';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Users, Clock, Zap, CheckCircle, Calendar, MapPin, Coins, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const QuestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const queryClient = useQueryClient();
  const [evidence, setEvidence] = useState('');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const { data: quest, isLoading } = useQuery({
    queryKey: ['quest', id],
    queryFn: () => enhancedQuestService.getQuestById(id!),
  });

  const { data: questStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['questStatus', id, user?.id],
    queryFn: () => user?.id ? enhancedQuestService.getUserQuestStatus(user.id, id!) : null,
    enabled: !!user?.id && !!id,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !user?.username) {
        throw new Error('User not authenticated');
      }
      return enhancedQuestService.joinQuest(user.id, user.username, id!);
    },
    onSuccess: async () => {
      await refreshUserProfile();
      queryClient.invalidateQueries({ queryKey: ['quest', id] });
      queryClient.invalidateQueries({ queryKey: ['questStatus', id, user?.id] });
      toast({
        title: "Quest Joined! 🎉",
        description: `You've successfully joined this quest. ${quest?.joinCost} reward points deducted.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Join Quest",
        description: error.message || "An error occurred while joining the quest.",
        variant: "destructive",
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return enhancedQuestService.submitEvidence(user.id, id!, evidence);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questStatus', id, user?.id] });
      setIsSubmitDialogOpen(false);
      setEvidence('');
      toast({
        title: "Evidence Submitted! 📸",
        description: "Your evidence has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Submit Evidence",
        description: error.message || "An error occurred while submitting evidence.",
        variant: "destructive",
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
                  {quest.joinCost && (
                    <div className="flex items-center gap-3">
                      <Coins className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Join Cost</div>
                        <div className="font-semibold">{quest.joinCost} reward points</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dynamic Action Button */}
              {!statusLoading && user?.id && (
                <>
                  {!questStatus ? (
                    // User hasn't joined - show Join button
                    <Button
                      className="w-full gradient-primary text-lg py-6"
                      size="lg"
                      onClick={() => joinMutation.mutate()}
                      disabled={
                        joinMutation.isPending || 
                        (userProfile && quest.joinCost && quest.joinCost > userProfile.reward_points)
                      }
                    >
                      {joinMutation.isPending 
                        ? 'Joining...' 
                        : userProfile && quest.joinCost && quest.joinCost > userProfile.reward_points
                          ? 'Insufficient Points'
                          : `Join Quest (${quest.joinCost || 0} points)`
                      }
                    </Button>
                  ) : questStatus.status === 'joined' ? (
                    // User has joined but not submitted - show Submit Evidence button
                    <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full gradient-primary text-lg py-6"
                          size="lg"
                        >
                          <Upload className="mr-2 h-5 w-5" />
                          Submit Evidence
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Quest Evidence</DialogTitle>
                          <DialogDescription>
                            Provide evidence that you've completed this quest. This will be reviewed by the community.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="evidence">Evidence Description</Label>
                            <Textarea
                              id="evidence"
                              placeholder="Describe your completion or provide links to photos/videos..."
                              value={evidence}
                              onChange={(e) => setEvidence(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setIsSubmitDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-1 gradient-primary"
                              onClick={() => submitMutation.mutate()}
                              disabled={submitMutation.isPending || !evidence.trim()}
                            >
                              {submitMutation.isPending ? 'Submitting...' : 'Submit Evidence'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    // User has submitted evidence - show status
                    <Button
                      className="w-full text-lg py-6"
                      size="lg"
                      variant="outline"
                      disabled
                    >
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Evidence Submitted - Under Review
                    </Button>
                  )}
                </>
              )}

              {!user?.id && (
                <Button
                  className="w-full gradient-primary text-lg py-6"
                  size="lg"
                  onClick={() => navigate('/profile')}
                >
                  Sign In to Join Quest
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestDetails;