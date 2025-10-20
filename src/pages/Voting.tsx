import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questStore } from '@/data/questStore';
import { ThumbsUp, ThumbsDown, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const Voting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissions } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => questStore.getSubmissions(),
  });

  const voteMutation = useMutation({
    mutationFn: ({ submissionId, approve }: { submissionId: string; approve: boolean }) =>
      questStore.vote(submissionId, approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast({
        title: "Vote Submitted! 🗳️",
        description: "Thank you for helping validate quest completions.",
      });
    },
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Community Voting</h1>
          <p className="text-sm text-muted-foreground">Help validate quest completions</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {submissions?.length || 0} Pending
        </Badge>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {submissions && submissions.length > 0 ? (
            submissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">{submission.username}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Submitted {new Date(submission.submittedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatTime(submission.timeRemaining)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <img
                          src={submission.evidence}
                          alt="Evidence"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Current Votes</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <div className="flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Approve</span>
                              </div>
                              <span className="font-bold text-green-500">{submission.votesFor}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                              <div className="flex items-center gap-2">
                                <ThumbsDown className="h-4 w-4 text-red-500" />
                                <span className="text-sm">Reject</span>
                              </div>
                              <span className="font-bold text-red-500">{submission.votesAgainst}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <h3 className="font-semibold mb-3">Cast Your Vote</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              variant="outline"
                              className="border-green-500 hover:bg-green-500 hover:text-white"
                              onClick={() => voteMutation.mutate({ submissionId: submission.id, approve: true })}
                              disabled={voteMutation.isPending}
                            >
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-500 hover:bg-red-500 hover:text-white"
                              onClick={() => voteMutation.mutate({ submissionId: submission.id, approve: false })}
                              disabled={voteMutation.isPending}
                            >
                              <ThumbsDown className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3 text-center">
                            Earn 10 XP for participating in validation
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">🗳️</div>
                <h3 className="text-xl font-semibold mb-2">No Pending Votes</h3>
                <p className="text-muted-foreground text-center">
                  Check back later for quest submissions to validate
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Voting;