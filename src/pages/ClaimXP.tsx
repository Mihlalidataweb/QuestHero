import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Wallet, DollarSign, Zap, Clock, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const ClaimXP = () => {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [xpAmount, setXpAmount] = useState('');
  
  // Exchange rate: 100 XP = 1 USDC
  const exchangeRate = 100;
  const usdcAmount = xpAmount ? (parseFloat(xpAmount) / exchangeRate).toFixed(2) : '0.00';
  const availableXP = userProfile?.xp || 0;

  const handleTransfer = () => {
    toast({
      title: "Coming Soon! 🚀",
      description: "XP to USDC transfer feature will be available soon. Stay tuned!",
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">XP to USDC Exchange</h1>
          <p className="text-sm text-muted-foreground">Convert your XP points to USDC on Base network</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">Coming Soon</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      XP to USDC exchange feature is currently in development. Preview the interface below!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Exchange Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden border-primary/50">
              <div className="gradient-primary p-8 text-center">
                <ArrowRightLeft className="h-16 w-16 mx-auto mb-4 text-white" />
                <h2 className="text-3xl font-bold text-white mb-2">XP Exchange</h2>
                <p className="text-white/80">Convert your experience points to USDC</p>
              </div>
            </Card>
          </motion.div>

          {/* User Balance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Zap className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{availableXP.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Available XP</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">${(availableXP / exchangeRate).toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Max USDC Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'Not Connected'}</div>
                      <div className="text-sm text-muted-foreground">Base Wallet</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Exchange Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Exchange XP for USDC</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Current rate: {exchangeRate} XP = 1 USDC
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="xp-amount">XP Amount</Label>
                  <Input
                    id="xp-amount"
                    type="number"
                    placeholder="Enter XP amount"
                    value={xpAmount}
                    onChange={(e) => setXpAmount(e.target.value)}
                    max={availableXP}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum: {availableXP.toLocaleString()} XP
                  </p>
                </div>

                <div className="flex items-center justify-center py-4">
                  <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <Label>USDC Amount</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={`$${usdcAmount}`}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                    <Badge variant="outline">USDC</Badge>
                  </div>
                </div>

                <Button 
                  className="w-full gradient-primary" 
                  size="lg"
                  onClick={handleTransfer}
                  disabled
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Transfer to Base Wallet (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Exchange Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <div>
                        <div className="font-semibold">Earn XP Points</div>
                        <div className="text-sm text-muted-foreground">
                          Complete quests and activities to accumulate XP
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      <div>
                        <div className="font-semibold">Convert to USDC</div>
                        <div className="text-sm text-muted-foreground">
                          Exchange your XP at a rate of 100 XP = 1 USDC
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      <div>
                        <div className="font-semibold">Receive on Base</div>
                        <div className="text-sm text-muted-foreground">
                          USDC is transferred directly to your Base wallet
                        </div>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Earn More XP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Complete Quests</div>
                        <div className="text-sm text-muted-foreground">
                          Earn 50-500 XP per quest completion
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Create Popular Quests</div>
                        <div className="text-sm text-muted-foreground">
                          Get bonus XP when others join your quests
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Daily Activities</div>
                        <div className="text-sm text-muted-foreground">
                          Login bonuses and streak rewards
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Community Participation</div>
                        <div className="text-sm text-muted-foreground">
                          Vote on submissions and help others
                        </div>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ClaimXP;