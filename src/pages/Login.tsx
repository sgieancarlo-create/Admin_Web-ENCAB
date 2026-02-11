import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const iconSize = 20;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-maroon-dark px-4 py-8">
      {/* Subtle grid pattern */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size_48px_48px]" aria-hidden />

      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/[0.08] bg-maroon-card shadow-2xl ring-1 ring-white/[0.06]">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-maroon-accent via-maroon-accent/80 to-maroon-accent/50" aria-hidden />

        <div className="p- sm:p-10">
          {/* Branding */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 ring-2 ring-white/10 shadow-inner">
              <img
                src="/ccshs-seal.png"
                alt=""
                className="h-14 w-14 object-contain"
                aria-hidden
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Registrar Admin
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Sign in to manage enrollments
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Username or email
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] transition-colors focus-within:border-maroon-accent/50 focus-within:ring-2 focus-within:ring-maroon-accent/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white/40">
                  <User size={iconSize} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  placeholder="Enter your username or email"
                  className="min-w-0 flex-1 border-0 bg-transparent py-3 pr-4 text-base text-white placeholder:text-white/30 outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Password
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] transition-colors focus-within:border-maroon-accent/50 focus-within:ring-2 focus-within:ring-maroon-accent/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white/40">
                  <Lock size={iconSize} strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="min-w-0 flex-1 border-0 bg-transparent py-3 pr-4 text-base text-white placeholder:text-white/30 outline-none"
                />
              </div>
            </label>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={18} strokeWidth={2} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl bg-maroon-accent py-3.5 px-4 text-base font-semibold text-white shadow-lg shadow-maroon-accent/25 transition-all hover:bg-maroon-accent/90 hover:shadow-maroon-accent/30 focus:outline-none focus:ring-2 focus:ring-maroon-accent focus:ring-offset-2 focus:ring-offset-maroon-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogIn size={iconSize} strokeWidth={2} aria-hidden />
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40">
            Authorized personnel only. All access is logged.
          </p>
        </div>
      </div>
    </div>
  );
}
