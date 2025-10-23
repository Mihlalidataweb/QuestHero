import React from 'react';
import { SignInWithBaseButton } from '@base-org/account-ui/react';
import { useAuth } from '@/contexts/AuthContext';

export const SignInButton: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (isAuthenticated) {
    const short = `${user!.address.slice(0, 6)}…${user!.address.slice(-4)}`;
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{short}</span>
        <button
          className="text-xs px-2 py-1 rounded bg-sidebar-accent hover:bg-sidebar-accent/70"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <SignInWithBaseButton
      align="center"
      variant="solid"
      colorScheme="system"
      onClick={() => login()}
    />
  );
};