import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const iconSize = 20;
const iconSizeSm = 18;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  const navLinkClass = (path: string) =>
    `flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-[0.9375rem] font-medium no-underline transition-all hover:no-underline ${
      isActive(path)
        ? 'bg-maroon-accent/25 text-white shadow-sm ring-1 ring-maroon-accent/30'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`;

  const navLinks = (
    <>
      <Link to="/" className={navLinkClass('/')} onClick={() => setMobileNavOpen(false)}>
        <LayoutDashboard size={iconSize} strokeWidth={2} aria-hidden />
        Dashboard
      </Link>
      <Link to="/enrollments" className={navLinkClass('/enrollments')} onClick={() => setMobileNavOpen(false)}>
        <ClipboardList size={iconSize} strokeWidth={2} aria-hidden />
        Enrollments
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-maroon-dark">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-maroon/95 shadow-xl backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo / brand */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3 text-slate-100 no-underline transition-opacity hover:no-underline hover:text-white hover:opacity-95"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-2 ring-white/15 shadow-inner">
              <img
                src="/ccshs-seal.png"
                alt="School seal"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="block text-lg font-bold tracking-tight text-slate-100">
                Registrar Admin
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-white/60">
                <ShieldCheck size={12} strokeWidth={2} />
                Admin panel
              </span>
            </div>
            <span className="text-lg font-bold tracking-tight sm:hidden">Registrar</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navLinks}
          </nav>

          {/* Right: user + sign out (desktop) */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-4 md:flex">
              <div className="h-8 w-px bg-white/20" aria-hidden />
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-maroon-accent/20 text-maroon-accent">
                  <User size={iconSizeSm} strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">
                    {user?.name || user?.email}
                  </span>
                  <span className="text-xs text-white/60">Administrator</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition-all hover:border-red-500/40 hover:bg-red-500/15 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut size={iconSizeSm} strokeWidth={2} aria-hidden />
                Sign out
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileNavOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="border-t border-white/[0.08] bg-maroon/98 px-4 py-4 backdrop-blur-md md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Main">
              {navLinks}
            </nav>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon-accent/20 text-maroon-accent">
                <User size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">
                  {user?.name || user?.email}
                </span>
                <span className="text-xs text-white/60">Administrator</span>
              </div>
              <button
                type="button"
                onClick={() => { setMobileNavOpen(false); handleLogout(); }}
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-red-500/15 hover:text-white"
              >
                <LogOut size={18} strokeWidth={2} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
