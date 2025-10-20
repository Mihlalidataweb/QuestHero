import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { questStore } from '@/data/questStore';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, Hourglass } from 'lucide-react';
import { motion } from 'framer-motion';

const MyQuests = () => {
  const { data: quests } = useQuery({
    queryKey: ['quests'],
    queryFn: () => questStore.getQuests(),
  });

  const activeQuests = quests?.filter(q => q.status === 'active').slice(0, 4) || [];
  const completedQuests = quests?.filter(q => q.status === 'completed').slice(0, 3) || [];
  const pendingQuests = quests?.filter(q => q.status === 'pending_validation').slice(0, 2) || [];

  const QuestCard = ({ quest, status }: { quest: any; status: string }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link to={`/quest/${quest.id}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer">
          <div className="flex">
            <div className="w-32 h-32 flex-shrink-0">
              <img
                src={quest.image}
                alt={quest.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold line-clamp-1">{quest.title}</h3>
                {status === 'active' && (
                  <Badge variant="outline" className="ml-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                {status === 'completed' && (
                  <Badge className="ml-2 bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Done
                  </Badge>
                )}
                {status === 'pending' && (
                  <Badge variant="secondary" className="ml-2">
                    <Hourglass className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {quest.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge className="gradient-primary">{quest.xpReward} XP</Badge>
                <span className="text-xs text-muted-foreground">{quest.duration}</span>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">My Quests</h1>
          <p className="text-sm text-muted-foreground">Track your active and completed challenges</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active ({activeQuests.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingQuests.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedQuests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeQuests.length > 0 ? (
                activeQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} status="active" />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">No active quests yet</p>
                    <Button asChild className="gradient-primary">
                      <Link to="/browse">Browse Quests</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingQuests.length > 0 ? (
                pendingQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} status="pending" />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">No quests pending validation</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedQuests.length > 0 ? (
                completedQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} status="completed" />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">No completed quests yet</p>
                    <Button asChild className="gradient-primary">
                      <Link to="/browse">Start Your First Quest</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MyQuests;