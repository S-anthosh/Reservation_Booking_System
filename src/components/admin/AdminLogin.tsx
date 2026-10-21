import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  AlertCircle,
  Database,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';
import { supabase, isSupabaseConfigured, setCustomSupabaseCredentials } from '../../lib/supabase';
import { checkIsAdmin } from '../../lib/data-service';

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToPublic,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [resending, setResending] = useState(false);

  const handleDemoAccess = () => {
    onLoginSuccess({
      id: 'demo-admin-uuid-001',
      email: email.trim() || 'admin@aurelia.com',
      user_metadata: { role: 'admin' },
    });
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMsg('Please enter your email above to resend the confirmation link.');
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) throw error;
      setInfoMsg(`Verification email resent to ${email}. Check your inbox & spam folder!`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (!isSupabaseConfigured) {
        // Fallback for local demo mode without configured Supabase
        handleDemoAccess();
        return;
      }

      if (authMode === 'register') {
        // Sign up flow
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.user) {
          // If session is immediately active (email confirmation disabled in Supabase)
          if (data.session) {
            // Add user to admin_users table
            try {
              await supabase.from('admin_users').upsert({ user_id: data.user.id });
            } catch (err) {
              console.warn('Could not auto-add to admin_users:', err);
            }

            const isAdmin = await checkIsAdmin(data.user.id);
            if (isAdmin) {
              onLoginSuccess(data.user);
              return;
            }
          }

          setInfoMsg(
            'Account created! If your Supabase project requires email confirmation, please check your inbox (or turn off "Confirm email" in Supabase Auth Settings). You can also use Preview Mode below.'
          );
          setAuthMode('signin');
        }
        return;
      }

      // Standard Sign In flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMsg(
            'Invalid login credentials. This user might not exist in your Supabase Auth project yet. Switch to "Create New Admin" above to register, or use "Quick Demo Access" below.'
          );
          return;
        }
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMsg(
            'Email not confirmed: Supabase blocked the login because this email has not been verified yet.'
          );
          return;
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('Authentication failed. No user returned.');
      }

      const isAdmin = await checkIsAdmin(data.user.id);

      if (isAdmin) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg('You are signed in, but you are not authorized as an admin.');
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = () => {
    const sqlScript = `-- 1. Add your user to admin_users table in Supabase SQL editor:
-- (Replace '<YOUR_USER_ID>' with your actual auth.users UUID)
INSERT INTO admin_users (user_id) 
VALUES ('<YOUR_USER_ID>') 
ON CONFLICT DO NOTHING;`;
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl && customKey) {
      setCustomSupabaseCredentials(customUrl, customKey);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0d] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#c59b43]/5 blur-[160px] pointer-events-none" />

      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onBackToPublic}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#9ca3af] hover:text-white transition-colors cursor-pointer bg-[#141620] px-3.5 py-2 rounded-lg border border-[#232736]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Website</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg border border-[#c59b43]/40 bg-[#141620] flex items-center justify-center text-[#d4a754] font-serif text-2xl font-bold mx-auto mb-4 shadow-xl">
            A
          </div>
          <h2 className="font-serif text-3xl font-light text-[#fbf9f5] tracking-wide">
            Aurelia Management
          </h2>
          <p className="mt-1 text-xs text-[#9ca3af]">
            Secure administrative control portal
          </p>
        </div>

        <div className="bg-[#12141c] py-8 px-6 sm:px-10 shadow-2xl rounded-xl border border-[#232736]">
          {/* Auth Mode Toggle */}
          <div className="flex rounded-lg bg-[#161822] p-1 border border-[#242837] mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-[#c59b43] text-black shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#c59b43] text-black shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              Create New Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded bg-[#201819] border border-[#5c2729] text-xs text-[#e57373] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#ef5350] mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="leading-relaxed font-medium">{errorMsg}</p>

                  {errorMsg.toLowerCase().includes('email not confirmed') && (
                    <div className="p-2.5 rounded bg-[#2a1b1d] border border-[#482025] space-y-1.5 text-[11px] text-[#fca5a5]">
                      <p>
                        <strong>How to solve this in Supabase:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-[10px] text-[#e2e8f0]">
                        <li>
                          <strong>Option A:</strong> Check your email inbox &amp; spam folder to click the confirmation link.
                        </li>
                        <li>
                          <strong>Option B:</strong> In your <strong>Supabase Dashboard &rarr; Authentication &rarr; Providers &rarr; Email</strong>, switch OFF <em>"Confirm email"</em>.
                        </li>
                        <li>
                          <strong>Option C:</strong> In <strong>Supabase &rarr; Authentication &rarr; Users</strong>, click the <strong>•••</strong> next to your user &rarr; <em>"Confirm Email"</em>.
                        </li>
                      </ul>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleResendConfirmation}
                          disabled={resending}
                          className="px-2.5 py-1 rounded bg-[#3b2024] hover:bg-[#4d282e] text-white text-[11px] font-semibold border border-[#5c2729] transition-colors cursor-pointer"
                        >
                          {resending ? 'Resending Link...' : 'Resend Confirmation Email'}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleDemoAccess}
                    className="text-[11px] font-semibold text-[#fcd34d] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Or click here to bypass and enter Dashboard in Demo Mode &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {infoMsg && (
              <div className="p-3.5 rounded bg-[#132219] border border-[#254f33] text-xs text-[#86efac] flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 text-[#4ade80] mt-0.5" />
                <p className="leading-relaxed">{infoMsg}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                {authMode === 'register' ? 'New Admin Email' : 'Admin Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
                <input
                  type="email"
                  required
                  placeholder="admin@aurelia-dining.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#d4a754]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#d4a754]"
                />
              </div>
              {authMode === 'register' && (
                <span className="text-[10px] text-[#6b7280] mt-1 block">
                  Password must be at least 6 characters.
                </span>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-[#0c0d0e] bg-gradient-to-r from-[#d4a754] via-[#e2bd6e] to-[#c59b43] hover:from-[#e2bd6e] hover:to-[#d4a754] shadow-lg shadow-[#c59b43]/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Admin Authorization...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-black" />
                    <span>{authMode === 'register' ? 'Register & Access Dashboard' : 'Sign In to Dashboard'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-5 pt-4 border-t border-[#1f2230] space-y-3">
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-[#181a24] text-[#cbd5e1] hover:text-white hover:bg-[#232735] border border-[#2a2f40] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#c59b43]" />
              <span>Instant Preview Mode (Bypass Supabase Login)</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowConfigModal(!showConfigModal)}
                className="text-xs text-[#9ca3af] hover:text-[#d4a754] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-[#c59b43]" />
                <span>Supabase Connection &amp; SQL Setup Helper</span>
              </button>
            </div>
          </div>
        </div>

        {showConfigModal && (
          <div className="mt-6 bg-[#12141c] border border-[#262a38] rounded-xl p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#212432]">
              <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#c59b43]" />
                <span>Supabase Integration Guide</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  isSupabaseConfigured
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                }`}
              >
                {isSupabaseConfigured ? 'Supabase Connected' : 'Waiting for Credentials'}
              </span>
            </div>

            <p className="text-[#9ca3af] leading-relaxed">
              To connect your real database, provide your Supabase project URL and anon key in{' '}
              <code className="text-white">.env</code> or enter them here to store in browser memory:
            </p>

            <form onSubmit={handleSaveCredentials} className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#6b7280] mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white placeholder-[#4b5563] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#6b7280] mb-1">Supabase Anon Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white placeholder-[#4b5563] text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#c59b43] text-black font-semibold rounded hover:bg-[#d4a754] transition-colors cursor-pointer"
                >
                  Save &amp; Reload Client
                </button>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#191c28] text-[#cbd5e1] border border-[#2c3245] rounded hover:text-white cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Admin SQL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Admin User SQL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
