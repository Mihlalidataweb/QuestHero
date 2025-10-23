import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { payUSDC, paymentStatus } from '@/services/baseAccount';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransferDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    setLoading(true);
    setError(null);
    setTxId(null);
    try {
      const tx = await payUSDC({ amount, to });
      setTxId(tx.id);
    } catch (e: any) {
      setError(e?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer USDC</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm">Recipient address</label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="0x..." />
          </div>
          <div>
            <label className="text-sm">Amount (USD)</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25.00" />
          </div>
          {txId && <div className="text-xs text-muted-foreground">Transaction ID: {txId}</div>}
          {error && <div className="text-xs text-red-500">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
          <Button disabled={loading || !to || !amount} onClick={onConfirm}>
            {loading ? 'Processing…' : 'Confirm Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};