import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { questStore } from '@/data/questStore';
import { Link } from 'react-router-dom';
import { Search, Users, Clock, Zap, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BrowseQuests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const { data: quests, isLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: () => questStore.getQuests(),
  });

  const filteredQuests = quests?.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || quest.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || quest.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

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
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Browse Quests</h1>
          <p className="text-sm text-muted-foreground">Discover challenges and earn rewards</p>
        </div>
        <Button asChild className="gradient-primary">
          <Link to="/create">
            <Zap className="mr-2 h-4 w-4" />
            Create Quest
          </Link>
        </Button>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quest Grid */}
          {isLoading ? (
            <div className="text-center py-12">Loading quests...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuests?.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link to={`/quest/${quest.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer h-full">
                      <div className="relative h-48">
                        <img
                          src={quest.image}
                          alt={quest.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex gap-2">
                          <Badge className={`${getTierColor(quest.tier)} text-white`}>
                            {quest.tier.toUpperCase()}
                          </Badge>
                          <Badge className={`${getDifficultyColor(quest.difficulty)} text-white`}>
                            {quest.difficulty.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge className="absolute top-2 right-2 gradient-primary">
                          {quest.xpReward} XP
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs">
                            {quest.category}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{quest.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {quest.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{quest.participants} joined</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{quest.duration}</span>
                          </div>
                        </div>
                        {quest.usdcReward && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-green-500">
                                💰 ${quest.usdcReward} USDC
                              </span>
                            </div>
                          </div>
                        )}
                        {quest.voucherReward && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-xs font-semibold text-accent">
                              🎁 {quest.voucherReward}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {filteredQuests?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No quests found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BrowseQuests;