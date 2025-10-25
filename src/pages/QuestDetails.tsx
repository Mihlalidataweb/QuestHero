import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedQuestService } from '@/services/enhancedQuestService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Zap, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Coins, 
  Upload, 
  LogIn, 
  Trophy, 
  Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const QuestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const queryClient = useQueryClient();
  const [evidence, setEvidence] = useState('');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  const { data: quest, isLoading } = useQuery({
    queryKey: ['quest', id],
    queryFn: () => enhancedQuestService.getQuestById(id!),
  });

  const { data: questStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['questStatus', id, user?.id],
    queryFn: () => user?.id ? enhancedQuestService.getUserQuestStatus(user.id, id!) : null,
    enabled: !!user?.id && !!id,
  });

  // Enhanced quest joining functionality
  const handleJoinQuest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join this quest",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }

    if (!quest?.joinCost || userProfile?.reward_points < quest.joinCost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${quest?.joinCost || 0} points to join this quest.`,
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      await enhancedQuestService.joinQuest(user.id, user.username, id!);
      await refreshUserProfile();
      queryClient.invalidateQueries({ queryKey: ['quest', id] });
      queryClient.invalidateQueries({ queryKey: ['questStatus', id, user?.id] });
      toast({
        title: "Quest Joined! 🎉",
        description: `Successfully joined "${quest?.title}". Good luck on your quest!`,
      });
    } catch (error: any) {
      console.error('Error joining quest:', error);
      toast({
        title: "Failed to Join Quest",
        description: error.message || "An error occurred while joining the quest.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Enhanced evidence submission functionality
  const handleSubmitEvidence = async () => {
    if (!user || !evidence.trim()) {
      toast({
        title: "Evidence Required",
        description: "Please provide evidence description",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingEvidence(true);
    try {
      await enhancedQuestService.submitEvidence(user.id, id!, evidence.trim());
      queryClient.invalidateQueries({ queryKey: ['questStatus', id, user?.id] });
      setIsSubmitDialogOpen(false);
      setEvidence('');
      toast({
        title: "Evidence Submitted! 📸",
        description: "Your evidence has been submitted for review. You'll be notified once it's approved.",
      });
    } catch (error: any) {
      console.error('Error submitting evidence:', error);
      toast({
        title: "Failed to Submit Evidence",
        description: error.message || "An error occurred while submitting evidence.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  // Enhanced action button content with better status indication
  const getActionButtonContent = () => {
    if (!user) {
      return (
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/profile')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            size="lg"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to Join Quest
          </Button>
          <p className="text-sm text-gray-600 text-center">
            Sign in to join quests, earn XP, and track your progress
          </p>
        </div>
      );
    }

    // User is authenticated - show appropriate action based on quest status
    if (!questStatus) {
      // User hasn't joined - show Join button
      const canJoin = userProfile && quest?.joinCost ? userProfile.reward_points >= quest.joinCost : false;
      return (
        <div className="space-y-3">
          <Button 
            onClick={handleJoinQuest}
            disabled={isJoining || !canJoin}
            className={`w-full font-medium py-3 px-6 rounded-lg transition-colors text-lg ${
              canJoin 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            size="lg"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining Quest...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Join Quest ({quest?.joinCost || 0} points)
              </>
            )}
          </Button>
          {!canJoin && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 text-center">
                Insufficient points. You need {quest?.joinCost || 0} points to join this quest.
                <br />
                <span className="text-gray-600">Current balance: {userProfile?.reward_points || 0} points</span>
              </p>
            </div>
          )}
          {canJoin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 text-center">
                You have {userProfile?.reward_points || 0} points. Joining will cost {quest?.joinCost || 0} points.
              </p>
            </div>
          )}
        </div>
      );
    }

    switch (questStatus.status) {
      case 'joined':
        return (
          <div className="space-y-3">
            <Button 
              onClick={() => setIsSubmitDialogOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg"
              size="lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Submit Evidence
            </Button>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center text-green-800">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Quest Joined Successfully!</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Complete the quest requirements and submit your evidence to earn rewards.
              </p>
            </div>
          </div>
        );

      case 'submitted':
        return (
          <div className="space-y-3">
            <Button 
              disabled
              className="w-full bg-yellow-100 text-yellow-800 font-medium py-3 px-6 rounded-lg cursor-not-allowed text-lg"
              size="lg"
            >
              <Clock className="w-4 h-4 mr-2" />
              Evidence Under Review
            </Button>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center text-yellow-800">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Evidence Submitted</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Your evidence is being reviewed. You'll be notified once it's approved.
              </p>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="space-y-3">
            <Button 
              disabled
              className="w-full bg-green-100 text-green-800 font-medium py-3 px-6 rounded-lg cursor-not-allowed text-lg"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Quest Completed
            </Button>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center text-green-800">
                <Trophy className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Congratulations!</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                You've successfully completed this quest and earned your rewards.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <Button 
            onClick={() => navigate('/profile')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg"
            size="lg"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to Join Quest
          </Button>
        );
    }
  };

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

              {/* Enhanced Action Button Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Quest Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  {getActionButtonContent()}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Enhanced Evidence Submission Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSubmitDialogOpen(false)}
                disabled={isSubmittingEvidence}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmitEvidence}
                disabled={isSubmittingEvidence || !evidence.trim()}
              >
                {isSubmittingEvidence ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Evidence'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestDetails;