import React, { useState } from 'react';
import { Lock, LogOut, RefreshCw, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FullAdminAuthGateProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const FullAdminAuthGate: React.FC<FullAdminAuthGateProps> = ({
  title = 'Internal Access Gate',
  subtitle = 'Access Restricted to Full Administrators',
  children,
}) => {
  const { user, isFullAdmin, role, loading, signIn, signOut } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await signIn(emailInput.trim(), passwordInput);
    } catch (err: any) {
      console.error('Admin gate authentication error:', err);
      setLoginError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-[#1C1A17] text-[#FAF7F2]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#A98860] mb-4" />
        <p className="text-xs tracking-widest uppercase font-mono text-[#9B9488]">
          Authenticating security privileges...
        </p>
      </div>
    );
  }

  if (!isFullAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#141312] text-[#FAF7F2]">
        <div className="max-w-md w-full bg-[#1C1A17] border border-[#3E3A34] p-8 rounded-[2px] shadow-2xl space-y-6 text-start">
          <div className="flex items-center space-x-3 [dir=rtl]:space-x-reverse">
            <div className="w-10 h-10 rounded-[2px] bg-[#A98860]/10 border border-[#A98860]/30 flex items-center justify-center text-[#A98860]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-serif tracking-wide text-[#FAF7F2]">
                {title}
              </h1>
              <p className="text-xs text-[#9B9488] font-mono">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#24211D] border border-[#332F28] rounded-[2px] text-xs text-[#9B9488] space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-[#7A736A]">Auth Status:</span>
              <span className="text-[#A98860]">
                {user ? `Signed In (${user.email})` : 'Unauthenticated'}
              </span>
            </div>
            {user && (
              <div className="flex justify-between">
                <span className="text-[#7A736A]">Role:</span>
                <span className="text-[#FAF7F2]">
                  {role ? role : 'No administrative role (Customer)'}
                </span>
              </div>
            )}
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#8C3B2E]/20 border border-[#8C3B2E]/50 rounded-[2px] text-xs text-[#E68A7E]">
                Your current account does not have the <code className="text-[#FAF7F2] font-mono">fullAdmin</code> role in the <code className="text-[#FAF7F2] font-mono">adminUsers</code> collection. Please authenticate with an authorized administrator account.
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full py-2.5 px-4 bg-[#2A2723] hover:bg-[#3E3A34] text-[#FAF7F2] text-xs font-mono tracking-wider uppercase rounded-[2px] flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Current Account</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-[#8C3B2E]/20 border border-[#8C3B2E]/50 rounded-[2px] text-xs text-[#E68A7E]">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-[#9B9488] mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@dahr.luxury"
                  className="w-full px-3 py-2 bg-[#2A2723] border border-[#3E3A34] rounded-[2px] text-sm text-[#FAF7F2] focus:outline-none focus:border-[#A98860] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9B9488] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-[#2A2723] border border-[#3E3A34] rounded-[2px] text-sm text-[#FAF7F2] focus:outline-none focus:border-[#A98860] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 bg-[#A98860] hover:bg-[#967750] disabled:opacity-50 text-[#1C1A17] font-semibold text-xs font-mono tracking-wider uppercase rounded-[2px] flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Authenticate & Access</span>
              </button>
            </form>
          )}

          <div className="border-t border-[#2E2B26] pt-4">
            <p className="text-[11px] text-[#7A736A] text-center font-mono">
              DAHR Fragrances Atelier • Restricted Development Component
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
