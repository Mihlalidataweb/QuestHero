import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignInButton } from '@/components/auth/SignInButton';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
  const { loading } = useAuth();
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Sign in to continue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Connect your Base-compatible wallet to create your profile. We’ll generate a username from your wallet address.
          </p>
          <div className="flex justify-center">
            <SignInButton />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {loading ? 'Preparing wallet connection…' : 'No redirects. Secure sign-in with your wallet.'}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            By signing in, a user record is created and linked to your wallet address.
          </div>
          <div className="flex justify-center">
            <Button variant="link" asChild>
              <a href="https://docs.base.org/base-account" target="_blank" rel="noreferrer">Learn about Base Account</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}